/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'premium-dark': '#020617', // Slate-950
                'premium-card': 'rgba(15, 23, 42, 0.6)', // Slate-900 with opacity for glass
                'gold': '#f59e0b', // Amber-500
                'gold-light': '#fbbf24', // Amber-400
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            backgroundImage: {
                'premium-gradient': 'linear-gradient(to bottom right, #020617, #1e1b4b)', // Slate-950 to Indigo-950/Black
            }
        },
    },
    plugins: [],
}
