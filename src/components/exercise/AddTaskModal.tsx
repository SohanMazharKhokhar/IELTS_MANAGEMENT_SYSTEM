// src/components/AddTaskModal.tsx

import React, { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Task, TaskType, MatchingTask, FillingBlanksTask, MCQTask, QATask, WritingTask } from '../../types';
import { PlusIcon, TrashIcon } from '../icons';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // NEW PROP: Pass the task object if editing, or null if creating
  editingTask: Task | null; 
  // RENAME: The handler now receives the task data and the original task ID (if editing)
  onSaveTask: (taskData: Task, originalTaskId: string | null) => void; 
}

// Ensure the form structure can handle all possible fields from the Task union
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
    blanks: { value: string, id?: string }[];
    // MCQ
    allowMultipleSelections: boolean;
    questions: { 
        questionText: string, 
        id?: string, 
        options: { value: string, id?: string }[] 
    }[]; 
    // QA
    maxWordsPerAnswer: number;
    // Writing
    minimumWordCount: number;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, editingTask, onSaveTask }) => {
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<TaskFormInputs>({
    defaultValues: {
      taskType: 'Matching',
      title: '',
      description: '',
      allowedTime: 10,
      group1: [{ value: '' }],
      group2: [{ value: '' }],
      maxWordsPerBlank: 1,
      blanks: [{ value: '' }],
      allowMultipleSelections: false,
      questions: [{ questionText: '', options: [{ value: '' }] }],
      maxWordsPerAnswer: 20,
      minimumWordCount: 150,
    }
  });

  const taskType = watch('taskType');

  useEffect(() => {
    if (isOpen) {
        if (editingTask) {
            // --- LOAD DATA FOR EDITING ---
            const task = editingTask as any; // Cast to any for easy access to union properties
            reset({
                taskType: task.taskType,
                title: task.title,
                description: task.description,
                allowedTime: task.allowedTime,
                
                // Matching
                group1: (task.taskType === 'Matching' ? task.group1 : [{ value: '' }]) || [{ value: '' }],
                group2: (task.taskType === 'Matching' ? task.group2 : [{ value: '' }]) || [{ value: '' }],
                
                // Filling Blanks
                maxWordsPerBlank: task.maxWordsPerBlank || 1,
                blanks: (task.taskType === 'Filling Blanks' ? task.blanks : [{ value: '' }]) || [{ value: '' }],
                
                // MCQ
                allowMultipleSelections: task.allowMultipleSelections || false,
                questions: task.questions || [{ questionText: '', options: [{ value: '' }] }],
                
                // QA
                maxWordsPerAnswer: task.maxWordsPerAnswer || 20,

                // Writing
                minimumWordCount: task.minimumWordCount || 150,
            });
        } else {
            // --- RESET FOR CREATING NEW TASK ---
            reset({
                taskType: 'Matching',
                title: '',
                description: '',
                allowedTime: 10,
                group1: [{ value: '' }],
                group2: [{ value: '' }],
                maxWordsPerBlank: 1,
                blanks: [{ value: '' }],
                allowMultipleSelections: false,
                questions: [{ questionText: '', options: [{ value: '' }] }],
                maxWordsPerAnswer: 20,
                minimumWordCount: 150,
            });
        }
    }
  }, [isOpen, reset, editingTask]);

  const { fields: g1Fields, append: g1Append, remove: g1Remove } = useFieldArray({ control, name: "group1" });
  const { fields: g2Fields, append: g2Append, remove: g2Remove } = useFieldArray({ control, name: "group2" });
  const { fields: blankFields, append: blankAppend, remove: blankRemove } = useFieldArray({ control, name: "blanks" });
  const { fields: qaFields, append: qaAppend, remove: qaRemove } = useFieldArray({ control, name: "questions" });
  const { fields: mcqFields, append: mcqAppend, remove: mcqRemove } = useFieldArray({ control, name: "questions" });

  const onSubmit: SubmitHandler<TaskFormInputs> = (data) => {
    // 1. Process data and ensure all array items have IDs
    const processedData: any = {
        ...data,
        group1: data.group1?.map(item => ({ ...item, id: item.id || new Date().toISOString() })),
        group2: data.group2?.map(item => ({ ...item, id: item.id || new Date().toISOString() })),
        blanks: data.blanks?.map(item => ({ ...item, id: item.id || new Date().toISOString() })),
        questions: data.questions?.map(q => ({ 
            ...q, 
            id: q.id || new Date().toISOString(),
            options: q.options?.map((opt: any) => ({ ...opt, id: opt.id || new Date().toISOString() }))
        })),
    }

    // 2. Create the final Task object (preserving original ID if editing)
    const finalTask: Task = { 
        ...(editingTask ? editingTask : { id: new Date().toISOString() }),
        ...processedData 
    } as unknown as Task;

    // 3. Call the modified handler
    onSaveTask(finalTask, editingTask ? editingTask.id : null);
    onClose();
  };
  
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const buttonClasses = "inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto">
          {/* ... (Common Fields: Task Type, Title, Description, Allowed Time - Remain the same) ... */}
          
            <div className="p-6 space-y-4">
              {/* Common Fields */}
              <div>
                <label htmlFor="taskType" className={labelClasses}>Task Type</label>
                <select id="taskType" {...register('taskType', { required: true })} className={commonInputClasses} disabled={!!editingTask}>
                  <option value="Matching">Matching</option>
                  <option value="Filling Blanks">Filling Blanks</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="QA">Question & Answer (QA)</option>
                  <option value="Writing">Writing</option>
                </select>
              </div>
              <div>
                <label htmlFor="title" className={labelClasses}>Title</label>
                <input type="text" id="title" {...register('title', { required: true })} className={commonInputClasses} placeholder="e.g., Task 1: Match headings" />
              </div>
              <div>
                <label htmlFor="description" className={labelClasses}>Description / Instructions</label>
                <textarea id="description" rows={2} {...register('description', { required: true })} className={commonInputClasses} placeholder="Enter task instructions"></textarea>
              </div>
              <div>
                <label htmlFor="allowedTime" className={labelClasses}>Allowed Time (minutes)</label>
                <input type="number" id="allowedTime" {...register('allowedTime', { required: true, valueAsNumber: true, min: 1 })} className={commonInputClasses} />
              </div>

            <hr/>
            
            {/* Dynamic Fields (remain the same, but now load data) */}
            <div className="space-y-4">
              {taskType === 'Matching' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Group 1 */}
                  <div>
                    <h3 className="font-medium mb-2">Group 1 Items</h3>
                    {g1Fields.map((field, index) => (
                      <div key={field.id} className="flex items-center mb-2">
                        <input {...register(`group1.${index}.value` as const)} className={commonInputClasses} />
                        <button type="button" onClick={() => g1Remove(index)} className="ml-2 text-red-500"><TrashIcon /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => g1Append({ value: '' })} className={`${buttonClasses} bg-blue-500 hover:bg-blue-600`}><PlusIcon className="mr-1"/> Add Item</button>
                  </div>
                   {/* Group 2 */}
                   <div>
                    <h3 className="font-medium mb-2">Group 2 Items</h3>
                    {g2Fields.map((field, index) => (
                      <div key={field.id} className="flex items-center mb-2">
                        <input {...register(`group2.${index}.value` as const)} className={commonInputClasses} />
                        <button type="button" onClick={() => g2Remove(index)} className="ml-2 text-red-500"><TrashIcon /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => g2Append({ value: '' })} className={`${buttonClasses} bg-blue-500 hover:bg-blue-600`}><PlusIcon className="mr-1"/> Add Item</button>
                  </div>
                </div>
              )}

              {taskType === 'Filling Blanks' && (
                  <div>
                    <label htmlFor="maxWordsPerBlank" className={labelClasses}>Max Words per Blank</label>
                    <input type="number" id="maxWordsPerBlank" {...register('maxWordsPerBlank', {valueAsNumber: true})} className={commonInputClasses} />
                    <h3 className="font-medium mt-4 mb-2">Blanks Content</h3>
                     {blankFields.map((field, index) => (
                      <div key={field.id} className="flex items-center mb-2">
                         <input {...register(`blanks.${index}.value` as const)} className={commonInputClasses} placeholder="Text for blank..."/>
                        <button type="button" onClick={() => blankRemove(index)} className="ml-2 text-red-500"><TrashIcon/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => blankAppend({ value: '' })} className={`${buttonClasses} bg-blue-500 hover:bg-blue-600`}><PlusIcon className="mr-1"/>Add Blank</button>
                </div>
              )}

              {taskType === 'MCQ' && (
                <div>
                  <div className="flex items-center">
                    <input type="checkbox" id="allowMultipleSelections" {...register('allowMultipleSelections')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="allowMultipleSelections" className="ml-2 block text-sm text-gray-900">Allow Multiple Selections</label>
                  </div>
                  <h3 className="font-medium mt-4 mb-2">Questions</h3>
                  {mcqFields.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-md mb-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <label className={labelClasses}>Question {index + 1}</label>
                            <button type="button" onClick={() => mcqRemove(index)} className="text-red-500"><TrashIcon /></button>
                        </div>
                      <input {...register(`questions.${index}.questionText` as const)} className={commonInputClasses} placeholder="Question text" />
                      
                      <div className="ml-4 mt-2">
                         <MCQOptions control={control} nestIndex={index} register={register} />
                      </div>
                    </div>
                  ))}
                  <button 
                      type="button" 
                      onClick={() => mcqAppend({ 
                          questionText: '', 
                          options: [{ value: '', id: new Date().toISOString() }] 
                      })} 
                      className={`${buttonClasses} bg-blue-500 hover:bg-blue-600`}
                  >
                      <PlusIcon className="mr-1"/>Add Question
                  </button>
                </div>
              )}

              {taskType === 'QA' && (
                 <div>
                    <label htmlFor="maxWordsPerAnswer" className={labelClasses}>Max Words per Answer</label>
                    <input type="number" id="maxWordsPerAnswer" {...register('maxWordsPerAnswer', {valueAsNumber: true})} className={commonInputClasses} />
                    <h3 className="font-medium mt-4 mb-2">Questions</h3>
                    {qaFields.map((field, index) => (
                       <div key={field.id} className="flex items-center mb-2">
                          <input {...register(`questions.${index}.value` as const)} className={commonInputClasses} placeholder={`Question ${index + 1}`} />
                          <button type="button" onClick={() => qaRemove(index)} className="ml-2 text-red-500"><TrashIcon /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => qaAppend({ value: '' })} className={`${buttonClasses} bg-blue-500 hover:bg-blue-600`}><PlusIcon className="mr-1"/>Add Question</button>
                </div>
              )}

              {taskType === 'Writing' && (
                 <div>
                    <label htmlFor="minimumWordCount" className={labelClasses}>Minimum Word Count</label>
                    <input type="number" id="minimumWordCount" {...register('minimumWordCount', {valueAsNumber: true})} className={commonInputClasses} />
                 </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md hover:bg-blue-700">
                {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Use UseFormReturn<TaskFormInputs> for stronger type checking
const MCQOptions: React.FC<{nestIndex: number, control: UseFormReturn<TaskFormInputs>['control'], register: UseFormReturn<TaskFormInputs>['register']}> = ({ nestIndex, control, register }) => {
    const { fields, remove, append } = useFieldArray({
        control,
        name: `questions.${nestIndex}.options` as const
    });

    return (
        <div>
            <label className="text-sm font-medium text-gray-600">Options</label>
            {fields.map((item, k) => (
                <div key={item.id} className="flex items-center mt-1">
                    <input
                        {...register(`questions.${nestIndex}.options.${k}.value` as const)}
                        className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 sm:text-sm"
                        placeholder={`Option ${k + 1}`}
                    />
                    <button type="button" onClick={() => remove(k)} className="ml-2 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                </div>
            ))}
            <button type="button" onClick={() => append({ value: '', id: new Date().toISOString() })} className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-500 hover:bg-green-600">
                <PlusIcon className="w-3 h-3 mr-1"/>Add Option
            </button>
        </div>
    )
}

export default AddTaskModal;