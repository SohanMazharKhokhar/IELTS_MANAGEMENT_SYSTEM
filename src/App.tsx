// src/App.tsx

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ExercisesManagement from './pages/ExercisesManagement';
import UsersManagement from './pages/UsersManagement';
import LoginPage from './pages/LoginPage';
import EditorTaskView from './pages/EditorTaskView'; // <-- NEW IMPORT
import { useAuth } from './hooks/useAuth';

type Page = 'Dashboard' | 'Users Management' | 'Subscriptions' | 'Exercises Management';

const LoggedInApp: React.FC = () => {
  // ... (LoggedInApp component remains the same) ...
  // This component is the Admin's full view
  
  const [activePage, setActivePage] = useState<Page>('Dashboard');

  const renderContent = () => {
    // ... (rest of renderContent logic remains the same) ...
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
    
    // --- NEW ROLE CHECK LOGIC ---
    if (!currentUser) {
        return <LoginPage />;
    }

    // Determine role based on email for routing
    const isAdmin = currentUser.email.includes('admin@ielts.com') || currentUser.email.includes('maria@ielts.com');
    const isEditor = currentUser.email.includes('editor@ielts.com') || currentUser.email.includes('readedit');

    if (isAdmin) {
        // Full Admin Portal view
        return <LoggedInApp />;
    } else if (isEditor) {
        // Simplified Editor/Task View
        return <EditorTaskView />;
    }
    
    // Default fallback for any other logged-in user (e.g., support staff)
    return <LoggedInApp />; 
}

export default App;