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
const { imageStorage, cloudinary } = require('../config/cloudinary');

// Multer with Cloudinary storage for images
const uploadImage = multer({ storage: imageStorage });

// Multer with memory storage for 3D models (upload to Cloudinary manually)
const uploadModelMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for 3D models
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        if (['glb', 'gltf'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .glb and .gltf files are allowed'), false);
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
router.put('/:id/update-image', auth, sellerOnly, updateProductImage);

// Image upload helper route — returns Cloudinary URL
router.post('/upload', auth, sellerOnly, (req, res) => {
    uploadImage.single('image')(req, res, (err) => {
        if (err) {
            console.error('Image upload error:', err);
            return res.status(500).json({ error: 'Image upload failed', details: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log('Image uploaded to Cloudinary:', req.file.path);
        res.json({ filePath: req.file.path });
    });
});

// 3D Model upload helper route — uses direct Cloudinary SDK for raw file uploads
router.post('/upload-model', auth, sellerOnly, (req, res) => {
    uploadModelMemory.single('model')(req, res, (err) => {
        if (err) {
            console.error('Model multer error:', err);
            return res.status(500).json({ error: 'Model upload failed', details: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const ext = req.file.originalname.split('.').pop().toLowerCase();

        // Upload buffer directly to Cloudinary as a raw file
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'ecommerce-ar/models',
                resource_type: 'raw',
                public_id: `model-${Date.now()}`,
                format: ext,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: 'Cloudinary upload failed', details: error.message });
                }
                console.log('Model uploaded to Cloudinary:', result.secure_url);
                res.json({ filePath: result.secure_url });
            }
        );

        // Pipe the buffer into the upload stream
        const { Readable } = require('stream');
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
    });
});

module.exports = router;
