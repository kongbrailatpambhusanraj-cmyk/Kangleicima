import Link from 'next/link';

const menuItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Movies', path: '/admin/movies' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Sources', path: '/admin/sources' },
  { name: 'Sumang Leela', path: '/admin/leela' },
  { name: 'Imports', path: '/admin/imports' },
  { name: 'Unknown Titles', path: '/admin/content/unknown' },
  { name: 'System Health', path: '/admin/system' },
];

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-8 text-blue-400">Admin Panel</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="block py-2 px-4 rounded hover:bg-gray-800 transition"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
