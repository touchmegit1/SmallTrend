/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Custom colors for a premium look
                sidebar: {
                    DEFAULT: '#1e293b', // Slate 800
                    hover: '#334155',   // Slate 700
                    active: '#475569',  // Slate 600
                },
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    hover: '#4f46e5',   // Indigo 600
                }
            }
        },
    },
    plugins: [],
}
