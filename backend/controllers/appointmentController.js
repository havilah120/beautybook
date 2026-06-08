const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateBookingId = () => {
  return 'BB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
};

exports.bookAppointment = async (req, res) => {
  try {
    const { vendor_id, full_name, phone, email, service_id, appointment_date, appointment_time, notes, payment_method } = req.body;

    if (!vendor_id || !full_name || !phone || !service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    // Check availability
    const [conflict] = await db.query(
      'SELECT id FROM appointments WHERE vendor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
      [vendor_id, appointment_date, appointment_time]
    );
    if (conflict.length > 0) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another time.' });
    }

    // Upsert customer
    const [existingCustomer] = await db.query(
      'SELECT id FROM customers WHERE vendor_id = ? AND phone = ?',
      [vendor_id, phone]
    );

    let customerId;
    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
      await db.query(
        'UPDATE customers SET full_name = ?, email = ?, total_visits = total_visits + 1 WHERE id = ?',
        [full_name, email || null, customerId]
      );
    } else {
      const [customerResult] = await db.query(
        'INSERT INTO customers (vendor_id, full_name, phone, email, total_visits) VALUES (?, ?, ?, ?, 1)',
        [vendor_id, full_name, phone, email || null]
      );
      customerId = customerResult.insertId;
    }

    const bookingId = generateBookingId();

    const [result] = await db.query(
      'INSERT INTO appointments (booking_id, vendor_id, customer_id, service_id, appointment_date, appointment_time, notes, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [bookingId, vendor_id, customerId, service_id, appointment_date, appointment_time, notes || null, payment_method || 'pay_on_arrival']
    );

    // Get full appointment details
    const [appointment] = await db.query(
      `SELECT a.*, c.full_name, c.phone, c.email, s.service_name, s.price, s.duration,
              v.business_name, v.address, v.city,
              st.bank_name, st.account_name, st.account_number
       FROM appointments a
       JOIN customers c ON a.customer_id = c.id
       JOIN services s ON a.service_id = s.id
       JOIN vendors v ON a.vendor_id = v.id
       LEFT JOIN settings st ON v.id = st.vendor_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment: appointment[0] });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getClientAppointments = async (req, res) => {
  try {
    const { phone, booking_id, name } = req.query;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    let query = `
      SELECT a.*, c.full_name, c.phone, c.email, s.service_name, s.price, s.duration,
             v.business_name, v.address, v.city, v.profile_image
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      JOIN vendors v ON a.vendor_id = v.id
      WHERE c.phone = ?
    `;
    const params = [phone];

    if (booking_id) { query += ' AND a.booking_id = ?'; params.push(booking_id); }
    if (name) { query += ' AND c.full_name LIKE ?'; params.push(`%${name}%`); }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    const [appointments] = await db.query(query, params);
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVendorAppointments = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { status, date } = req.query;

    let query = `
      SELECT a.*, c.full_name, c.phone, c.email, s.service_name, s.price, s.duration
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.vendor_id = ?
    `;
    const params = [vendorId];

    if (status && status !== 'all') { query += ' AND a.status = ?'; params.push(status); }
    if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    const [appointments] = await db.query(query, params);
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointment_date, appointment_time } = req.body;
    const vendorId = req.user.vendorId;

    const [appt] = await db.query('SELECT * FROM appointments WHERE id = ? AND vendor_id = ?', [id, vendorId]);
    if (appt.length === 0) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment_date && appointment_time) {
      const [conflict] = await db.query(
        'SELECT id FROM appointments WHERE vendor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled" AND id != ?',
        [vendorId, appointment_date, appointment_time, id]
      );
      if (conflict.length > 0) return res.status(409).json({ success: false, message: 'Time slot is already booked' });

      await db.query(
        'UPDATE appointments SET status = ?, appointment_date = ?, appointment_time = ? WHERE id = ?',
        [status || appt[0].status, appointment_date, appointment_time, id]
      );
    } else {
      await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    }

    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.clientRescheduleOrCancel = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { action, phone, appointment_date, appointment_time } = req.body;

    const [appt] = await db.query(
      'SELECT a.*, c.phone as cphone FROM appointments a JOIN customers c ON a.customer_id = c.id WHERE a.booking_id = ?',
      [booking_id]
    );
    if (appt.length === 0) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appt[0].cphone !== phone) return res.status(403).json({ success: false, message: 'Phone number does not match' });

    if (action === 'cancel') {
      await db.query('UPDATE appointments SET status = "cancelled" WHERE booking_id = ?', [booking_id]);
      return res.json({ success: true, message: 'Appointment cancelled' });
    }

    if (action === 'reschedule') {
      const [conflict] = await db.query(
        'SELECT id FROM appointments WHERE vendor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled" AND booking_id != ?',
        [appt[0].vendor_id, appointment_date, appointment_time, booking_id]
      );
      if (conflict.length > 0) return res.status(409).json({ success: false, message: 'Time slot is already taken' });

      await db.query(
        'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = "upcoming" WHERE booking_id = ?',
        [appointment_date, appointment_time, booking_id]
      );
      return res.json({ success: true, message: 'Appointment rescheduled' });
    }

    res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { vendor_id, date } = req.query;
    const [booked] = await db.query(
      'SELECT appointment_time FROM appointments WHERE vendor_id = ? AND appointment_date = ? AND status != "cancelled"',
      [vendor_id, date]
    );
    res.json({ success: true, booked_times: booked.map(b => b.appointment_time) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const today = new Date().toISOString().split('T')[0];

    const [[todayAppts]] = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE vendor_id = ? AND appointment_date = ? AND status != "cancelled"',
      [vendorId, today]
    );
    const [[totalCustomers]] = await db.query(
      'SELECT COUNT(*) as count FROM customers WHERE vendor_id = ?',
      [vendorId]
    );
    const [[totalServices]] = await db.query(
      'SELECT COUNT(*) as count FROM services WHERE vendor_id = ? AND is_active = 1',
      [vendorId]
    );
    const [[upcomingAppts]] = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE vendor_id = ? AND appointment_date >= ? AND status = "upcoming"',
      [vendorId, today]
    );

    const [recentCustomers] = await db.query(
      `SELECT c.full_name, c.phone, MAX(a.appointment_date) as last_visit
       FROM customers c
       LEFT JOIN appointments a ON c.id = a.customer_id
       WHERE c.vendor_id = ?
       GROUP BY c.id ORDER BY last_visit DESC LIMIT 5`,
      [vendorId]
    );

    const [upcomingList] = await db.query(
      `SELECT a.*, c.full_name, c.phone, s.service_name
       FROM appointments a
       JOIN customers c ON a.customer_id = c.id
       JOIN services s ON a.service_id = s.id
       WHERE a.vendor_id = ? AND a.appointment_date >= ? AND a.status = 'upcoming'
       ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT 5`,
      [vendorId, today]
    );

    res.json({
      success: true,
      stats: {
        today_appointments: todayAppts.count,
        total_customers: totalCustomers.count,
        total_services: totalServices.count,
        upcoming_appointments: upcomingAppts.count,
      },
      recent_customers: recentCustomers,
      upcoming_appointments: upcomingList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
