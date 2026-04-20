'use client';

import { useEffect, useState } from 'react';

interface OrderUser {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  orderNo: string;
  userId: number;
  amount: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' },
];

const statusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, search, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) throw new Error('获取数据失败');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('更新失败');

      await fetchOrders();
      setEditingOrder(null);
      setNewStatus('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/details`);
      if (!response.ok) throw new Error('获取详情失败');
      const result = await response.json();
      setViewingOrder(result.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取详情失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
        <p className="text-gray-600 mt-1">查看和管理订单</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索订单号..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.orderNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div>
                    <div className="font-medium text-gray-900">{order.user?.name || '未知'}</div>
                    <div className="text-xs">{order.user?.email || ''}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ¥{order.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => {
                      setEditingOrder(order);
                      setNewStatus(order.status);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    编辑状态
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            暂无数据
          </div>
        )}
      </div>

      {/* 分页 */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共 {data.total} 条记录，第 {data.page} / {data.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(Math.min(data.totalPages, page + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 编辑状态弹窗 */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">编辑订单状态</h3>
            <p className="text-sm text-gray-600 mb-4">
              订单号：{editingOrder.orderNo}
            </p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            >
              <option value="pending">待支付</option>
              <option value="paid">已支付</option>
              <option value="cancelled">已取消</option>
              <option value="refunded">已退款</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {updating ? '更新中...' : '确认'}
              </button>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setNewStatus('');
                }}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看详情弹窗 */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">订单详情</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">订单号：</span>
                <span className="font-medium">{viewingOrder.orderNo}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">订单ID：</span>
                <span className="font-medium">{viewingOrder.id}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">用户：</span>
                <span className="font-medium">{viewingOrder.user?.name} ({viewingOrder.user?.email})</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">金额：</span>
                <span className="font-medium text-green-600">¥{viewingOrder.amount}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">状态：</span>
                <span className={`px-2 py-1 text-xs rounded ${statusColors[viewingOrder.status]}`}>
                  {statusLabels[viewingOrder.status]}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">创建时间：</span>
                <span>{new Date(viewingOrder.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">更新时间：</span>
                <span>{new Date(viewingOrder.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
              {viewingOrder.notes && (
                <div>
                  <span className="text-sm text-gray-600">备注：</span>
                  <p className="mt-1 text-sm">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewingOrder(null)}
                className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
