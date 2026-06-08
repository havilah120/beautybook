const express = require('express');
const router = express.Router();
const { getAllVendors, getVendorById, getVendorProfile, updateVendorProfile } = require('../controllers/vendorController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllVendors);
router.get('/profile', auth, getVendorProfile);
router.put('/profile', auth, upload.fields([{ name: 'banner_image', maxCount: 1 }, { name: 'profile_image', maxCount: 1 }]), updateVendorProfile);
router.get('/:id', getVendorById);

module.exports = router;
