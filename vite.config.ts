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
        manualChunks: (id) => {
          // React 관련 라이브러리들을 별도 청크로 분리
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // UI 라이브러리들을 별도 청크로 분리
          if (id.includes('lucide-react') || id.includes('date-fns')) {
            return 'ui-vendor';
          }
          // 차트 라이브러리를 별도 청크로 분리
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          // React Query를 별도 청크로 분리
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          // 라우팅 라이브러리
          if (id.includes('wouter')) {
            return 'router-vendor';
          }
          // 페이지별 청크 분리
          if (id.includes('/pages/dashboard')) {
            return 'dashboard';
          }
          if (id.includes('/pages/market')) {
            return 'market';
          }
          if (id.includes('/pages/stock-detail')) {
            return 'stock-detail';
          }
          // 컴포넌트별 청크 분리
          if (id.includes('/components/portfolio-chart')) {
            return 'portfolio-chart';
          }
          if (id.includes('/components/stock-chart')) {
            return 'stock-chart';
          }
        },
        // 청크 파일명 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1500,
    // 압축 최적화
    minify: 'esbuild',
    // 소스맵 비활성화 (프로덕션에서)
    sourcemap: false,
    // CSS 코드 분할
    cssCodeSplit: true,
    // 에셋 인라인 임계값 (더 작게 설정)
    assetsInlineLimit: 2048,
    // 타겟 브라우저 최적화
    target: 'es2020',
    // 압축 레벨 최적화
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
