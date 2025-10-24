// This is your fully corrected LoginPage.tsx

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form'; // <-- Import SubmitHandler
import { useAuth } from '../hooks/useAuth';
import { EmailIcon, LockIcon } from '../components/icons';

// Define the shape of your form data
type FormInputs = {
    email: string;
    password: string;
};

interface LoginPageProps {
    // No props needed here anymore
}

const LoginPage: React.FC<LoginPageProps> = () => { 
    // Register the form
    const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
    
    // Get login function from auth hook
    const { login } = useAuth();
    
    // DEFINE THE MISSING STATE
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // DEFINE THE MISSING ONSUBMIT FUNCTION
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsLoading(true);
        setLoginError(null);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        const success = await login(data.email, data.password);
        if (!success) {
            setLoginError('Invalid email or password. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 to-secondary items-center justify-center p-12">
                <div className="text-white text-center">
                    <h1 className="text-5xl font-bold mb-4">IELTS Admin Portal</h1>
                    <p className="text-lg text-primary-100">Your all-in-one solution for managing IELTS content with ease and precision.</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="text-gray-500 mt-2">Please sign in to continue.</p>
                    </div>
                    
                    {/* Pass the defined onSubmit function to handleSubmit */}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {loginError && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{loginError}</p>}
                        
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <EmailIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                                    className="w-full bg-white pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password', { required: 'Password is required' })}
                                    className="w-full bg-white pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 transition-colors duration-300"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    
                    {/* The signup <p> tag is now correctly removed */}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;