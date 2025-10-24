// src/pages/ExercisesManagement.tsx (Modified for Task Editing)

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Exercise, Task, ExerciseType } from '../types';
import AddTaskModal from '../components/exercise/AddTaskModal';
import { PlusIcon, SaveIcon, TrashIcon } from '../components/icons';
import { sampleExercises } from '../data/sampleExercises';

type ExerciseFormInputs = Omit<Exercise, 'id' | 'tasks'>;

const EXERCISES_STORAGE_KEY = 'ielts_saved_exercises';

const getInitialExercises = (): Exercise[] => {
    const storedExercises = localStorage.getItem(EXERCISES_STORAGE_KEY);
    if (storedExercises) {
        return JSON.parse(storedExercises);
    }
    // Initialize with samples only if localStorage is empty
    localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(sampleExercises));
    return sampleExercises;
};

const ExercisesManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [savedExercises, setSavedExercises] = useState<Exercise[]>(getInitialExercises); 
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  
  // NEW STATE: To track which task is currently being edited
  const [editingTask, setEditingTask] = useState<Task | null>(null); 

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ExerciseFormInputs>({
    defaultValues: {
      allowedTime: 40,
    }
  });
  const exerciseType = watch('exerciseType');

  // EFFECT TO SAVE EXERCISES TO LOCAL STORAGE (Persistence)
  useEffect(() => {
    localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(savedExercises));
  }, [savedExercises]);

  // --- TASK MANAGEMENT HANDLERS ---
  
  const handleOpenTaskModal = (taskToEdit: Task | null) => {
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  }

  const handleCloseTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  }

  // MODIFIED HANDLER to save or update task in the currentTasks array
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
    // Note: The main exercise save button must be clicked to make these changes permanent.
  };

  const handleRemoveTask = (taskId: string) => {
    setCurrentTasks(prev => prev.filter(task => task.id !== taskId));
  };
  
  // --- EXERCISE MANAGEMENT HANDLERS ---

  const handleLoadExercise = (exercise: Exercise) => {
    // 1. Set the form fields (Exercise Details)
    setValue('exerciseType', exercise.exerciseType);
    setValue('title', exercise.title);
    setValue('description', exercise.description);
    setValue('allowedTime', exercise.allowedTime);
    
    // Set optional fields if they exist
    setValue('passage', exercise.passage || '');
    setValue('imageUrl', exercise.imageUrl || '');
    setValue('recordingUrl', exercise.recordingUrl || '');
    
    // 2. Set the Tasks list (Tasks Section)
    setCurrentTasks(exercise.tasks);
    
    // 3. Set the editing ID
    setEditingExerciseId(exercise.id);
  };
  
  const onSaveExercise: SubmitHandler<ExerciseFormInputs> = (data) => {
    if (currentTasks.length === 0) {
      alert("Please add at least one task before saving.");
      return;
    }

    if (editingExerciseId) {
        // EDIT existing exercise
        setSavedExercises(prev => prev.map(ex =>
            ex.id === editingExerciseId 
                ? { ...ex, ...data, tasks: currentTasks }
                : ex
        ));
        console.log("Updated Exercise:", editingExerciseId);
    } else {
        // CREATE new exercise
        const newExercise: Exercise = {
          id: new Date().toISOString(),
          ...data,
          tasks: currentTasks,
        };
        setSavedExercises(prev => [...prev, newExercise]);
        console.log("Saved New Exercise:", newExercise);
        
        // Clear form state for NEW creations only
        setTimeout(() => {
            reset();
            setCurrentTasks([]);
        }, 500);
    }
    
    setEditingExerciseId(null); 
  };
  
  const handleDeleteExercise = (exerciseId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the exercise: "${title}"?`)) {
        setSavedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
        // If the deleted exercise was the one being edited, clear the form
        if (editingExerciseId === exerciseId) {
            reset();
            setCurrentTasks([]);
            setEditingExerciseId(null);
        }
    }
  };

  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Exercises Management</h1>
            <p className="text-gray-500 mt-1">Create and manage IELTS practice exercises</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column (Exercise Form) */}
        <div className="w-full lg:w-2/3">
          <form onSubmit={handleSubmit(onSaveExercise)} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    {editingExerciseId ? 'Edit Exercise Details' : 'Exercise Details'}
                </h2>
                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <SaveIcon className="mr-2" />
                  {editingExerciseId ? 'Update Exercise' : 'Save Exercise'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="exerciseType" className={labelClasses}>Exercise Type</label>
                <select id="exerciseType" {...register('exerciseType', { required: 'This field is required' })} className={commonInputClasses}>
                  <option value="">Select Type</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Listening">Listening</option>
                  <option value="Speaking">Speaking</option>
                </select>
                {errors.exerciseType && <p className="text-red-500 text-xs mt-1">{errors.exerciseType.message}</p>}
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

              {(exerciseType === 'Reading' || exerciseType === 'Writing') && (
                <div className="md:col-span-2">
                  <label htmlFor="passage" className={labelClasses}>Passage</label>
                  <textarea id="passage" rows={5} {...register('passage')} className={commonInputClasses}></textarea>
                </div>
              )}
              {exerciseType === 'Reading' && (
                <div className="md:col-span-2">
                  <label htmlFor="imageUrl" className={labelClasses}>Image URL</label>
                  <input type="text" id="imageUrl" {...register('imageUrl')} className={commonInputClasses} />
                </div>
              )}
              {(exerciseType === 'Listening' || exerciseType === 'Speaking') && (
                <div className="md:col-span-2">
                  <label htmlFor="recordingUrl" className={labelClasses}>Recording URL</label>
                  <input type="text" id="recordingUrl" {...register('recordingUrl')} className={commonInputClasses} />
                </div>
              )}
            </div>
          </form>

          {/* Tasks Section */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              <button type="button" onClick={() => handleOpenTaskModal(null)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <PlusIcon className="mr-2" />
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
                  {/* ADDED EDIT BUTTON for Task */}
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
              )) : <p className="text-center text-gray-500 py-4">No tasks added yet.</p>}
            </div>
          </div>
        </div>

        {/* Right Column (Saved Exercises) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Saved Exercises</h2>
            <div className="space-y-4">
              {savedExercises.length > 0 ? savedExercises.map(ex => (
                <div key={ex.id} className="p-4 border rounded-md bg-gray-50">
                  <p className="font-semibold text-gray-700">{ex.title}</p>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>Type: <span className="font-medium text-blue-600">{ex.exerciseType}</span></span>
                    <span>Tasks: <span className="font-medium text-purple-600">{ex.tasks.length}</span></span>
                  </div>
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    <button 
                        onClick={() => handleLoadExercise(ex)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                        View/Edit
                    </button>
                    <button
                        onClick={() => handleDeleteExercise(ex.id, ex.title)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                        Delete
                    </button>
                  </div>
                </div>
              )) : <p className="text-center text-gray-500 py-4">No exercises yet. Create your first one!</p>}
            </div>
          </div>
        </div>
      </div>
      
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseTaskModal} // Use the new close handler
        editingTask={editingTask} // Pass the task to edit
        onSaveTask={handleSaveTask} // Use the new save/edit handler
      />
    </>
  );
};

export default ExercisesManagement;