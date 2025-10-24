
import React from 'react';
import { HomeIcon, UsersIcon, DollarSignIcon, BookOpenIcon } from './icons';

type Page = 'Dashboard' | 'Users Management' | 'Subscriptions' | 'Exercises Management';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems = [
  { name: 'Dashboard', icon: HomeIcon, page: 'Dashboard' as Page },
  { name: 'Users Management', icon: UsersIcon, page: 'Users Management' as Page },
  { name: 'Subscriptions', icon: DollarSignIcon, page: 'Subscriptions' as Page },
  { name: 'Exercises Management', icon: BookOpenIcon, page: 'Exercises Management' as Page },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <div className="flex-shrink-0 w-64 bg-white border-r border-gray-200 shadow-md">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-blue-600">IELTS Admin</h1>
      </div>
      <nav className="mt-6">
        <div className="px-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</h2>
          <div className="mt-3 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.page);
                }}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activePage === item.page
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
