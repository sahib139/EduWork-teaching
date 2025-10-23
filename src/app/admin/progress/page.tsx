'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface DailyStats {
  date: string;
  completedTasks: number;
  totalTasks: number;
  earnings: number;
  completionRate: number;
}

export default function AdminProgressPage() {
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const loadData = useCallback(() => {
    // Load current day's tasks
    const savedTasks = localStorage.getItem('eduwork_daily_tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      setCurrentTasks(tasks);
    }

    // Load or initialize stats
    const savedStats = localStorage.getItem('eduwork_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      // Initialize with empty stats
      setStats([]);
    }

    calculateTotalEarnings();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateTotalEarnings = () => {
    const savedStats = localStorage.getItem('eduwork_stats');
    if (savedStats) {
      const statsData = JSON.parse(savedStats);
      const total = statsData.reduce((sum: number, day: DailyStats) => sum + day.earnings, 0);
      setTotalEarnings(total);
    }
  };

  const calculateEarningsForTasks = (tasks: Task[]) => {
    return tasks.reduce((total, task) => {
      if (task.completed) {
        switch (task.priority) {
          case 'high': return total + 50;
          case 'medium': return total + 30;
          case 'low': return total + 20;
          default: return total + 25;
        }
      }
      return total;
    }, 0);
  };

  const saveTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const completedTasks = currentTasks.filter(task => task.completed).length;

    // Calculate earnings based on new system: 167 for all complete, 130 for partial, 0 for none
    let dayEarnings = 0;
    if (completedTasks === currentTasks.length && currentTasks.length > 0) {
      dayEarnings = 167; // All tasks completed
    } else if (completedTasks > 0) {
      dayEarnings = 130; // At least one task completed
    } else {
      dayEarnings = 0; // No tasks completed
    }

    const todayStats: DailyStats = {
      date: today,
      completedTasks,
      totalTasks: currentTasks.length,
      earnings: dayEarnings,
      completionRate: currentTasks.length > 0 ? (completedTasks / currentTasks.length) * 100 : 0
    };

    // Update stats array
    const updatedStats = stats.filter(stat => stat.date !== today); // Remove existing entry for today
    updatedStats.push(todayStats);

    // Sort by date (newest first)
    updatedStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setStats(updatedStats);
    localStorage.setItem('eduwork_stats', JSON.stringify(updatedStats));
    calculateTotalEarnings();
  };

  const addManualEarnings = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];

    // Find today's stats or create new
    let todayStats = stats.find(stat => stat.date === today);
    if (!todayStats) {
      todayStats = {
        date: today,
        completedTasks: 0,
        totalTasks: 0,
        earnings: 0,
        completionRate: 0
      };
    }

    // Add manual earnings
    todayStats.earnings += amount;

    // Update stats array
    const updatedStats = stats.filter(stat => stat.date !== today);
    updatedStats.push(todayStats);
    updatedStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setStats(updatedStats);
    localStorage.setItem('eduwork_stats', JSON.stringify(updatedStats));
    calculateTotalEarnings();
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all progress data? This cannot be undone.')) {
      localStorage.removeItem('eduwork_stats');
      localStorage.removeItem('eduwork_daily_tasks');
      localStorage.removeItem('eduwork_tasks_date');
      setStats([]);
      setCurrentTasks([]);
      setTotalEarnings(0);
    }
  };

  const completedTasks = currentTasks.filter(task => task.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Progress & Earnings</h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Today's Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Overview</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedTasks}</div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{calculateEarningsForTasks(currentTasks)}
              </div>
              <p className="text-sm text-gray-600">Today&apos;s Earnings</p>
            </div>
          </div>

          <button
            onClick={saveTodayStats}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Today&apos;s Progress
          </button>
        </div>

        {/* Manual Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Manual Earnings</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add additional earnings for work done outside of daily tasks
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[100, 250, 500].map(amount => (
              <button
                key={amount}
                onClick={() => addManualEarnings(amount)}
                className="bg-green-50 text-green-700 border border-green-200 py-2 px-3 rounded-lg hover:bg-green-100 font-medium"
              >
                +₹{amount}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Overall Statistics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.length}</div>
              <p className="text-sm text-gray-600">Active Days</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹{totalEarnings}</div>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
          </div>

          {/* Monthly Goal Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Monthly Goal Progress</span>
              <span>₹{totalEarnings} / ₹5,010</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalEarnings / 5010) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {Math.round((totalEarnings / 5010) * 100)}% of monthly goal achieved
            </p>
          </div>
        </div>

        {/* Recent Days */}
        {stats.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

            <div className="space-y-3">
              {stats.slice(0, 7).map(stat => (
                <div key={stat.date} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(stat.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {stat.completedTasks}/{stat.totalTasks} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{stat.earnings}</p>
                    <p className="text-xs text-gray-500">{Math.round(stat.completionRate)}% done</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Management */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Data Management</h2>
          <p className="text-sm text-red-700 mb-4">
            Use this option to reset all progress data. This action cannot be undone.
          </p>
          <button
            onClick={clearAllData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            Clear All Data
          </button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tips for Supporting Progress:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Celebrate small wins and completed tasks</li>
            <li>• Gradually increase task complexity as confidence grows</li>
            <li>• Use manual earnings for special achievements</li>
            <li>• Track patterns to understand what motivates her most</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
