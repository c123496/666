import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">管理后台</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name}
              </span>
              <a
                href="/api/auth/logout"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                退出
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
