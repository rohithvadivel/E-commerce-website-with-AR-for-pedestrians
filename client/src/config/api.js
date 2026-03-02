// API configuration - dynamically uses the current host for mobile compatibility
// When using Vite proxy in development, use empty string to make relative requests
// that go through the proxy. This avoids mixed content issues (HTTPS -> HTTP).

// Check if we're running through Vite dev server (proxy is configured for /api)
const isDev = import.meta.env.DEV;

// In development, use empty string so requests go through Vite proxy
// In production, use the actual API server URL from environment variables, fallback to window.location
const API_HOST = isDev
    ? '' // Use relative URLs for proxy
    : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`);

export const API_BASE_URL = API_HOST;

// Helper function to fix image URLs
// Handles Cloudinary URLs (full https://), localhost URLs, and relative paths
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    // Cloudinary URLs are already complete — pass through unchanged
    if (imageUrl.startsWith('https://res.cloudinary.com') || imageUrl.startsWith('http://res.cloudinary.com')) {
        return imageUrl;
    }

    // In development with proxy, convert to relative URL
    if (isDev) {
        if (imageUrl.includes('localhost:5000')) {
            return imageUrl.replace('http://localhost:5000', '');
        }
        if (imageUrl.includes(window.location.hostname + ':5000')) {
            return imageUrl.replace(`http://${window.location.hostname}:5000`, '');
        }
    }

    // If it's a localhost URL, replace with current API host
    if (imageUrl.includes('localhost:5000')) {
        return imageUrl.replace('http://localhost:5000', API_BASE_URL);
    }

    // If it's a relative path (starts with /uploads), prepend API host if needed
    if (imageUrl.startsWith('/uploads')) {
        return `${API_BASE_URL}${imageUrl}`;
    }

    return imageUrl;
};

export default API_BASE_URL;


