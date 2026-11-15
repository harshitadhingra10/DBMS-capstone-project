const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. AUTH: REGISTER (Client, Agent, Admin) ---
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

// --- 2. AUTH: LOGIN ---
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

// --- 3. CLIENT DASHBOARD AGGREGATE API ---
app.get('/api/dashboard/client/:identifier', (req, res) => {
    const id = req.params.identifier;
    db.query('SELECT * FROM clients WHERE client_id = ? OR email = ? LIMIT 1', [id, id], (err, clients) => {
        if (err || clients.length === 0) return res.status(404).json({ error: 'Client profile not found' });
        const client = clients[0];

        const apptSql = `
            SELECT a.*, p.title as property_title, p.city, p.price, u.name as agent_name, ag.phone as agent_phone
            FROM appointments a
            LEFT JOIN properties p ON a.property_id = p.property_id
            LEFT JOIN agents ag ON a.agent_id = ag.agent_id
            LEFT JOIN users u ON ag.user_id = u.user_id
            WHERE a.client_id = ? ORDER BY a.appointment_date DESC`;

        const dealsSql = `
            SELECT t.*, p.title as property_title, p.city, pay.status as payment_status
            FROM transactions t
            LEFT JOIN properties p ON t.property_id = p.property_id
            LEFT JOIN payments pay ON t.transaction_id = pay.transaction_id
            WHERE t.client_id = ? ORDER BY t.transaction_date DESC`;

        db.query(apptSql, [client.client_id], (err2, appointments) => {
            db.query(dealsSql, [client.client_id], (err3, transactions) => {
                db.query('SELECT * FROM properties WHERE price <= ? AND status = "Available" ORDER BY price DESC LIMIT 3',
                    [client.budget ? Number(client.budget) * 1.25 : 50000000], (err4, recommended) => {
                    return res.json({
                        client,
                        appointments: appointments || [],
                        transactions: transactions || [],
                        recommended: recommended || []
                    });
                });
            });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EstateEase server running on port ${PORT}`));