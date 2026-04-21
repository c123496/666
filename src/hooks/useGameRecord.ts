'use client';

import { useState, useCallback } from 'react';

interface GameRecordState {
  showToast: boolean;
  toastMessage: string;
  toastType: 'success' | 'prompt';
}

export function useGameRecord() {
  const [state, setState] = useState<GameRecordState>({
    showToast: false,
    toastMessage: '',
    toastType: 'success',
  });

  const saveGameRecord = useCallback(async (scenario: string, messageCount: number) => {
    // 计算分数：基于消息数量和随机因素
    const baseScore = Math.min(100, 30 + messageCount * 7);
    const randomBonus = Math.floor(Math.random() * 20);
    const finalScore = Math.min(100, baseScore + randomBonus);

    // 判断通关条件（分数 >= 60 即通关）
    const result = finalScore >= 60 ? '通关' : '失败';

    try {
      const userId = document.cookie
        .split('; ')
        .find(c => c.trim().startsWith('user_id='));

      if (!userId) {
        // 未登录
        setState({
          showToast: true,
          toastMessage: '登录后可保存你的游戏记录',
          toastType: 'prompt',
        });
        return false;
      }

      // 已登录，保存记录
      const response = await fetch('/api/game-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          finalScore,
          result,
        }),
      });

      if (response.ok) {
        setState({
          showToast: true,
          toastMessage: '您的游戏记录已经保存！',
          toastType: 'success',
        });
        return true;
      } else {
        console.error('保存游戏记录失败');
        return false;
      }
    } catch (error) {
      console.error('保存游戏记录失败:', error);
      return false;
    }
  }, []);

  const hideToast = useCallback(() => {
    setState(prev => ({ ...prev, showToast: false }));
  }, []);

  const handleLoginRedirect = useCallback(() => {
    window.location.href = '/login';
  }, []);

  return {
    ...state,
    saveGameRecord,
    hideToast,
    handleLoginRedirect,
  };
}
