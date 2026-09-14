import { getAdminDashboardStats } from '@/lib/server/admin';

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.userCount} />
        <StatCard title="Total Profiles" value={stats.profileCount} />
        <StatCard title="Total Movies" value={stats.movieCount} />
        <StatCard title="Playable Sources" value={stats.playableSources} />
        <StatCard title="Leela Items" value={stats.leelaCount} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
