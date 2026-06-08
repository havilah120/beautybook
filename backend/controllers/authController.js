const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, vendorId: user.vendorId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { business_name, owner_name, email, phone, password, business_type } = req.body;

    if (!business_name || !owner_name || !email || !phone || !password || !business_type) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const [existing] = await db.query(
      'SELECT id FROM business_owners WHERE email = ? OR phone = ?',
      [email, phone]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [ownerResult] = await db.query(
      'INSERT INTO business_owners (business_name, owner_name, email, phone, password, business_type) VALUES (?, ?, ?, ?, ?, ?)',
      [business_name, owner_name, email, phone, hashedPassword, business_type]
    );

    const ownerId = ownerResult.insertId;

    const [vendorResult] = await db.query(
      'INSERT INTO vendors (owner_id, business_name, category) VALUES (?, ?, ?)',
      [ownerId, business_name, business_type]
    );

    const vendorId = vendorResult.insertId;

    await db.query('INSERT INTO settings (vendor_id) VALUES (?)', [vendorId]);

    const token = generateToken({ id: ownerId, email, vendorId });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: ownerId, business_name, owner_name, email, phone, business_type, vendorId },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [owners] = await db.query(
      'SELECT bo.*, v.id as vendorId FROM business_owners bo LEFT JOIN vendors v ON bo.id = v.owner_id WHERE bo.email = ? OR bo.phone = ?',
      [email, email]
    );

    if (owners.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const owner = owners[0];
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: owner.id, email: owner.email, vendorId: owner.vendorId });

    res.json({
      success: true,
      token,
      user: {
        id: owner.id,
        business_name: owner.business_name,
        owner_name: owner.owner_name,
        email: owner.email,
        phone: owner.phone,
        business_type: owner.business_type,
        vendorId: owner.vendorId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT bo.id, bo.business_name, bo.owner_name, bo.email, bo.phone, bo.business_type, v.id as vendorId FROM business_owners bo LEFT JOIN vendors v ON bo.id = v.owner_id WHERE bo.id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const [rows] = await db.query('SELECT password FROM business_owners WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE business_owners SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
