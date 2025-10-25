// src/pages/ExerciseForm.tsx

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Exercise, Task, ExerciseType } from '../types';
import AddTaskModal from '../components/exercise/AddTaskModal';
import { PlusIcon, SaveIcon, TrashIcon } from '../components/icons';

type ExerciseFormInputs = Omit<Exercise, 'id' | 'tasks'>;

interface ExerciseFormProps {
    exerciseToEdit: Exercise | null;
    moduleType: ExerciseType;
    onClose: () => void; // Function to go back to the list view
}

// Helper to get exercises from storage
const EXERCISES_STORAGE_KEY = 'ielts_saved_exercises';
const getExercisesFromStorage = () => {
    const stored = localStorage.getItem(EXERCISES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const ExerciseForm: React.FC<ExerciseFormProps> = ({ exerciseToEdit, moduleType, onClose }) => {
  const isEditing = !!exerciseToEdit;

  // FIX: Initialize tasks safely: existing tasks if editing, otherwise empty array
  const [currentTasks, setCurrentTasks] = useState<Task[]>(exerciseToEdit ? exerciseToEdit.tasks : []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null); 

  // Initialize Form with existing data (if editing) or new defaults (if creating)
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ExerciseFormInputs>({
    defaultValues: {
      exerciseType: moduleType, 
      title: exerciseToEdit?.title || '',
      description: exerciseToEdit?.description || '',
      allowedTime: exerciseToEdit?.allowedTime || 40,
      passage: exerciseToEdit?.passage || '',
      imageUrl: exerciseToEdit?.imageUrl || '',
      recordingUrl: exerciseToEdit?.recordingUrl || '',
    }
  });
  
  const exerciseType = watch('exerciseType'); 

  // --- TASK MODAL HANDLERS ---
  const handleOpenTaskModal = (taskToEdit: Task | null) => {
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  }

  const handleCloseTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  }
  
  const handleSaveTask = (taskData: Task, originalTaskId: string | null) => {
    if (originalTaskId) {
        // EDIT TASK: Find and replace the task in the currentTasks array
        setCurrentTasks(prev => prev.map(t => 
            t.id === originalTaskId ? taskData : t
        ));
    } else {
        // ADD NEW TASK
        setCurrentTasks(prev => [...prev, taskData]);
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setCurrentTasks(prev => prev.filter(task => task.id !== taskId));
  };
  
  // --- MAIN FORM SUBMISSION (Save Exercise) ---
  const onSaveExercise: SubmitHandler<ExerciseFormInputs> = (data) => {
    if (currentTasks.length === 0) {
      alert("Please add at least one task before saving.");
      return;
    }
    
    const allExercises: Exercise[] = getExercisesFromStorage();
    let updatedExercises: Exercise[];

    if (isEditing) {
        // Find the index and replace the old exercise with the new one
        updatedExercises = allExercises.map(ex =>
            ex.id === exerciseToEdit?.id 
                ? { ...exerciseToEdit, ...data, tasks: currentTasks, exerciseType: moduleType }
                : ex
        ) as Exercise[];
    } else {
        // Create new exercise
        const newExercise: Exercise = {
          id: new Date().toISOString(),
          ...data,
          tasks: currentTasks,
          exerciseType: moduleType,
        };
        updatedExercises = [...allExercises, newExercise];
    }

    localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(updatedExercises));
    onClose(); // Go back to the list view
  };
  
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{isEditing ? `Edit ${moduleType} Exercise` : `Create New ${moduleType} Exercise`}</h1>
        <button type="button" onClick={onClose} className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
             &larr; Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit(onSaveExercise)} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800">Exercise Details</h2>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <SaveIcon className="mr-2 w-4 h-4" />
              {isEditing ? 'Update Exercise' : 'Save New Exercise'}
            </button>
        </div>
        
        {/* The Exercise Type field is read-only when editing or preset when creating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelClasses}>Exercise Type</label>
                <input type="text" value={moduleType} readOnly className={`${commonInputClasses} bg-gray-100 text-gray-500`} />
            </div>
            <div>
                <label htmlFor="title" className={labelClasses}>Title</label>
                <input type="text" id="title" {...register('title', { required: 'This field is required' })} className={commonInputClasses} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className={labelClasses}>Description</label>
                <textarea id="description" rows={3} {...register('description', { required: 'This field is required' })} className={commonInputClasses}></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
                <label htmlFor="allowedTime" className={labelClasses}>Allowed Time (minutes)</label>
                <input type="number" id="allowedTime" {...register('allowedTime', { required: 'This field is required', valueAsNumber: true, min: 1 })} className={commonInputClasses} />
                {errors.allowedTime && <p className="text-red-500 text-xs mt-1">{errors.allowedTime.message || "Must be at least 1"}</p>}
            </div>

            {/* Conditional Passage/Media Fields */}
            {(exerciseType === 'Reading' || exerciseType === 'Writing') && (
                <div className="md:col-span-2">
                    <label htmlFor="passage" className={labelClasses}>Passage / Task Prompt</label>
                    <textarea id="passage" rows={5} {...register('passage')} className={commonInputClasses}></textarea>
                </div>
            )}
            {moduleType === 'Reading' && (
                <div className="md:col-span-2">
                    <label htmlFor="imageUrl" className={labelClasses}>Image URL (for charts/diagrams)</label>
                    <input type="text" id="imageUrl" {...register('imageUrl')} className={commonInputClasses} />
                </div>
            )}
            {(moduleType === 'Listening' || moduleType === 'Speaking') && (
                <div className="md:col-span-2">
                    <label htmlFor="recordingUrl" className={labelClasses}>Recording URL</label>
                    <input type="text" id="recordingUrl" {...register('recordingUrl')} className={commonInputClasses} />
                </div>
            )}
        </div>
      </form>
      
      {/* Tasks Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Tasks Included</h2>
          <button type="button" onClick={() => handleOpenTaskModal(null)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <PlusIcon className="mr-2 w-4 h-4" />
            Add New Task
          </button>
        </div>
        <div className="space-y-4">
          {currentTasks.length > 0 ? currentTasks.map((task, index) => (
            <div key={task.id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-semibold text-gray-700">{index + 1}. {task.title}</p>
                <p className="text-sm text-gray-500">Type: {task.taskType}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                    type="button"
                    onClick={() => handleOpenTaskModal(task)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                    Edit
                </button>
                <button type="button" onClick={() => handleRemoveTask(task.id)} className="text-red-500 hover:text-red-700">
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>
          )) : <p className="text-center text-gray-500 py-4">No tasks added yet. Add tasks above.</p>}
        </div>
      </div>
      
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseTaskModal}
        editingTask={editingTask}
        onSaveTask={handleSaveTask}
      />
    </>
  );
};

export default ExerciseForm;