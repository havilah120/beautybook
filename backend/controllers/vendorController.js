const db = require('../config/db');

exports.getAllVendors = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT v.*, s.open_time, s.close_time, s.working_days,
        (SELECT COUNT(*) FROM appointments a WHERE a.vendor_id = v.id AND a.status = 'completed') as completed_count
      FROM vendors v
      LEFT JOIN settings s ON v.id = s.vendor_id
      WHERE v.is_active = 1
    `;
    const params = [];
    if (category && category !== 'All') {
      query += ' AND v.category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (v.business_name LIKE ? OR v.description LIKE ? OR v.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY v.created_at DESC';
    const [vendors] = await db.query(query, params);
    res.json({ success: true, vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [vendors] = await db.query(
      `SELECT v.*, s.open_time, s.close_time, s.working_days, s.bank_name, s.account_name, s.account_number
       FROM vendors v LEFT JOIN settings s ON v.id = s.vendor_id
       WHERE v.id = ? AND v.is_active = 1`,
      [id]
    );
    if (vendors.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const [services] = await db.query(
      'SELECT * FROM services WHERE vendor_id = ? AND is_active = 1 ORDER BY service_name',
      [id]
    );
    const [portfolio] = await db.query(
      'SELECT * FROM portfolio WHERE vendor_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({ success: true, vendor: vendors[0], services, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const [vendors] = await db.query(
      'SELECT * FROM vendors WHERE id = ?',
      [vendorId]
    );
    if (vendors.length === 0) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, vendor: vendors[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { business_name, description, address, city, state } = req.body;

    let updateQuery = 'UPDATE vendors SET business_name = ?, description = ?, address = ?, city = ?, state = ?';
    const params = [business_name, description, address, city, state];

    if (req.files) {
      if (req.files.banner_image) {
        updateQuery += ', banner_image = ?';
        params.push(`/uploads/${req.files.banner_image[0].filename}`);
      }
      if (req.files.profile_image) {
        updateQuery += ', profile_image = ?';
        params.push(`/uploads/${req.files.profile_image[0].filename}`);
      }
    }

    updateQuery += ' WHERE id = ?';
    params.push(vendorId);

    await db.query(updateQuery, params);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
