const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getPortfolio = async (req, res) => {
  try {
    const vendorId = req.user ? req.user.vendorId : req.params.vendorId;
    const [portfolio] = await db.query(
      'SELECT * FROM portfolio WHERE vendor_id = ? ORDER BY created_at DESC',
      [vendorId]
    );
    res.json({ success: true, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.uploadPortfolio = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { captions } = req.body;
    const captionsArr = Array.isArray(captions) ? captions : [captions];

    const insertPromises = req.files.map((file, i) =>
      db.query('INSERT INTO portfolio (vendor_id, image_url, caption) VALUES (?, ?, ?)', [
        vendorId,
        `/uploads/${file.filename}`,
        captionsArr[i] || null,
      ])
    );

    await Promise.all(insertPromises);

    const [portfolio] = await db.query(
      'SELECT * FROM portfolio WHERE vendor_id = ? ORDER BY created_at DESC LIMIT ?',
      [vendorId, req.files.length]
    );

    res.status(201).json({ success: true, message: 'Images uploaded', portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deletePortfolioItem = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { id } = req.params;

    const [items] = await db.query('SELECT * FROM portfolio WHERE id = ? AND vendor_id = ?', [id, vendorId]);
    if (items.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    const filePath = path.join(__dirname, '..', items[0].image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM portfolio WHERE id = ?', [id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.replacePortfolioImage = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        const [items] = await db.query(
            "SELECT * FROM portfolio WHERE id = ? AND vendor_id = ?",
            [id, vendorId]
        );

        if (!items.length) {
            return res.status(404).json({
                success: false,
                message: "Portfolio item not found",
            });
        }

        // delete old file
        const oldPath = path.join(
            __dirname,
            "..",
            items[0].image_url
        );

        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }

        // update database
        await db.query(
            "UPDATE portfolio SET image_url = ? WHERE id = ?",
            [`/uploads/${req.file.filename}`, id]
        );

        res.json({
            success: true,
            message: "Image replaced successfully",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
