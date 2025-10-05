import { useState, useEffect } from 'react';

const USER_ID_KEY = 'stocksimul-user-id';

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(() => {
    // 초기값을 즉시 설정하여 첫 렌더링에서 로딩 상태 최소화
    try {
      return localStorage.getItem(USER_ID_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // 이미 초기값이 있으면 추가 작업 불필요
    if (userId) return;

    // 로컬 스토리지에서 사용자 ID 가져오기
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // 새로운 사용자 ID 생성
      const newUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
      try {
        localStorage.setItem(USER_ID_KEY, newUserId);
        setUserId(newUserId);
      } catch (error) {
        console.error('Failed to save user ID:', error);
        // localStorage 실패 시에도 임시 ID 사용
        setUserId(newUserId);
      }
    }
  }, [userId]);

  return userId;
}
