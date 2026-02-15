import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // process.cwd() වෙනුවට '.' භාවිතා කරමු
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // API Key එක process.env හරහා access කරන්න පුළුවන් වෙන විදිහට define කරනවා
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
    },
  };
});
