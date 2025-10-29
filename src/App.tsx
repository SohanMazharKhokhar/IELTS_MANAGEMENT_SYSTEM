// src/App.tsx

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ExercisesManagement from './pages/ExercisesManagement';
import ExerciseForm from './pages/ExerciseForm';
import UsersManagement from './pages/UsersManagement';
import LoginPage from './pages/LoginPage';
import EditorTaskView from './pages/EditorTaskView';
import { useAuth } from './hooks/useAuth';
// Import User type for passing down props
import { Exercise, ExerciseType, User, PortalUserRole } from './types';

// Page type includes modules
type Page = 'Dashboard' | 'Users Management' | 'Subscriptions' | 'Exercises Management' | 'Reading' | 'Writing' | 'Listening' | 'Speaking';

// --- LoggedInApp receives currentUser ---
const LoggedInApp: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleEditExercise = (exercise: Exercise | null) => {
    setIsCreatingNew(exercise === null);
    setExerciseToEdit(exercise);
  };
  const handleCloseEdit = () => {
    setExerciseToEdit(null);
    setIsCreatingNew(false);
  };

  // Renders List or Form view for Exercises
  const renderExerciseContent = (moduleType: ExerciseType) => {
    if (exerciseToEdit !== null || isCreatingNew) {
      // Show form if editing (exerciseToEdit has object) OR creating (isCreatingNew is true)
      return <ExerciseForm
        exerciseToEdit={exerciseToEdit}
        moduleType={moduleType}
        onClose={handleCloseEdit}
      />;
    }
    // Otherwise show list view
    return <ExercisesManagement
      moduleType={moduleType}
      onEdit={handleEditExercise}
    />;
  };

  // Main content renderer based on activePage and role
  const renderContent = () => {
    // Safety check: clear edit state if navigating away from exercise modules
    if ((exerciseToEdit !== null || isCreatingNew) && !['Reading', 'Writing', 'Listening', 'Speaking'].includes(activePage)) {
        setExerciseToEdit(null); setIsCreatingNew(false);
    }

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Users Management':
        // --- Access Control Check ---
        // UPDATED: Now allows SuperAdmin, Admin, AND Editor
        if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Admin' || currentUser.role === 'Editor') {
            return <UsersManagement currentUserRole={currentUser.role} currentUserId={currentUser.id} />;
        }
        console.warn(`Role '${currentUser.role}' denied access to Users Management.`);
        return <Dashboard />; // Redirect unauthorized roles
      case 'Subscriptions':
         // --- Access Control Check ---
         // This remains Admin-only
         if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Admin') {
            return <div className="p-8"><h1 className="text-2xl font-bold">Subscriptions (Placeholder)</h1></div>;
         }
         console.warn(`Role '${currentUser.role}' denied access to Subscriptions.`);
         return <Dashboard />; // Redirect unauthorized roles
      // --- Exercise Modules ---
      case 'Reading': return renderExerciseContent('Reading');
      case 'Writing': return renderExerciseContent('Writing');
      case 'Listening': return renderExerciseContent('Listening');
      case 'Speaking': return renderExerciseContent('Speaking');
      // Fallback
      case 'Exercises Management': // If somehow landed here directly
      default:
        // Editors shouldn't see this, default them to Dashboard
        if (currentUser.role === 'Editor') {
            setActivePage('Dashboard');
            return <Dashboard />;
        }
        // Admins/SuperAdmins default to Reading
        setActivePage('Reading'); 
        return renderExerciseContent('Reading');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Pass role to Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} currentUserRole={currentUser.role} />
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
    const { currentUser } = useAuth(); // currentUser includes role

    if (!currentUser) {
        return <LoginPage />;
    }

    // --- Routing based on role ---
    // UPDATED: This logic now correctly routes all 3 portal roles to the LoggedInApp
    // Your "User" role from useAuth.tsx (if it existed) would fail this check.
    if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Admin' || currentUser.role === 'Editor') {
        // SuperAdmins, Admins, and Editors see the admin interface
        // The Sidebar and App components will handle what they see inside
        return <LoggedInApp currentUser={currentUser} />;
    }
    // ----------------------------

    // Fallback for unexpected roles (like 'User' trying portal login)
    // This correctly implements your "User Can Not Login" rule.
    console.error("Access Denied: Unexpected user role for portal access:", currentUser.role);
    return <LoginPage />;
}

export default App;
