import { useState, useEffect } from 'react';

const USER_ID_KEY = 'stocksimul-user-id';

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 ID 가져오기
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // 새로운 사용자 ID 생성
      const newUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, newUserId);
      setUserId(newUserId);
    }
  }, []);

  return userId;
}
