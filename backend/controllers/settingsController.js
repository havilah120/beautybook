const db = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const [settings] = await db.query('SELECT * FROM settings WHERE vendor_id = ?', [vendorId]);
    const [vendor] = await db.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    const [owner] = await db.query(
      'SELECT business_name, owner_name, email, phone FROM business_owners WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      settings: settings[0] || {},
      vendor: vendor[0] || {},
      owner: owner[0] || {},
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const {
      open_time, close_time, working_days,
      bank_name, account_name, account_number,
      email_notifications, appointment_reminders,
      business_name, phone, email, address,
    } = req.body;

    await db.query(
      `UPDATE settings SET open_time = ?, close_time = ?, working_days = ?,
       bank_name = ?, account_name = ?, account_number = ?,
       email_notifications = ?, appointment_reminders = ?
       WHERE vendor_id = ?`,
      [open_time, close_time, working_days, bank_name, account_name, account_number,
       email_notifications, appointment_reminders, vendorId]
    );

    if (business_name || address) {
      await db.query(
        'UPDATE vendors SET business_name = COALESCE(?, business_name), address = COALESCE(?, address) WHERE id = ?',
        [business_name || null, address || null, vendorId]
      );
    }

    if (phone || email) {
      await db.query(
        'UPDATE business_owners SET phone = COALESCE(?, phone), email = COALESCE(?, email) WHERE id = ?',
        [phone || null, email || null, req.user.id]
      );
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
