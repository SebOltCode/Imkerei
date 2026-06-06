import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Wichtig für GitHub Pages: Die Seite liegt im Unterpfad "/Imkerei/".
// Deshalb braucht der Produktions-Build diesen base-Pfad, damit JS, CSS
// und Assets korrekt geladen werden. Lokal (dev) bleibt es bei "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Imkerei/' : '/',
  plugins: [react()],
  server: {
    open: true,
    port: 5173,
  },
}))
