const db = require('../config/db');

exports.getServices = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const [services] = await db.query(
      'SELECT * FROM services WHERE vendor_id = ? ORDER BY service_name',
      [vendorId]
    );
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createService = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { service_name, category, duration, price, description } = req.body;

    if (!service_name || !duration || !price) {
      return res.status(400).json({ success: false, message: 'Service name, duration, and price are required' });
    }

    const [result] = await db.query(
      'INSERT INTO services (vendor_id, service_name, category, duration, price, description) VALUES (?, ?, ?, ?, ?, ?)',
      [vendorId, service_name, category || null, duration, price, description || null]
    );

    const [service] = await db.query('SELECT * FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Service created', service: service[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;
    const { service_name, category, duration, price, description, is_active } = req.body;

    const [existing] = await db.query('SELECT id FROM services WHERE id = ? AND vendor_id = ?', [id, vendorId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });

    await db.query(
      'UPDATE services SET service_name = ?, category = ?, duration = ?, price = ?, description = ?, is_active = ? WHERE id = ?',
      [service_name, category || null, duration, price, description || null, is_active !== undefined ? is_active : 1, id]
    );

    res.json({ success: true, message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM services WHERE id = ? AND vendor_id = ?', [id, vendorId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });

    await db.query('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
