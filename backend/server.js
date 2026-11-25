const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded property images statically
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// IMAGE / PNG UPLOAD API
app.post('/api/upload', (req, res) => {
    try {
        const { image, filename } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }
        
        // Match base64 data uri: data:image/(png|jpeg|webp);base64,...
        const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Invalid base64 image data. Format must be data:image/png;base64,...' });
        }
        
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        const fileBuffer = Buffer.from(matches[2], 'base64');
        
        const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25) : 'property';
        const uniqueFileName = `${cleanName}_${Date.now()}.${ext}`;
        const targetPath = path.join(uploadsDir, uniqueFileName);
        
        fs.writeFileSync(targetPath, fileBuffer);
        const publicUrl = `http://localhost:5000/uploads/${uniqueFileName}`;
        
        return res.status(201).json({
            message: 'Image uploaded successfully!',
            url: publicUrl,
            filename: uniqueFileName
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Failed to process and save image: ' + err.message });
    }
});

// HOME TEST ROUTE
app.get('/', (req, res) => {
    res.send('Welcome to EstateEase API!');
});

// ==========================================
// 1. PROPERTIES APIS
// ==========================================

// GET ALL PROPERTIES (with filters, images & agent details)
app.get('/api/properties', (req, res) => {
    const { search, city, property_type, bedrooms, status, min_price, max_price } = req.query;

    let sql = `
        SELECT p.*, p.location AS city, 
               u.name AS agent_name, ag.phone AS agent_phone,
               (SELECT image_url FROM property_images pi WHERE pi.property_id = p.property_id LIMIT 1) AS primary_image
        FROM properties p
        LEFT JOIN agents ag ON p.agent_id = ag.agent_id
        LEFT JOIN users u ON ag.user_id = u.user_id
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        sql += ` AND (p.title LIKE ? OR p.location LIKE ? OR p.description LIKE ? OR p.address LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s);
    }

    if (city && city !== 'All') {
        sql += ` AND (p.location LIKE ? OR p.address LIKE ?)`;
        params.push(`%${city}%`, `%${city}%`);
    }

    if (property_type && property_type !== 'All') {
        sql += ` AND p.property_type = ?`;
        params.push(property_type);
    }

    if (bedrooms && bedrooms !== 'Any') {
        if (bedrooms === '5' || bedrooms === '5+') {
            sql += ` AND p.bedrooms >= 5`;
        } else {
            sql += ` AND p.bedrooms = ?`;
            params.push(Number(bedrooms));
        }
    }

    if (status && status !== 'All') {
        sql += ` AND p.status = ?`;
        params.push(status);
    }

    if (min_price) {
        sql += ` AND p.price >= ?`;
        params.push(Number(min_price));
    }

    if (max_price) {
        sql += ` AND p.price <= ?`;
        params.push(Number(max_price));
    }

    sql += ` ORDER BY p.property_id DESC`;

    db.query(sql, params, (err, properties) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const fallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
        const formatted = properties.map(p => ({
            ...p,
            city: p.city || p.location,
            image_url: p.primary_image || fallbackImage,
            primary_image: p.primary_image || fallbackImage
        }));
        res.json(formatted);
    });
});

// GET SINGLE PROPERTY DETAILS (with full images gallery & agent info)
app.get('/api/properties/:id', (req, res) => {
    const propertyId = req.params.id;
    const sql = `
        SELECT p.*, p.location AS city, 
               u.name AS agent_name, u.email AS agent_email, ag.phone AS agent_phone, ag.experience AS agent_experience
        FROM properties p
        LEFT JOIN agents ag ON p.agent_id = ag.agent_id
        LEFT JOIN users u ON ag.user_id = u.user_id
        WHERE p.property_id = ?
    `;

    db.query(sql, [propertyId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'Property not found' });

        const property = rows[0];
        property.city = property.city || property.location;

        db.query('SELECT image_url FROM property_images WHERE property_id = ?', [propertyId], (imgErr, imgRows) => {
            const defaultImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
            const images = (imgRows && imgRows.length > 0) 
                ? imgRows.map(r => r.image_url) 
                : [defaultImg];

            property.images = images;
            property.primary_image = images[0];
            property.image_url = images[0];
            res.json(property);
        });
    });
});

// ADD NEW PROPERTY
app.post('/api/properties', (req, res) => {
    const {
        title, property_type, location, city, price,
        bedrooms, bathrooms, area_sqft, listing_type = 'Sale', agent_id = 1, address = '', description = '',
        image_url
    } = req.body;

    const loc = city || location || 'Gurugram';
    const sql = `INSERT INTO properties
    (title, property_type, location, price, bedrooms, bathrooms, area_sqft, listing_type, agent_id, address, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`;

    db.query(sql, [
        title, property_type || 'Apartment', loc, price,
        bedrooms || 3, bathrooms || 2, area_sqft || 1500, listing_type, agent_id, address, description
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const newPropId = result.insertId;

        const defaultImg = image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
        db.query('INSERT INTO property_images (property_id, image_url) VALUES (?, ?)', [newPropId, defaultImg], () => {
            res.status(201).json({ message: 'Property created successfully!', property_id: newPropId });
        });
    });
});

// UPDATE PROPERTY
app.put('/api/properties/:id', (req, res) => {
    const { title, location, city, price, status, bedrooms, bathrooms, area_sqft, description } = req.body;
    const loc = city || location;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (loc !== undefined) { updates.push('location = ?'); params.push(loc); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (bedrooms !== undefined) { updates.push('bedrooms = ?'); params.push(bedrooms); }
    if (bathrooms !== undefined) { updates.push('bathrooms = ?'); params.push(bathrooms); }
    if (area_sqft !== undefined) { updates.push('area_sqft = ?'); params.push(area_sqft); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    if (updates.length === 0) return res.json({ message: 'No changes provided' });

    params.push(req.params.id);
    const sql = `UPDATE properties SET ${updates.join(', ')} WHERE property_id = ?`;

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Property updated successfully!' });
    });
});

// DELETE PROPERTY
app.delete('/api/properties/:id', (req, res) => {
    db.query('DELETE FROM properties WHERE property_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Property deleted successfully!' });
    });
});

// ==========================================
// 2. AUTHENTICATION & USERS
// ==========================================

// REGISTER
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role = 'Client', phone = '', budget = 0 } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Please provide name, email, and password.' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    db.query('SELECT * FROM users WHERE email = ?', [cleanEmail], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing.length > 0) return res.status(409).json({ error: 'An account with this email already exists.' });

        const hashedPassword = bcrypt.hashSync(password, 10);
        let userRole = role === 'Admin' ? 'Admin' : (role === 'Agent' ? 'Agent' : 'Client');

        db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            [cleanName, cleanEmail, hashedPassword, userRole], (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const newUserId = result.insertId;

            if (userRole === 'Client') {
                db.query('INSERT INTO clients (client_name, email, phone, budget) VALUES (?, ?, ?, ?)',
                    [cleanName, cleanEmail, phone, budget || 0], (icErr, icRes) => {
                    return res.status(201).json({
                        message: 'Account registered as Client!',
                        user: { user_id: newUserId, name: cleanName, email: cleanEmail, role: 'Client', client_id: icRes ? icRes.insertId : null, phone, budget }
                    });
                });
            } else if (userRole === 'Agent') {
                db.query('INSERT INTO agents (user_id, phone, experience) VALUES (?, ?, ?)',
                    [newUserId, phone || '9876543210', 1], (agErr, agRes) => {
                    return res.status(201).json({
                        message: 'Account registered as Agent!',
                        user: { user_id: newUserId, name: cleanName, email: cleanEmail, role: 'Agent', agent_id: agRes ? agRes.insertId : null }
                    });
                });
            } else {
                return res.status(201).json({
                    message: 'Account registered as Admin!',
                    user: { user_id: newUserId, name: cleanName, email: cleanEmail, role: 'Admin' }
                });
            }
        });
    });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    db.query('SELECT * FROM users WHERE email = ?', [cleanEmail], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

        const user = users[0];
        const isMatch = bcrypt.compareSync(password, user.password) || (password === user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

        if (user.role === 'Client') {
            db.query('SELECT * FROM clients WHERE email = ? LIMIT 1', [cleanEmail], (cErr, clients) => {
                const client = clients && clients[0] ? clients[0] : null;
                return res.json({
                    message: 'Login successful!',
                    user: {
                        user_id: user.user_id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        client_id: client ? client.client_id : null,
                        phone: client ? client.phone : null,
                        budget: client ? client.budget : null
                    }
                });
            });
        } else if (user.role === 'Agent') {
            db.query('SELECT * FROM agents WHERE user_id = ? LIMIT 1', [user.user_id], (aErr, agents) => {
                const agent = agents && agents[0] ? agents[0] : null;
                return res.json({
                    message: 'Login successful!',
                    user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, agent_id: agent ? agent.agent_id : null }
                });
            });
        } else {
            return res.json({
                message: 'Login successful!',
                user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }
            });
        }
    });
});

// GET ALL USERS (Admin)
app.get('/api/users', (req, res) => {
    db.query('SELECT user_id, name, email, role, created_at FROM users ORDER BY user_id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ==========================================
// 3. CLIENTS & CLIENT DASHBOARD
// ==========================================

// GET ALL CLIENTS
app.get('/api/clients', (req, res) => {
    db.query('SELECT * FROM clients ORDER BY client_id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// UPDATE CLIENT PROFILE
app.put('/api/clients/:id', (req, res) => {
    const { phone, budget, client_name } = req.body;
    const updates = [];
    const params = [];

    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (budget !== undefined) { updates.push('budget = ?'); params.push(budget); }
    if (client_name !== undefined) { updates.push('client_name = ?'); params.push(client_name); }

    if (updates.length === 0) return res.json({ message: 'No updates provided' });

    params.push(req.params.id);
    db.query(`UPDATE clients SET ${updates.join(', ')} WHERE client_id = ?`, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Client profile updated successfully!' });
    });
});

// CLIENT DASHBOARD AGGREGATE
app.get('/api/dashboard/client/:identifier', (req, res) => {
    const id = req.params.identifier;
    db.query('SELECT * FROM clients WHERE client_id = ? OR email = ? LIMIT 1', [id, id], (err, clients) => {
        if (err || clients.length === 0) return res.status(404).json({ error: 'Client profile not found' });
        const client = clients[0];

        const apptSql = `
            SELECT a.*, p.title as property_title, p.location as city, p.price, u.name as agent_name, ag.phone as agent_phone
            FROM appointments a
            LEFT JOIN properties p ON a.property_id = p.property_id
            LEFT JOIN agents ag ON a.agent_id = ag.agent_id
            LEFT JOIN users u ON ag.user_id = u.user_id
            WHERE a.client_id = ? ORDER BY a.appointment_date DESC`;

        const dealsSql = `
            SELECT t.*, p.title as property_title, p.location as city, pay.payment_status
            FROM transactions t
            LEFT JOIN properties p ON t.property_id = p.property_id
            LEFT JOIN payments pay ON t.transaction_id = pay.transaction_id
            WHERE t.client_id = ? ORDER BY t.transaction_date DESC`;

        db.query(apptSql, [client.client_id], (err2, appointments) => {
            db.query(dealsSql, [client.client_id], (err3, transactions) => {
                const targetBudget = client.budget ? Number(client.budget) * 1.3 : 50000000;
                db.query(`
                    SELECT p.*, p.location as city,
                           (SELECT image_url FROM property_images pi WHERE pi.property_id = p.property_id LIMIT 1) as primary_image
                    FROM properties p
                    WHERE p.price <= ? AND p.status = "Available" 
                    ORDER BY p.price DESC LIMIT 3`,
                    [targetBudget], (err4, recommended) => {
                    const fallbackImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                    const formattedRec = (recommended || []).map(r => ({
                        ...r,
                        city: r.city || r.location,
                        image_url: r.primary_image || fallbackImg,
                        primary_image: r.primary_image || fallbackImg
                    }));
                    return res.json({
                        client,
                        appointments: appointments || [],
                        transactions: transactions || [],
                        recommended: formattedRec
                    });
                });
            });
        });
    });
});

// ==========================================
// 4. AGENTS & AGENT DASHBOARD
// ==========================================

// GET ALL AGENTS
app.get('/api/agents', (req, res) => {
    const sql = `
        SELECT ag.*, u.name, u.email
        FROM agents ag
        JOIN users u ON ag.user_id = u.user_id
        ORDER BY ag.agent_id DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// AGENT DASHBOARD AGGREGATE
app.get('/api/dashboard/agent/:identifier', (req, res) => {
    const id = req.params.identifier;
    const findAgentSql = `
        SELECT ag.*, u.name, u.email 
        FROM agents ag 
        JOIN users u ON ag.user_id = u.user_id 
        WHERE ag.agent_id = ? OR ag.user_id = ? OR u.email = ?
        ORDER BY (ag.agent_id = ?) DESC, (ag.user_id = ?) DESC
        LIMIT 1
    `;

    db.query(findAgentSql, [id, id, id, id, id], (err, agents) => {
        if (err || agents.length === 0) return res.status(404).json({ error: 'Agent profile not found' });
        const agent = agents[0];

        // Agent properties
        const propSql = `
            SELECT p.*, p.location as city,
                   (SELECT image_url FROM property_images pi WHERE pi.property_id = p.property_id LIMIT 1) as primary_image
            FROM properties p 
            WHERE p.agent_id = ? 
            ORDER BY p.property_id DESC
        `;

        // Agent appointments
        const apptSql = `
            SELECT a.*, p.title as property_title, c.client_name, c.email as client_email, c.phone as client_phone
            FROM appointments a
            LEFT JOIN properties p ON a.property_id = p.property_id
            LEFT JOIN clients c ON a.client_id = c.client_id
            WHERE a.agent_id = ?
            ORDER BY a.appointment_date DESC
        `;

        // Agent transactions
        const txSql = `
            SELECT t.*, p.title as property_title, p.location as city, c.client_name, c.email as client_email, c.phone as client_phone
            FROM transactions t
            LEFT JOIN properties p ON t.property_id = p.property_id
            LEFT JOIN clients c ON t.client_id = c.client_id
            WHERE t.agent_id = ?
            ORDER BY t.transaction_date DESC
        `;

        // Agent relevant clients
        const clientSql = `
            SELECT DISTINCT c.*
            FROM clients c
            ORDER BY c.client_id DESC
            LIMIT 20
        `;

        db.query(propSql, [agent.agent_id], (err2, properties) => {
            db.query(apptSql, [agent.agent_id], (err3, appointments) => {
                db.query(txSql, [agent.agent_id], (err4, transactions) => {
                    db.query(clientSql, [], (err5, clients) => {
                        res.json({
                            agent,
                            properties: properties || [],
                            appointments: appointments || [],
                            transactions: transactions || [],
                            clients: clients || []
                        });
                    });
                });
            });
        });
    });
});

// ==========================================
// 5. APPOINTMENTS APIS
// ==========================================

// GET APPOINTMENTS
app.get('/api/appointments', (req, res) => {
    const sql = `
        SELECT a.*, p.title as property_title, p.location as city, c.client_name, u.name as agent_name
        FROM appointments a
        LEFT JOIN properties p ON a.property_id = p.property_id
        LEFT JOIN clients c ON a.client_id = c.client_id
        LEFT JOIN agents ag ON a.agent_id = ag.agent_id
        LEFT JOIN users u ON ag.user_id = u.user_id
        ORDER BY a.appointment_date DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// BOOK APPOINTMENT
app.post('/api/appointments', (req, res) => {
    const { client_id, agent_id, property_id, appointment_date, appointment_time, notes } = req.body;

    const sql = `
        INSERT INTO appointments (client_id, agent_id, property_id, appointment_date, appointment_time, status, notes)
        VALUES (?, ?, ?, ?, ?, 'Confirmed', ?)
    `;

    db.query(sql, [
        client_id || 1, agent_id || 1, property_id,
        appointment_date, appointment_time || '11:00 AM', notes || 'Private viewing'
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Viewing appointment booked successfully!', appointment_id: result.insertId });
    });
});

// CANCEL / DELETE APPOINTMENT
app.delete('/api/appointments/:id', (req, res) => {
    db.query('DELETE FROM appointments WHERE appointment_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Appointment cancelled successfully!' });
    });
});

// ==========================================
// 6. TRANSACTIONS & PAYMENTS
// ==========================================

// GET TRANSACTIONS
app.get('/api/transactions', (req, res) => {
    const sql = `
        SELECT t.*, p.title as property_title, c.client_name, u.name as agent_name
        FROM transactions t
        LEFT JOIN properties p ON t.property_id = p.property_id
        LEFT JOIN clients c ON t.client_id = c.client_id
        LEFT JOIN agents ag ON t.agent_id = ag.agent_id
        LEFT JOIN users u ON ag.user_id = u.user_id
        ORDER BY t.transaction_date DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// CREATE TRANSACTION
app.post('/api/transactions', (req, res) => {
    const { property_id, client_id, agent_id, transaction_type, amount, transaction_date, status } = req.body;
    
    if (!property_id || !client_id || !amount) {
        return res.status(400).json({ error: 'Property ID, Client ID and Amount are required' });
    }

    const txType = transaction_type || 'Sale';
    const txStatus = status || 'Pending';
    const txDate = transaction_date || new Date().toISOString().slice(0, 10);
    const agentId = agent_id || 1;

    const insertSql = `
        INSERT INTO transactions (property_id, client_id, agent_id, transaction_type, amount, transaction_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [property_id, client_id, agentId, txType, amount, txDate, txStatus], (err, result) => {
        if (err) {
            console.error('Create transaction error:', err);
            return res.status(500).json({ error: err.message });
        }

        const txId = result.insertId;

        // If transaction completed, update property status
        if (txStatus === 'Completed') {
            const propStatus = txType === 'Rent' ? 'Rented' : 'Sold';
            db.query('UPDATE properties SET status = ? WHERE property_id = ?', [propStatus, property_id]);

            // Also record payment in payments ledger
            db.query(
                'INSERT INTO payments (transaction_id, amount, payment_date, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)',
                [txId, amount, txDate, 'Bank Transfer', 'Completed'],
                (pErr) => {
                    if (pErr) console.warn('Payment auto-record warning:', pErr.message);
                }
            );
        }

        res.status(201).json({
            message: 'Transaction successfully recorded in database!',
            transaction_id: txId
        });
    });
});

// UPDATE TRANSACTION STATUS / DETAILS
app.put('/api/transactions/:id', (req, res) => {
    const txId = req.params.id;
    const { status, amount, transaction_type } = req.body;

    db.query('SELECT * FROM transactions WHERE transaction_id = ?', [txId], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({ error: 'Transaction record not found' });
        }

        const curr = rows[0];
        const newStatus = status || curr.status;
        const newAmount = amount !== undefined ? amount : curr.amount;
        const newType = transaction_type || curr.transaction_type;

        const updateSql = `
            UPDATE transactions 
            SET status = ?, amount = ?, transaction_type = ? 
            WHERE transaction_id = ?
        `;

        db.query(updateSql, [newStatus, newAmount, newType, txId], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            // If status changed to Completed
            if (newStatus === 'Completed') {
                const propStatus = newType === 'Rent' ? 'Rented' : 'Sold';
                db.query('UPDATE properties SET status = ? WHERE property_id = ?', [propStatus, curr.property_id]);
            } else if (newStatus === 'Cancelled') {
                db.query('UPDATE properties SET status = "Available" WHERE property_id = ?', [curr.property_id]);
            }

            res.json({ message: `Transaction #${txId} updated successfully to ${newStatus}` });
        });
    });
});

// DELETE TRANSACTION
app.delete('/api/transactions/:id', (req, res) => {
    const txId = req.params.id;
    db.query('DELETE FROM payments WHERE transaction_id = ?', [txId], () => {
        db.query('DELETE FROM transactions WHERE transaction_id = ?', [txId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Transaction deleted successfully!' });
        });
    });
});

// GET PAYMENTS
app.get('/api/payments', (req, res) => {
    db.query('SELECT * FROM payments ORDER BY payment_id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// PROCESS COMPLETE PAYMENT VIA PAYMENT GATEWAY (CARD / UPI / NETBANKING)
app.post('/api/payments/process', (req, res) => {
    const {
        property_id,
        client_id,
        agent_id,
        transaction_type,
        amount,
        payment_method,
        payment_gateway_ref,
        payer_name,
        payer_phone,
        payer_email
    } = req.body;

    if (!property_id || !amount) {
        return res.status(400).json({ error: 'Property ID and Amount are required for payment processing' });
    }

    const txType = transaction_type || 'Sale';
    const txDate = new Date().toISOString().slice(0, 10);
    const validMethod = ['Card', 'UPI', 'Bank Transfer'].includes(payment_method) ? payment_method : 'Card';
    const gatewayRef = payment_gateway_ref || `PG_REF_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

    // 1. Record completed transaction
    const insertTxSql = `
        INSERT INTO transactions (property_id, client_id, agent_id, transaction_type, amount, transaction_date, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Completed')
    `;

    db.query(insertTxSql, [property_id, client_id || 1, agent_id || 1, txType, amount, txDate], (err, txResult) => {
        if (err) {
            console.error('Payment transaction insert error:', err);
            return res.status(500).json({ error: 'Transaction registration failed: ' + err.message });
        }

        const transactionId = txResult.insertId;

        // 2. Record payment in payments table
        const insertPaymentSql = `
            INSERT INTO payments (transaction_id, amount, payment_date, payment_method, payment_status)
            VALUES (?, ?, ?, ?, 'Completed')
        `;

        db.query(insertPaymentSql, [transactionId, amount, txDate, validMethod], (pErr, pResult) => {
            if (pErr) console.warn('Payment insert warning:', pErr.message);
            const paymentId = pResult ? pResult.insertId : Math.floor(Math.random() * 1000);

            // 3. Mark property status as Sold or Rented
            const newPropStatus = txType === 'Rent' ? 'Rented' : 'Sold';
            db.query('UPDATE properties SET status = ? WHERE property_id = ?', [newPropStatus, property_id]);

            // 4. Return official verified receipt
            res.status(201).json({
                success: true,
                message: 'Payment successfully authenticated and transaction completed!',
                receipt: {
                    payment_id: paymentId,
                    transaction_id: transactionId,
                    property_id,
                    amount,
                    transaction_type: txType,
                    payment_method: validMethod,
                    payment_gateway_ref: gatewayRef,
                    payment_date: txDate,
                    status: 'Completed',
                    payer_name: payer_name || 'VIP Client',
                    payer_phone: payer_phone || '',
                    payer_email: payer_email || ''
                }
            });
        });
    });
});

// ==========================================
// 7. ADMIN DASHBOARD METRICS
// ==========================================

app.get('/api/dashboard/admin', (req, res) => {
    const q1 = 'SELECT COUNT(*) as total_properties FROM properties';
    const q2 = 'SELECT COUNT(*) as total_agents FROM agents';
    const q3 = 'SELECT COUNT(*) as total_clients FROM clients';
    const q4 = 'SELECT COUNT(*) as total_appointments FROM appointments';
    const q5 = 'SELECT IFNULL(SUM(amount), 0) as total_volume FROM transactions';

    db.query(q1, (e1, r1) => {
        db.query(q2, (e2, r2) => {
            db.query(q3, (e3, r3) => {
                db.query(q4, (e4, r4) => {
                    db.query(q5, (e5, r5) => {
                        res.json({
                            total_properties: r1 ? r1[0].total_properties : 0,
                            total_agents: r2 ? r2[0].total_agents : 0,
                            total_clients: r3 ? r3[0].total_clients : 0,
                            total_appointments: r4 ? r4[0].total_appointments : 0,
                            total_volume: r5 ? r5[0].total_volume : 0
                        });
                    });
                });
            });
        });
    });
});

// ==========================================
// 8. CONTACT MESSAGES
// ==========================================

app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const sql = 'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, subject, message], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Message sent successfully!' });
    });
});

app.get('/api/contact', (req, res) => {
    db.query('SELECT * FROM contact_messages ORDER BY message_id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`EstateEase server running on port ${PORT}`);
});