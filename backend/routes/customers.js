const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, updateCustomerNotes } = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.get('/', auth, getCustomers);
router.get('/:id', auth, getCustomerById);
router.patch('/:id/notes', auth, updateCustomerNotes);

module.exports = router;
