import { lazy } from 'react';

// 페이지 컴포넌트들을 지연 로딩
export const LazyDashboard = lazy(() => import('@/pages/dashboard'));
export const LazyMarket = lazy(() => import('@/pages/market'));
export const LazyNews = lazy(() => import('@/pages/news'));
export const LazyStockDetail = lazy(() => import('@/pages/stock-detail'));
export const LazyTransactions = lazy(() => import('@/pages/transactions'));
export const LazyNotFound = lazy(() => import('@/pages/not-found'));

// 무거운 컴포넌트들을 지연 로딩
export const LazyPortfolioChart = lazy(() => import('@/components/portfolio-chart').then(module => ({ default: module.PortfolioChart })));
export const LazyStockChart = lazy(() => import('@/components/stock-chart').then(module => ({ default: module.StockChart })));
