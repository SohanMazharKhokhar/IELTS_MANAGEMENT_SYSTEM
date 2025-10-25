// src/App.tsx (Final Working Version for Creation/Editing)

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ExercisesManagement from './pages/ExercisesManagement'; // The Module List View
import ExerciseForm from './pages/ExerciseForm'; // The Full Page Edit/Create Form
import UsersManagement from './pages/UsersManagement';
import LoginPage from './pages/LoginPage';
import EditorTaskView from './pages/EditorTaskView';
import { useAuth } from './hooks/useAuth';
import { Exercise, ExerciseType } from './types'; 

// EXTENDED Page Type
type Page = 'Dashboard' | 'Users Management' | 'Subscriptions' | 'Exercises Management' | 'Reading' | 'Writing' | 'Listening' | 'Speaking';

const LoggedInApp: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  // State is now an object OR null. We must differentiate between 'list' and 'create' when it's null.
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false); // <--- NEW STATE FOR CREATE MODE

  // Function passed to the list component to signal a switch to the form
  const handleEditExercise = (exercise: Exercise | null) => {
    if (exercise === null) {
        // If null is passed, we are CREATING a new exercise.
        setIsCreatingNew(true);
        setExerciseToEdit(null); // Ensure no old edit object is accidentally used
    } else {
        // If an object is passed, we are EDITING.
        setIsCreatingNew(false);
        setExerciseToEdit(exercise);
    }
  }

  const handleCloseEdit = () => {
    setExerciseToEdit(null);
    setIsCreatingNew(false); // Exit creation mode
  }

  // Renders the list view or the full form based on state
  const renderExerciseContent = (moduleType: ExerciseType) => {
    // FIX: Check if we are editing (exerciseToEdit != null) OR if we are in the explicit create mode (isCreatingNew)
    if (exerciseToEdit !== null || isCreatingNew) {
        
      // Render the form. The ExerciseForm handles the difference between edit (object) and create (null).
      return <ExerciseForm 
          exerciseToEdit={exerciseToEdit} 
          moduleType={moduleType} 
          onClose={handleCloseEdit} 
      />;
    }
    
    // Default: List View
    return <ExercisesManagement 
        moduleType={moduleType} 
        onEdit={handleEditExercise} 
    />;
  }


  const renderContent = () => {
    // Safety check
    if ((exerciseToEdit !== null || isCreatingNew) && !['Reading', 'Writing', 'Listening', 'Speaking'].includes(activePage)) {
        setExerciseToEdit(null);
        setIsCreatingNew(false);
    }
    
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Users Management': 
        return <UsersManagement />;
      case 'Subscriptions':
        return <div className="p-8"><h1 className="text-2xl font-bold">Subscriptions (Placeholder)</h1></div>;
      
      // --- MODULE ROUTING ---
      case 'Reading':
        return renderExerciseContent('Reading');
      case 'Writing':
        return renderExerciseContent('Writing');
      case 'Listening':
        return renderExerciseContent('Listening');
      case 'Speaking':
        return renderExerciseContent('Speaking');

      default:
        return renderExerciseContent('Reading'); 
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

    const fullAdminEmails = ['admin@ielts.com', 'maria@ielts.com', 'john.smith@ielts.com', 'emily.clark@ielts.com'];
    const taskEditorEmails = [
        'editor@ielts.com', 'david.lee@ielts.com', 'robert.g@ielts.com', 
        'laura.m@ielts.com', 'kevin.h@ielts.com', 'olivia.s@ielts.com',
        'daniel.k@ielts.com', 'grace.w@ielts.com', 
        'ryan.a@ielts.com', 'chloe.b@ielts.com',
    ];

    const isFullAdmin = fullAdminEmails.includes(userEmail);
    const isTaskEditor = taskEditorEmails.includes(userEmail);

    if (isFullAdmin) {
        return <LoggedInApp />;
    } else if (isTaskEditor) {
        return <EditorTaskView />;
    }
    
    return <LoggedInApp />; 
}

export default App;