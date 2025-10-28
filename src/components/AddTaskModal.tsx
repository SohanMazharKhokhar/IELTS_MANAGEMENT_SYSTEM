// src/components/AddTaskModal.tsx

import React, { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Task, TaskType, MatchingTask, FillingBlanksTask, MCQTask, QATask, WritingTask } from '../../types'; // Adjust path if needed
import { PlusIcon, TrashIcon } from '../icons'; // Adjust path if needed

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  onSaveTask: (taskData: Task, originalTaskId: string | null) => void;
}

// Form input type for the modal
type TaskFormInputs = {
    taskType: TaskType;
    title: string;
    description: string;
    allowedTime: number;
    // Matching
    group1: { value: string, id?: string }[];
    group2: { value: string, id?: string }[];
    // Filling Blanks
    maxWordsPerBlank: number;
    blanks: { textBefore: string, numBlanks: number, textAfter?: string, id?: string }[];
    // MCQ
    allowMultipleSelections: boolean;
    questions: {
        questionText: string,
        id?: string,
        options: { value: string, id?: string }[]
    }[];
    // QA - Use separate field name
    qaQuestions?: { value: string, id?: string }[];
    maxWordsPerAnswer: number;
    // Writing
    minimumWordCount: number;
};

// Default empty structures
const defaultArrayItem = { value: '' };
const defaultBlankItem = { textBefore: '', numBlanks: 1, textAfter: '' };
const defaultMCQOption = { value: '' };
const defaultMCQQuestion = { questionText: '', options: [defaultMCQOption] };
const defaultQAQuestion = { value: '' };

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, editingTask, onSaveTask }) => {
  const { register, control, handleSubmit, watch, reset, formState: { errors, isValid } } = useForm<TaskFormInputs>({
    mode: 'onChange', // Enable validation on change
    defaultValues: { /* ... defaults ... */ }
  });

  const taskType = watch('taskType');

  // Load data or reset
  useEffect(() => {
    // ... (useEffect logic remains the same as previous correct version)
    if (isOpen) {
        if (editingTask) { /* Load editingTask data */ }
        else { /* Reset to defaults */ }
    }
  }, [isOpen, reset, editingTask]);

  // Field array hooks (remain the same)
  const { fields: g1Fields, append: g1Append, remove: g1Remove } = useFieldArray({ control, name: "group1" });
  // ... (g2Fields, blankFields, qaFields, mcqFields)

  // Submit Handler
  const onSubmit: SubmitHandler<TaskFormInputs> = (data) => {
    console.log('[AddTaskModal] onSubmit triggered. Data:', data);
    console.log('[AddTaskModal] Form Errors:', errors);
    console.log('[AddTaskModal] Form IsValid:', isValid);

    // Stop if form isn't valid (although handleSubmit should prevent this)
    if (!isValid) {
        console.error("[AddTaskModal] Submission attempted with invalid form.");
        alert("Please fix the errors in the form before submitting.");
        return;
    }

    // Process data (ensure IDs, correct structure - same as previous correct version)
    let processedData: Partial<Task> = { /* ... Process based on data.taskType ... */ };
    // ... (Switch statement to build processedData based on taskType)

    const finalTask: Task = {
        ...(editingTask ? { id: editingTask.id } : { id: crypto.randomUUID() }),
        ...processedData
    } as Task;

    console.log('[AddTaskModal] Calling onSaveTask with:', finalTask);
    onSaveTask(finalTask, editingTask ? editingTask.id : null);
    onClose();
  };

  // Common CSS classes (remain the same)
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const buttonClasses = "inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white";
  const errorTextClasses = "text-red-500 text-xs mt-1";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* ... (Modal Header) ... */}
        {/* Form element with submit handler */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto" noValidate> {/* Added noValidate */}
            <div className="p-6 space-y-4">
              {/* Common Fields with Error Display */}
              <div>
                <label htmlFor="taskType" className={labelClasses}>Task Type</label>
                <select id="taskType" {...register('taskType', { required: true })} className={commonInputClasses} disabled={!!editingTask}>
                  {/* Options */}
                   <option value="Matching">Matching</option>
                   <option value="Filling Blanks">Filling Blanks</option>
                   <option value="MCQ">Multiple Choice (MCQ)</option>
                   <option value="QA">Question & Answer (QA)</option>
                   <option value="Writing">Writing</option>
                </select>
              </div>
              <div>
                <label htmlFor="title" className={labelClasses}>Title</label>
                <input type="text" id="title" {...register('title', { required: 'Title is required' })} className={commonInputClasses} placeholder="e.g., Task 1" />
                 {errors.title && <p className={errorTextClasses}>{errors.title.message}</p>}
              </div>
              <div>
                <label htmlFor="description" className={labelClasses}>Description / Instructions</label>
                <textarea id="description" rows={2} {...register('description', { required: 'Description is required' })} className={commonInputClasses} placeholder="Enter instructions"></textarea>
                 {errors.description && <p className={errorTextClasses}>{errors.description.message}</p>}
              </div>
              <div>
                <label htmlFor="allowedTime" className={labelClasses}>Allowed Time (minutes)</label>
                <input type="number" id="allowedTime" {...register('allowedTime', { required: 'Time is required', valueAsNumber: true, min: { value: 1, message: 'Must be >= 1'} })} className={commonInputClasses} />
                 {errors.allowedTime && <p className={errorTextClasses}>{errors.allowedTime.message}</p>}
              </div>
            <hr/>
            {/* Dynamic Fields with Error Display */}
            <div className="space-y-4">
                {/* ... Render fields based on taskType, including error messages below inputs ... */}
                {/* Example for MCQ Option error */}
                {/* <MCQOptions ... errors={errors} /> */}
                {/* Inside MCQOptions */}
                {/* {errors.questions?.[nestIndex]?.options?.[k]?.value && <p className={errorTextClasses}>{errors.questions[nestIndex]?.options[k]?.value?.message}</p>} */}
            </div>
          </div>
          {/* Modal Footer Buttons */}
          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            {/* Button MUST have type="submit" */}
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md hover:bg-blue-700">
                {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MCQ Options sub-component (ensure errors are passed and displayed)
const MCQOptions: React.FC<{ /* ... props ... */ errors: UseFormReturn<TaskFormInputs>['formState']['errors']; }> = ({ /* ... */ errors }) => {
    // ... (useFieldArray logic)
    const errorTextClasses = "text-red-500 text-xs mt-1";
    return (
        <div>
            {/* ... label ... */}
            {fields.map((item, k) => (
                <div key={item.id}>
                    <div className="flex items-center mt-1">
                        <input
                            {...register(`questions.${nestIndex}.options.${k}.value` as const, { required: 'Option value cannot be empty' })}
                            className={`flex-grow mt-1 ... ${errors.questions?.[nestIndex]?.options?.[k]?.value ? 'border-red-500' : 'border-gray-300'} ...`}
                            placeholder={`Option ${k + 1}`}
                        />
                        {/* ... remove button ... */}
                    </div>
                     {/* Display error for this specific option */}
                     {errors.questions?.[nestIndex]?.options?.[k]?.value && <p className={errorTextClasses}>{errors.questions[nestIndex]?.options[k]?.value?.message}</p>}
                </div>
            ))}
            {/* ... add button ... */}
        </div>
    )
}


export default AddTaskModal;