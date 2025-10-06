import { lazy } from 'react';

// 페이지 컴포넌트들을 지연 로딩 (프리로딩 포함)
export const LazyDashboard = lazy(() => 
  import('@/pages/dashboard').then(module => {
    // 프리로딩: 다음에 필요한 컴포넌트들을 미리 로드
    import('@/components/portfolio-chart');
    import('@/components/holdings-list');
    return module;
  })
);

export const LazyMarket = lazy(() => 
  import('@/pages/market').then(module => {
    // 프리로딩: 차트 컴포넌트 미리 로드
    import('@/components/stock-chart');
    return module;
  })
);

export const LazyNews = lazy(() => import('@/pages/news'));
export const LazyStockDetail = lazy(() => 
  import('@/pages/stock-detail').then(module => {
    // 프리로딩: 차트 컴포넌트 미리 로드
    import('@/components/stock-chart');
    return module;
  })
);
export const LazyTransactions = lazy(() => import('@/pages/transactions'));
export const LazyNotFound = lazy(() => import('@/pages/not-found'));

// 무거운 컴포넌트들을 지연 로딩 (에러 바운더리 포함)
export const LazyPortfolioChart = lazy(() => 
  import('@/components/portfolio-chart').then(module => ({ 
    default: module.PortfolioChart 
  }))
);

export const LazyStockChart = lazy(() => 
  import('@/components/stock-chart').then(module => ({ 
    default: module.StockChart 
  }))
);

// 추가 무거운 컴포넌트들
export const LazyNewsFeed = lazy(() => import('@/components/news-feed'));
export const LazyTradeModal = lazy(() => import('@/components/trade-modal'));
