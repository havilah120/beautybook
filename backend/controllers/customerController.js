const db = require('../config/db');

exports.getCustomers = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { search } = req.query;

    let query = `
      SELECT c.*, MAX(a.appointment_date) as last_appointment
      FROM customers c
      LEFT JOIN appointments a ON c.id = a.customer_id
      WHERE c.vendor_id = ?
    `;
    const params = [vendorId];

    if (search) {
      query += ' AND (c.full_name LIKE ? OR c.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY c.id ORDER BY c.full_name';
    const [customers] = await db.query(query, params);
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    const [customers] = await db.query(
      'SELECT * FROM customers WHERE id = ? AND vendor_id = ?',
      [id, vendorId]
    );
    if (customers.length === 0) return res.status(404).json({ success: false, message: 'Customer not found' });

    const [appointments] = await db.query(
      `SELECT a.*, s.service_name, s.price
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.customer_id = ? ORDER BY a.appointment_date DESC`,
      [id]
    );

    res.json({ success: true, customer: customers[0], appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCustomerNotes = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;
    const { notes } = req.body;

    const [existing] = await db.query('SELECT id FROM customers WHERE id = ? AND vendor_id = ?', [id, vendorId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Customer not found' });

    await db.query('UPDATE customers SET notes = ? WHERE id = ?', [notes, id]);
    res.json({ success: true, message: 'Customer notes updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
