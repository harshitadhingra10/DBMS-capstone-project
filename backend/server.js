const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// HOME ROUTE
app.get('/', (req, res) => {
    res.send('Welcome to EstateEase API!');
});

// ================= PROPERTIES =================

// GET ALL PROPERTIES
app.get('/api/properties', (req, res) => {
    db.query('SELECT * FROM properties', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ADD PROPERTY
app.post('/api/properties', (req, res) => {
    const {
        title, property_type, location, price,
        bedrooms, bathrooms, area_sqft, listing_type, agent_id
    } = req.body;

    const sql = `INSERT INTO properties
    (title, property_type, location, price, bedrooms, bathrooms, area_sqft, listing_type, agent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
        title, property_type, location, price,
        bedrooms, bathrooms, area_sqft, listing_type, agent_id
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Property added successfully!' });
    });
});

// UPDATE PROPERTY
app.put('/api/properties/:id', (req, res) => {
    const { title, location, price } = req.body;

    const sql = 'UPDATE properties SET title=?, location=?, price=? WHERE property_id=?';

    db.query(sql, [title, location, price, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Property updated successfully!' });
    });
});

// DELETE PROPERTY
app.delete('/api/properties/:id', (req, res) => {
    db.query('DELETE FROM properties WHERE property_id=?',
        [req.params.id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Property deleted successfully!' });
        });
});

// ================= CLIENTS =================

// GET CLIENTS
app.get('/api/clients', (req, res) => {
    db.query('SELECT * FROM clients', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ADD CLIENT
app.post('/api/clients', (req, res) => {
    const { client_name, email, phone, budget } = req.body;

    const sql = `INSERT INTO clients
    (client_name, email, phone, budget)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [client_name, email, phone, budget], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Client added successfully!' });
    });
});

// ================= AGENTS =================

// GET AGENTS
app.get('/api/agents', (req, res) => {
    const sql = `SELECT agents.*, users.name, users.email
                 FROM agents
                 JOIN users ON agents.user_id = users.user_id`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ================= APPOINTMENTS =================

// GET APPOINTMENTS
app.get('/api/appointments', (req, res) => {
    db.query('SELECT * FROM appointments', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ADD APPOINTMENT
app.post('/api/appointments', (req, res) => {
    const { client_id, agent_id, property_id, appointment_date } = req.body;

    const sql = `INSERT INTO appointments
    (client_id, agent_id, property_id, appointment_date)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [
        client_id, agent_id, property_id, appointment_date
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Appointment added successfully!' });
    });
});

// ================= TRANSACTIONS =================

// GET TRANSACTIONS
app.get('/api/transactions', (req, res) => {
    db.query('SELECT * FROM transactions', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ADD TRANSACTION
app.post('/api/transactions', (req, res) => {
    const {
        property_id, client_id, agent_id,
        transaction_type, amount
    } = req.body;

    const sql = `INSERT INTO transactions
    (property_id, client_id, agent_id, transaction_type, amount)
    VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [
        property_id, client_id, agent_id,
        transaction_type, amount
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Transaction added successfully!' });
    });
});

// ================= PAYMENTS =================

// GET PAYMENTS
app.get('/api/payments', (req, res) => {
    db.query('SELECT * FROM payments', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ADD PAYMENT
app.post('/api/payments', (req, res) => {
    const { transaction_id, amount, payment_method } = req.body;

    const sql = `INSERT INTO payments
    (transaction_id, amount, payment_method)
    VALUES (?, ?, ?)`;

    db.query(sql, [
        transaction_id, amount, payment_method
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Payment added successfully!' });
    });
});

// ================= PROPERTY IMAGES =================

// GET PROPERTY IMAGES
app.get('/api/property-images', (req, res) => {
    db.query('SELECT * FROM property_images', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ADD PROPERTY IMAGE
app.post('/api/property-images', (req, res) => {
    const { property_id, image_url } = req.body;

    const sql = `INSERT INTO property_images
    (property_id, image_url)
    VALUES (?, ?)`;

    db.query(sql, [property_id, image_url], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Property image added successfully!' });
    });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`EstateEase server running on port ${PORT}`);
});