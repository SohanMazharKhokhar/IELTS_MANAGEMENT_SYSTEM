// src/pages/ExerciseForm.tsx

import React, { useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Exercise, Task, ExerciseType } from '../types';
import AddTaskModal from '../components/AddTaskModal'; // Ensure this path is correct
import { PlusIcon, SaveIcon, TrashIcon } from '../components/icons'; // Ensure this path is correct
import { logActivity } from '../utils/activityLogger'; // Ensure this path is correct

type ExerciseFormInputs = Omit<Exercise, 'id' | 'tasks'>;

interface ExerciseFormProps {
    exerciseToEdit: Exercise | null;
    moduleType: ExerciseType;
    onClose: () => void; // Function to go back to the list view
}

const EXERCISES_STORAGE_KEY = 'ielts_saved_exercises';
const getExercisesFromStorage = (): Exercise[] => {
    const stored = localStorage.getItem(EXERCISES_STORAGE_KEY);
    try {
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (error) {
        console.error("Error parsing exercises from storage:", error);
    }
    return []; // Return empty array if no data or error
};

const ExerciseForm: React.FC<ExerciseFormProps> = ({ exerciseToEdit, moduleType, onClose }) => {
  const isEditing = !!exerciseToEdit;

  // Initialize tasks safely: existing tasks if editing, otherwise empty array
  const [currentTasks, setCurrentTasks] = useState<Task[]>(exerciseToEdit ? exerciseToEdit.tasks : []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Refs for hidden file inputs
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const recordingFileInputRef = useRef<HTMLInputElement>(null);
  // State for selected file names
  const [selectedImageFileName, setSelectedImageFileName] = useState<string | null>(null);
  const [selectedRecordingFileName, setSelectedRecordingFileName] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors, isValid } } = useForm<ExerciseFormInputs>({
    mode: 'onChange', // Enable validation on change for better UX
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

  const currentExerciseType = watch('exerciseType', moduleType); // Watch form value

  // --- TASK MODAL HANDLERS ---
  const handleOpenTaskModal = (taskToEdit: Task | null) => { setEditingTask(taskToEdit); setIsModalOpen(true); }
  const handleCloseTaskModal = () => { setEditingTask(null); setIsModalOpen(false); }

  // --- REFINED handleSaveTask for State Updates ---
  const handleSaveTask = (taskData: Task, originalTaskId: string | null) => {
    console.log('[ExerciseForm] handleSaveTask called with:', taskData);
    if (originalTaskId) {
        // EDIT TASK: Create a new array with the updated task
        setCurrentTasks(prevTasks => {
            const updatedTasks = prevTasks.map(t =>
                t.id === originalTaskId ? { ...taskData } : t // Ensure a new object reference
            );
            console.log('[ExerciseForm] Updated currentTasks (edit):', updatedTasks);
            return updatedTasks; // Return the new array reference
        });
    } else {
        // ADD NEW TASK: Create a new array including the new task
        setCurrentTasks(prevTasks => {
            const updatedTasks = [...prevTasks, { ...taskData }]; // Ensure new array and object reference
            console.log('[ExerciseForm] Updated currentTasks (add):', updatedTasks);
            return updatedTasks; // Return the new array reference
        });
    }
  };
  // --- END REFINED ---

  const handleRemoveTask = (taskId: string) => { setCurrentTasks(prev => prev.filter(task => task.id !== taskId)); };

  // --- MAIN FORM SUBMISSION (Save Exercise) ---
  const onSaveExercise: SubmitHandler<ExerciseFormInputs> = (data) => {
    console.log('[ExerciseForm] onSaveExercise attempt. Data:', data);
    console.log('[ExerciseForm] Current tasks:', currentTasks);
    console.log('[ExerciseForm] Form Errors:', errors);
    console.log('[ExerciseForm] Form IsValid:', isValid);

    if (currentTasks.length === 0) {
      alert("Cannot save exercise: Please add at least one task using the 'Add New Task' button.");
      console.log('[ExerciseForm] Save prevented: No tasks added.');
      return;
    }
     // Check validity again (although handleSubmit handles it, this is an extra safety net)
     if (!isValid) {
        alert("Please fix the errors in the Exercise Details form before saving.");
        console.log('[ExerciseForm] Save prevented: Form is invalid.');
        return;
     }

    const allExercises: Exercise[] = getExercisesFromStorage();
    let updatedExercises: Exercise[];
    let savedExerciseTitle = data.title;

    if (isEditing && exerciseToEdit) {
        console.log('[ExerciseForm] Updating existing exercise:', exerciseToEdit.id);
        updatedExercises = allExercises.map(ex =>
            ex.id === exerciseToEdit.id
                ? { ...exerciseToEdit, ...data, tasks: currentTasks, exerciseType: moduleType }
                : ex
        );
        logActivity(`Exercise '${savedExerciseTitle}' (ID: ${exerciseToEdit.id.substring(0,5)}) updated`);
    } else {
        const newExercise: Exercise = {
          id: crypto.randomUUID(),
          ...data,
          tasks: currentTasks,
          exerciseType: moduleType,
        };
        console.log('[ExerciseForm] Creating new exercise:', newExercise);
        updatedExercises = [...allExercises, newExercise];
        savedExerciseTitle = newExercise.title;
        logActivity(`New exercise '${savedExerciseTitle}' created`);
    }
    localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(updatedExercises));
    console.log('[ExerciseForm] Saved exercises to localStorage.');
    onClose(); // Go back to the list view
  };

  // --- File Picker Handlers ---
  const handleImageButtonClick = () => { imageFileInputRef.current?.click(); };
  const handleRecordingButtonClick = () => { recordingFileInputRef.current?.click(); };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'recording') => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const fieldToUpdate = fileType === 'image' ? 'imageUrl' : 'recordingUrl';
      const stateSetter = fileType === 'image' ? setSelectedImageFileName : setSelectedRecordingFileName;

      stateSetter(fileName);
      setValue(fieldToUpdate, `local_file:${fileName}`); // Update input field
      console.log(`[ExerciseForm] Selected ${fileType} file:`, fileName);
    } else {
      const stateSetter = fileType === 'image' ? setSelectedImageFileName : setSelectedRecordingFileName;
      stateSetter(null);
    }
    // Reset the input value so the same file can be selected again
    if (event.target) event.target.value = '';
  };

  // Common CSS classes
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const errorTextClasses = "text-red-500 text-xs mt-1";

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{isEditing ? `Edit ${moduleType} Exercise` : `Create New ${moduleType} Exercise`}</h1>
        <button type="button" onClick={onClose} className="text-blue-600 hover:text-blue-800 flex items-center font-medium">
             &larr; Back to List
        </button>
      </div>

      {/* Main form element */}
      <form onSubmit={handleSubmit(onSaveExercise)} className="bg-white p-6 rounded-lg shadow-md mb-8" noValidate>
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800">Exercise Details</h2>
            {/* Save Button - Type MUST be submit */}
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <SaveIcon className="mr-2 w-4 h-4" />
              {isEditing ? 'Update Exercise' : 'Save New Exercise'}
            </button>
        </div>

        {/* Form fields grid with error display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelClasses}>Exercise Type</label>
                <input type="text" value={moduleType} readOnly className={`${commonInputClasses} bg-gray-100 text-gray-500`} />
            </div>
            <div>
                <label htmlFor="title" className={labelClasses}>Title</label>
                <input type="text" id="title" {...register('title', { required: 'This field is required' })} className={commonInputClasses} />
                {errors.title && <p className={errorTextClasses}>{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className={labelClasses}>Description</label>
                <textarea id="description" rows={3} {...register('description', { required: 'This field is required' })} className={commonInputClasses}></textarea>
                {errors.description && <p className={errorTextClasses}>{errors.description.message}</p>}
            </div>
            <div>
                <label htmlFor="allowedTime" className={labelClasses}>Allowed Time (minutes)</label>
                <input type="number" id="allowedTime" {...register('allowedTime', { required: 'This field is required', valueAsNumber: true, min: { value: 1, message: 'Must be at least 1'} })} className={commonInputClasses} />
                {errors.allowedTime && <p className={errorTextClasses}>{errors.allowedTime.message}</p>}
            </div>

            {/* Conditional Passage/Media Fields - Use 'moduleType' prop for stability */}
            {(moduleType === 'Reading' || moduleType === 'Writing') && (
                <div className="md:col-span-2">
                    <label htmlFor="passage" className={labelClasses}>Passage / Task Prompt</label>
                    <textarea id="passage" rows={5} {...register('passage')} className={commonInputClasses}></textarea>
                    {/* Optional: Add validation error display if passage becomes required */}
                </div>
            )}

            {moduleType === 'Reading' && (
                <div className="md:col-span-2">
                    <label htmlFor="imageUrl" className={labelClasses}>Image URL (for charts/diagrams)</label>
                    <div className="flex items-center space-x-2">
                        <input type="text" id="imageUrl" {...register('imageUrl')} className={commonInputClasses + " flex-grow"} placeholder="Enter URL or choose local file" />
                        <input type="file" ref={imageFileInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />
                        <button type="button" onClick={handleImageButtonClick} className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Choose Image</button>
                    </div>
                    {selectedImageFileName && (<p className="text-xs text-gray-500 mt-1">Selected: {selectedImageFileName}</p>)}
                    {/* Optional: Add validation error display for URL format if needed */}
                </div>
            )}

            {(moduleType === 'Listening' || moduleType === 'Speaking') && (
                <div className="md:col-span-2">
                    <label htmlFor="recordingUrl" className={labelClasses}>Recording URL</label>
                     <div className="flex items-center space-x-2">
                        <input type="text" id="recordingUrl" {...register('recordingUrl')} className={commonInputClasses + " flex-grow"} placeholder="Enter URL or choose local file" />
                        <input type="file" ref={recordingFileInputRef} onChange={(e) => handleFileChange(e, 'recording')} accept="audio/*,video/*" className="hidden" />
                        <button type="button" onClick={handleRecordingButtonClick} className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Choose File</button>
                    </div>
                     {selectedRecordingFileName && (<p className="text-xs text-gray-500 mt-1">Selected: {selectedRecordingFileName}</p>)}
                     {/* Optional: Add validation error display */}
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
            // Ensure task.id is used as the key for reliable re-renders
            <div key={task.id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-semibold text-gray-700">{index + 1}. {task.title}</p>
                <p className="text-sm text-gray-500">Type: {task.taskType}</p>
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => handleOpenTaskModal(task)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                <button type="button" onClick={() => handleRemoveTask(task.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
              </div>
            </div>
          )) : <p className="text-center text-gray-500 py-4">No tasks added yet. Add tasks above.</p>}
        </div>
      </div>

      {/* Task Modal Call */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseTaskModal}
        editingTask={editingTask}
        onSaveTask={handleSaveTask} // Ensure this prop name matches AddTaskModal
      />
    </>
  );
};

export default ExerciseForm;