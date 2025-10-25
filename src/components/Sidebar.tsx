// src/components/Sidebar.tsx

import React, { useState } from 'react';
import { HomeIcon, UsersIcon, DollarSignIcon, BookOpenIcon } from './icons';

// Add new SubPages to the Page type
type Page = 'Dashboard' | 'Users Management' | 'Subscriptions' | 'Exercises Management' | 'Reading' | 'Writing' | 'Listening' | 'Speaking';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems = [
  { name: 'Dashboard', icon: HomeIcon, page: 'Dashboard' as Page },
  { name: 'Users Management', icon: UsersIcon, page: 'Users Management' as Page },
  { name: 'Subscriptions', icon: DollarSignIcon, page: 'Subscriptions' as Page },
];

// Define the expandable exercise module
const exerciseModules = [
  { name: 'Reading', page: 'Reading' as Page },
  { name: 'Writing', page: 'Writing' as Page },
  { name: 'Listening', page: 'Listening' as Page },
  { name: 'Speaking', page: 'Speaking' as Page },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [isExercisesExpanded, setIsExercisesExpanded] = useState(false);
  const isExerciseActive = exerciseModules.some(module => module.page === activePage);

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
                  setIsExercisesExpanded(false); // Close menu when selecting another main item
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

            {/* Expandable Exercises Management Item */}
            <button
              onClick={() => setIsExercisesExpanded(!isExercisesExpanded)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isExerciseActive || isExercisesExpanded
                  ? 'bg-gray-100 text-gray-800' // Highlight when active or expanded
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
                <BookOpenIcon className={`w-5 h-5 mr-3 ${isExerciseActive ? 'text-blue-600' : ''}`} />
                Exercises Management
                <svg className={`w-4 h-4 ml-auto transform transition-transform ${isExercisesExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </button>
            
            {/* Sub Menu */}
            {isExercisesExpanded && (
              <div className="pl-8 space-y-1">
                {exerciseModules.map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePage(item.page);
                    }}
                    className={`flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                      activePage === item.page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.name} Module
                  </a>
                ))}
              </div>
            )}

          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;