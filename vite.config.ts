import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom'],
          // UI 라이브러리들을 별도 청크로 분리
          'ui-vendor': ['lucide-react', 'date-fns'],
          // 차트 라이브러리를 별도 청크로 분리
          'chart-vendor': ['recharts'],
          // React Query를 별도 청크로 분리
          'query-vendor': ['@tanstack/react-query'],
          // 라우팅 라이브러리
          'router-vendor': ['wouter'],
        },
      },
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 압축 최적화
    minify: 'esbuild',
    // 소스맵 비활성화 (프로덕션에서)
    sourcemap: false,
    // CSS 코드 분할
    cssCodeSplit: true,
    // 에셋 인라인 임계값
    assetsInlineLimit: 4096,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
