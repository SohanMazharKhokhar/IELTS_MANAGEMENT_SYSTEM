
import React from 'react';
import { UsersIcon, DollarSignIcon, BookOpenIcon, ActivityIcon, ArrowUpIcon } from '../components/icons';

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
  const activities = [
    "New user 'john.doe@email.com' registered 1 hour ago.",
    "Exercise 'Reading Part 1' was updated 3 hours ago.",
    "Subscription for 'jane.smith@email.com' was renewed 5 hours ago.",
    "A new support ticket was opened 1 day ago.",
    "Monthly revenue report was generated 2 days ago.",
  ];

  const quickStats = [
    { label: 'Completion Rate', value: '78.5%' },
    { label: 'Avg. Score', value: '6.8 / 9.0' },
    { label: 'Active Now', value: '234 users' },
    { label: 'Support Tickets', value: '12 open' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your IELTS practice platform.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Users" value="2,543" change="+12.5% from last month" changeType="increase" icon={UsersIcon} />
        <StatCard title="Active Subscriptions" value="1,834" change="+8.2% from last month" changeType="increase" icon={DollarSignIcon} />
        <StatCard title="Total Exercises" value="156" change="+24 from last month" changeType="neutral" icon={BookOpenIcon} />
        <StatCard title="Monthly Revenue" value="$45,231" change="+15.3% from last month" changeType="increase" icon={ActivityIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-semibold text-gray-700">Recent Activity</h2>
          <ul className="mt-4 space-y-4">
            {activities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full mr-4">
                    <UsersIcon className="w-5 h-5 text-gray-500"/>
                </div>
                <p className="text-sm text-gray-600">{activity}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-semibold text-gray-700">Quick Stats</h2>
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
