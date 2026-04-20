'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalUsers: number;
  recentUsers: number;
  totalOrders: number;
  recentOrders: number;
  totalRevenue: string;
  recentRevenue: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('获取数据失败');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: '用户总数',
      value: stats?.totalUsers || 0,
      change: stats?.recentUsers || 0,
      changeText: '最近7天新增',
      icon: '👥',
      color: 'indigo',
    },
    {
      title: '订单总数',
      value: stats?.totalOrders || 0,
      change: stats?.recentOrders || 0,
      changeText: '最近7天新增',
      icon: '📦',
      color: 'green',
    },
    {
      title: '总成交额',
      value: `¥${stats?.totalRevenue || '0.00'}`,
      change: `¥${stats?.recentRevenue || '0.00'}`,
      changeText: '最近7天成交',
      icon: '💰',
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">概览</h2>
        <p className="text-gray-600 mt-1">查看关键运营指标</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {card.changeText}: {card.change}
                </p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速导航</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-medium text-gray-900">用户管理</p>
                <p className="text-sm text-gray-500">查看和管理用户</p>
              </div>
            </div>
          </a>
          <a
            href="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-medium text-gray-900">订单管理</p>
                <p className="text-sm text-gray-500">查看和管理订单</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
