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
    rejectProduct
} = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const imageStorage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const uploadImage = multer({ storage: imageStorage });

// Multer setup for 3D model upload
const modelStorage = multer.diskStorage({
    destination: './uploads/models/',
    filename: function (req, file, cb) {
        cb(null, 'model-' + Date.now() + path.extname(file.originalname));
    }
});
const uploadModel = multer({
    storage: modelStorage,
    fileFilter: (req, file, cb) => {
        const allowedExt = ['.glb', '.gltf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExt.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .glb and .gltf files are allowed'));
        }
    }
});

// Routes
router.get('/', getProducts);
router.get('/myproducts', auth, getMyProducts);
router.post('/', auth, sellerOnly, createProduct);

// Admin routes for product approval
router.get('/pending', auth, getPendingProducts);
router.put('/:id/approve', auth, approveProduct);
router.put('/:id/reject', auth, rejectProduct);

// Image upload helper route
router.post('/upload', auth, sellerOnly, uploadImage.single('image'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

// 3D Model upload helper route
router.post('/upload-model', auth, sellerOnly, uploadModel.single('model'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filePath: `/uploads/models/${req.file.filename}` });
});

module.exports = router;


