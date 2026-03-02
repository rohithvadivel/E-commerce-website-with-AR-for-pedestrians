const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { sellerOnly } = require('../middleware/authMiddleware');
const {
    getProducts,
    createProduct,
    getMyProducts,
    getPendingProducts,
    approveProduct,
    rejectProduct,
    updateProductImage
} = require('../controllers/productController');
const multer = require('multer');
const { imageStorage, modelStorage } = require('../config/cloudinary');

// Multer with Cloudinary storage
const uploadImage = multer({ storage: imageStorage });
const uploadModel = multer({ storage: modelStorage });

// Routes
router.get('/', getProducts);
router.get('/myproducts', auth, getMyProducts);
router.post('/', auth, sellerOnly, createProduct);

// Admin routes for product approval
router.get('/pending', auth, getPendingProducts);
router.put('/:id/approve', auth, approveProduct);
router.put('/:id/reject', auth, rejectProduct);
router.put('/:id/update-image', auth, sellerOnly, updateProductImage);

// Image upload helper route — returns Cloudinary URL
router.post('/upload', auth, sellerOnly, uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filePath: req.file.path }); // Cloudinary secure_url
});

// 3D Model upload helper route — returns Cloudinary URL
router.post('/upload-model', auth, sellerOnly, uploadModel.single('model'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filePath: req.file.path }); // Cloudinary secure_url
});

module.exports = router;


