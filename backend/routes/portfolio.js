const express = require('express');
const router = express.Router();

const {
  getPortfolio,
  uploadPortfolio,
  deletePortfolioItem,
  replacePortfolioImage,
} = require('../controllers/portfolioController');

const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, getPortfolio);

router.post(
  '/',
  auth,
  upload.array('images', 20),
  uploadPortfolio
);

router.put(
  '/:id/replace',
  auth,
  upload.single('image'),
  replacePortfolioImage
);

router.delete('/:id', auth, deletePortfolioItem);

module.exports = router;