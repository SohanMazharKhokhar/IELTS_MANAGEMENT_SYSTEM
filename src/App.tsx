// src/App.tsx (Final Routing Logic)

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ExercisesManagement from './pages/ExercisesManagement';
import UsersManagement from './pages/UsersManagement';
import LoginPage from './pages/LoginPage';
import EditorTaskView from './pages/EditorTaskView';
import { useAuth } from './hooks/useAuth';

type Page = 'Dashboard' | 'Users Management' | 'Subscriptions' | 'Exercises Management';

const LoggedInApp: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Exercises Management':
        return <ExercisesManagement />;
      case 'Users Management': 
        return <UsersManagement />;
      case 'Subscriptions':
        return <div className="p-8"><h1 className="text-2xl font-bold">Subscriptions (Placeholder)</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
    const { currentUser } = useAuth();
    
    if (!currentUser) {
        return <LoginPage />;
    }
    
    const userEmail = currentUser.email;

    // --- FULL ADMINS (See Sidebar and Management) ---
    // Includes Ahmad, Maria, John Smith, Emily Clark
    const fullAdminEmails = [
        'admin@ielts.com', 
        'maria@ielts.com', 
        'john.smith@ielts.com', 
        'emily.clark@ielts.com'
    ];
    
    // --- TASK EDITORS / SPECIALISTS (See Editor View/Solving Page) ---
    // Includes Alex, David, Robert, Marketing, QA, Support, and general test users
    const taskEditorEmails = [
        'editor@ielts.com', 'david.lee@ielts.com', 'robert.g@ielts.com', 
        'laura.m@ielts.com', 'kevin.h@ielts.com', 'olivia.s@ielts.com',
        'daniel.k@ielts.com', 'grace.w@ielts.com', 
        'ryan.a@ielts.com', 'chloe.b@ielts.com',
    ];

    const isFullAdmin = fullAdminEmails.includes(userEmail);
    const isTaskEditor = taskEditorEmails.includes(userEmail);

    if (isFullAdmin) {
        // Ahmad, Maria, John, Emily see the full admin interface
        return <LoggedInApp />;
    } else if (isTaskEditor) {
        // Alex, David, Robert, etc., see the simplified task solving page
        return <EditorTaskView />;
    }
    
    // FALLBACK: If a user somehow logged in but isn't explicitly classified, 
    // default them to the full admin page for control.
    return <LoggedInApp />; 
}

export default App;