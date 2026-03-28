import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/sepay-api': {
                target: 'https://my.sepay.vn',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/sepay-api/, ''),
                secure: true,
            },
        },
    },
})
