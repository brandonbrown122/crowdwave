'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Users,
  ClipboardList,
  Play,
  BarChart3,
  PieChart,
  Settings,
  Waves,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Data Sources', href: '/data-sources', icon: Database },
  { name: 'Segments', href: '/segments', icon: Users },
  { name: 'Surveys', href: '/surveys', icon: ClipboardList },
  { name: 'Run Simulation', href: '/simulate', icon: Play },
  { name: 'Results', href: '/results', icon: BarChart3 },
  { name: 'Analyze', href: '/analyze', icon: PieChart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CrowdWave</h1>
            <p className="text-xs text-gray-500">Synthetic Audiences</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={isActive ? 'nav-link-active' : 'nav-link'}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/settings" className="nav-link">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Version 0.1.0</p>
          <p className="text-xs text-gray-400">© 2024 CrowdWave</p>
        </div>
      </div>
    </aside>
  );
}
