// src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
// Ensure these icons are correctly imported from your icons file
import { UsersIcon, DollarSignIcon, BookOpenIcon, ActivityIcon, ArrowUpIcon } from '../components/icons';
// Import necessary types
import { AppUser, Exercise } from '../types';
// Import the function to get the activity log
import { getActivityLog } from '../utils/activityLogger';
// Import useAuth to get the current user for "Active Now"
import { useAuth } from '../hooks/useAuth';

// Keys used for localStorage (ensure these match keys used elsewhere)
const USERS_STORAGE_KEY = 'ielts_app_users';
const EXERCISES_STORAGE_KEY = 'ielts_saved_exercises';

// --- StatCard Component ---
const StatCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'neutral'; icon: React.ElementType }> = ({ title, value, change, changeType, icon: Icon }) => {
  const isIncrease = changeType === 'increase';
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`flex items-center text-xs mt-1 ${isIncrease ? 'text-green-500' : 'text-gray-500'}`}>
          {isIncrease && <ArrowUpIcon className="w-3 h-3 mr-1" />}
          <span>{change}</span>
        </div>
      </div>
      <div className={`p-3 rounded-full ${isIncrease ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};


const Dashboard: React.FC = () => {
  // State for dynamic data
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const [activities, setActivities] = useState<{ timestamp: string; message: string; }[]>([]);
  const { currentUser } = useAuth(); // Get current user info

  useEffect(() => {
    // --- Load Users with Error Handling ---
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        const users: AppUser[] = JSON.parse(storedUsers);
        // Ensure it's an array before setting length
        if (Array.isArray(users)) {
            setTotalUsers(users.length);
        } else {
            console.warn("[Dashboard] Stored user data is not an array.");
            setTotalUsers(0); // Set to 0 if data is invalid
        }
      } else {
          setTotalUsers(0); // Set to 0 if no data found
      }
    } catch (error) {
      console.error("[Dashboard] Error parsing users from localStorage:", error);
      setTotalUsers(0); // Set to 0 on error
    }

    // --- Load Exercises with Error Handling ---
    try {
      const storedExercises = localStorage.getItem(EXERCISES_STORAGE_KEY);
      if (storedExercises) {
        const exercises: Exercise[] = JSON.parse(storedExercises);
         // Ensure it's an array before setting length
         if (Array.isArray(exercises)) {
            setTotalExercises(exercises.length);
         } else {
             console.warn("[Dashboard] Stored exercise data is not an array.");
             setTotalExercises(0); // Set to 0 if data is invalid
         }
      } else {
          setTotalExercises(0); // Set to 0 if no data found
      }
    } catch (error) {
      console.error("[Dashboard] Error parsing exercises from localStorage:", error);
      setTotalExercises(0); // Set to 0 on error
    }

    // --- Load Activity Log ---
    setActivities(getActivityLog());

  }, []); // Empty dependency array means this runs once on mount

  // --- Quick Stats (Now reflects dynamic data where available) ---
  const activeNowValue = currentUser ? '1 User' : '0 Users';
  const quickStats = [
    { label: 'Completion Rate', value: 'N/A' },   // Placeholder
    { label: 'Avg. Score', value: 'N/A' },        // Placeholder
    { label: 'Active Now', value: activeNowValue }, // Shows if the current admin is logged in
    { label: 'Support Tickets', value: '0 Open' }, // Placeholder
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your IELTS practice platform.</p>

      {/* --- Stat Cards Using State Variables --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard
          title="Total Users"
          value={totalUsers.toString()} // Use dynamic count
          change="Live Count"
          changeType="neutral"
          icon={UsersIcon}
        />
        <StatCard
          title="Active Subscriptions"
          value="0" // Placeholder
          change="N/A"
          changeType="neutral"
          icon={DollarSignIcon}
        />
         <StatCard
          title="Total Exercises"
          value={totalExercises.toString()} // Use dynamic count
          change="Live Count"
          changeType="neutral"
          icon={BookOpenIcon}
         />
        <StatCard
          title="Monthly Revenue"
          value="$0" // Placeholder
          change="N/A"
          changeType="neutral"
          icon={ActivityIcon}
        />
      </div>

      {/* --- Dynamic Sections --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-semibold text-gray-700">Recent Activity</h2>
          <ul className="mt-4 space-y-4 max-h-60 overflow-y-auto"> {/* Added max height and scroll */}
            {/* Render Dynamic Activities from State */}
            {activities.length > 0 ? activities.map((activity, index) => (
              <li key={activity.timestamp + index} className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full mr-4">
                    <ActivityIcon className="w-5 h-5 text-gray-500"/>
                </div>
                <div>
                  {/* Display the logged message */}
                  <p className="text-sm text-gray-600">{activity.message}</p>
                  {/* Display the timestamp */}
                  <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </li>
            )) : (
              // Display message if the log is empty
              <p className="text-sm text-gray-500 italic">No recent activity logged.</p>
            )}
          </ul>
        </div>
        {/* Quick Stats Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-semibold text-gray-700">Quick Stats</h2>
          {/* Render Updated Quick Stats */}
          <ul className="mt-4 space-y-4">
            {quickStats.map(stat => (
              <li key={stat.label} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{stat.label}</span>
                <span className="font-semibold text-gray-800">{stat.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;