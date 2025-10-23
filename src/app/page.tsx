'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Settings, Star, Calendar, Trophy, Target, Key, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getOrGenerateDailyTasks, isApiKeyConfigured } from '../utils/taskGenerator';
import { getMonthlyEarnings } from '../utils/earnings';

// Removed unused Task interface

function QuickStats() {
  const [taskCount, setTaskCount] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Check if API key is configured - redirect to setup if not
      if (!isApiKeyConfigured()) {
        setTaskCount(0);
        setTodayEarnings(0);
        return;
      }

      // Get or generate tasks for today (this will trigger automatic generation if needed)
      const tasks = await getOrGenerateDailyTasks();
      setTaskCount(tasks.length);

      // Calculate today's earnings based on completion status
      const completedTasks = tasks.filter(task => task.completed).length;
      const totalTasks = tasks.length;
      let earnings = 0;

      if (completedTasks === totalTasks && totalTasks > 0) {
        // All tasks completed: ₹167 per day
        earnings = 167;
      } else if (completedTasks > 0) {
        // At least one task completed: ₹130 per day
        earnings = 130;
      } else {
        // No tasks completed: ₹0
        earnings = 0;
      }
      setTodayEarnings(earnings);
      setMonthlyEarnings(getMonthlyEarnings());
    } catch (error) {
      console.error('Error loading stats:', error);
      setTaskCount(0);
      setTodayEarnings(0);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">{taskCount}</div>
        <p className="text-sm text-gray-600">Tasks Today</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">₹{todayEarnings}</div>
        <p className="text-sm text-gray-600">Today&apos;s Earnings</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">₹{monthlyEarnings}</div>
        <p className="text-sm text-gray-600">Monthly Earnings</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin mode is enabled
    const adminMode = localStorage.getItem('eduwork_admin_mode');
    setIsAdmin(adminMode === 'true');
  }, []);

  const toggleAdminMode = () => {
    const newAdminMode = !isAdmin;
    setIsAdmin(newAdminMode);
    localStorage.setItem('eduwork_admin_mode', newAdminMode.toString());
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduWork</h1>
              <p className="text-sm text-gray-600">Teaching Platform</p>
            </div>
          </div>

          {/* Admin Toggle */}
          <button
            onClick={toggleAdminMode}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={isAdmin ? "Switch to User Mode" : "Switch to Admin Mode"}
          >
            {/* <Settings className={`w-5 h-5 ${isAdmin ? 'text-blue-600' : 'text-gray-400'}`} /> */}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {isAdmin ? (
          /* Admin Dashboard */
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {!isApiKeyConfigured() && (
                  <Link
                    href="/setup"
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-1 rounded">
                        <Key className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Setup Required</p>
                        <p className="text-sm text-gray-600">Configure Gemini API key</p>
                      </div>
                    </div>
                    <div className="text-orange-600">→</div>
                  </Link>
                )}

                <Link
                  href="/admin/tasks"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Monitor Progress</p>
                      <p className="text-sm text-gray-600">View task completion & earnings</p>
                    </div>
                  </div>
                  <div className="text-blue-600">→</div>
                </Link>

                <Link
                  href="/admin/progress"
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">View Progress</p>
                      <p className="text-sm text-gray-600">Track completion & earnings</p>
                    </div>
                  </div>
                  <div className="text-green-600">→</div>
                </Link>

                <Link
                  href="/bank"
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Bank Details</p>
                      <p className="text-sm text-gray-600">Manage payout information</p>
                    </div>
                  </div>
                  <div className="text-purple-600">→</div>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* User Dashboard */
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-900">Welcome back!</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Ready to make a difference in young minds today? Let&apos;s see what tasks await you.
              </p>
            </div>

            {/* Today's Tasks Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Today&apos;s Tasks</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <Link
                href="/tasks"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>View My Tasks</span>
              </Link>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Bank Details</h3>
              </div>
              <p className="text-gray-600 mb-4">Add or update payout account information.</p>
              <Link
                href="/bank"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                Manage Bank Details
              </Link>
            </div>

            {/* Quick Stats */}
            <QuickStats />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-4">
        <div className="text-center text-sm text-gray-500">
          <p>Empowering educators, inspiring young minds</p>
        </div>
      </footer>
    </div>
  );
}
