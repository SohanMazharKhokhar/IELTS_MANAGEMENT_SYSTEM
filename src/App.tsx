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

// ... (LoggedInApp component remains the same) ...
const LoggedInApp: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  // ... (all logic inside LoggedInApp is unchanged) ...
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
        currentUserRole={currentUser.role} // <-- Pass role to form
      />;
    }
    // Otherwise show list view
    return <ExercisesManagement
      moduleType={moduleType}
      onEdit={handleEditExercise}
      currentUserRole={currentUser.role} // <-- Pass role to list
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
        // --- CHANGE: Allow Editor to access Users Management ---
        if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Admin' || currentUser.role === 'Editor') {
            return <UsersManagement currentUserRole={currentUser.role} currentUserId={currentUser.id} />;
        }
        console.warn(`Role '${currentUser.role}' denied access to Users Management.`);
        return <Dashboard />; // Redirect unauthorized roles
      case 'Subscriptions':
         // --- Access Control Check ---
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
        // --- CHANGE: Default to Dashboard for a safer fallback ---
        setActivePage('Dashboard'); 
        return <Dashboard />;
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
    // Get isLoading state from useAuth
    const { currentUser, isLoading } = useAuth(); // currentUser includes role

    // Show a loading screen while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      );
    }

    if (!currentUser) {
        return <LoginPage />;
    }

    // --- (MODIFICATION) ---
    // The 'User' role is now blocked by the API, but we
    // keep this logic as a fallback.
    if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Admin' || currentUser.role === 'Editor') {
        // SuperAdmins, Admins, and Editors see the full admin interface
        return <LoggedInApp currentUser={currentUser} />;
    } else if (currentUser.role === 'User') {
        // This view is for students (who shouldn't be here)
        // We will show the EditorTaskView for now, but login should fail
        return <EditorTaskView />;
    }
    // ---------------------------------------------

    // Fallback for unexpected roles
    console.error("Access Denied: Unexpected user role for portal access:", currentUser.role);
    return <LoginPage />;
}

export default App;