const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log config status on startup
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log('✅ Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
    console.warn('⚠️  Cloudinary NOT configured! Missing env vars:', {
        CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: !!process.env.CLOUDINARY_API_KEY,
        API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    });
}

// Storage for product images
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ecommerce-ar/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    },
});

// Storage for 3D models (.glb, .gltf) — stored as raw files
const modelStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop();
        return {
            folder: 'ecommerce-ar/models',
            resource_type: 'raw',
            public_id: `model-${Date.now()}`,
            format: ext,
        };
    },
});

module.exports = { cloudinary, imageStorage, modelStorage };
