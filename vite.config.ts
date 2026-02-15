import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // මේකෙන් වෙන්නේ .env ෆයිල් එකේ හෝ Vercel එකේ තියෙන variables ටික load කරන එක
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // මෙන්න මෙතනදී අපි 'process.env.API_KEY' වෙනුවට 
      // Vercel එකේ තියෙන VITE_API_KEY එක ලෝඩ් කරනවා.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
    },
  };
});
