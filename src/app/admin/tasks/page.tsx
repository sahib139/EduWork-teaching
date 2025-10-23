'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Eye, RefreshCw, CheckCircle, AlertCircle, Calendar, Trophy, Target, Clock } from 'lucide-react';
import Link from 'next/link';
import { getOrGenerateDailyTasks, isApiKeyConfigured } from '../../../utils/taskGenerator';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  priority: 'hard' | 'medium' | 'easy';
  completed: boolean;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!isApiKeyConfigured()) {
        setError('System not configured. Please set up the Gemini API key first.');
        setIsLoading(false);
        return;
      }

      const dailyTasks = await getOrGenerateDailyTasks();
      setTasks(dailyTasks);
      setCompletedCount(dailyTasks.filter(task => task.completed).length);
      calculateEarnings(dailyTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const calculateEarnings = (taskList: Task[]) => {
    const completedTasks = taskList.filter(task => task.completed).length;
    const totalTasks = taskList.length;

    let earnings = 0;
    if (completedTasks === totalTasks && totalTasks > 0) {
      earnings = 167; // All tasks completed
    } else if (completedTasks > 0) {
      earnings = 130; // At least one task completed
    } else {
      earnings = 0; // No tasks completed
    }

    setTotalEarnings(earnings);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
          <h1 className="text-lg font-semibold text-gray-900">Monitor Progress</h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </header>

      {/* Progress Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-green-600">₹{totalEarnings}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
          <span className="text-sm text-gray-600">
            {completedCount}/{tasks.length} completed
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Tasks</h2>
            <p className="text-gray-600">Checking today&apos;s progress...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Tasks</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadTasks}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Available</h2>
            <p className="text-gray-600">Tasks will be automatically generated when someone visits the site.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Today&apos;s Tasks ({tasks.length})
              </h2>
              <button
                onClick={loadTasks}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
                    task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Task {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedTime} min</span>
                        </div>
                      </div>

                      <h3 className={`font-medium mb-1 ${task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>

                      <p className={`text-sm mb-2 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{task.category}</span>
                        </span>

                        {task.completed && (
                          <span className="text-xs font-medium text-green-600">
                            +₹{task.priority === 'hard' ? '50' : task.priority === 'medium' ? '30' : '20'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {completedCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Progress Update</p>
                      <p className="text-sm text-green-700">
                        {completedCount} of {tasks.length} tasks completed today
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₹{totalEarnings}</p>
                    <p className="text-xs text-green-700">earned today</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-medium text-blue-900 mb-2">📊 System Status</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Tasks are automatically generated when first visited each day</p>
                <p>• Same tasks are shown to all users throughout the day</p>
                <p>• Progress is tracked in real-time</p>
                <p>• New tasks are generated automatically each morning</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
