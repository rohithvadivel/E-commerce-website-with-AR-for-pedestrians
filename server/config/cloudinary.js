const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ecommerce-ar/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
    },
});

// Storage for 3D models (.glb, .gltf) — stored as raw files
const modelStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ecommerce-ar/models',
        resource_type: 'raw',
        allowed_formats: ['glb', 'gltf'],
    },
});

module.exports = { cloudinary, imageStorage, modelStorage };
