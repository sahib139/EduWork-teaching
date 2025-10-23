'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Circle, Clock, Target, Trophy, Calendar, AlertCircle, Upload, FileText, Video, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getOrGenerateDailyTasks, isApiKeyConfigured, Task } from '../../utils/taskGenerator';
import { setTodayEarnings, getMonthlyEarnings } from '../../utils/earnings';


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [uploadedContent, setUploadedContent] = useState<{[taskId: string]: {type: string, name: string, size: string}[]}>({});
  const [uploading, setUploading] = useState<{[taskId: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<{[taskId: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        setError('System not configured. Redirecting to setup...');
        setTimeout(() => {
          window.location.href = '/setup';
        }, 2000);
        setIsLoading(false);
        return;
      }

      // Get or generate tasks for today
      const dailyTasks = await getOrGenerateDailyTasks();
      setTasks(dailyTasks);
      setCompletedCount(dailyTasks.filter(task => task.completed).length);
      calculateEarnings(dailyTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadUploadedContent();
  }, [loadTasks]);

  const loadUploadedContent = () => {
    const saved = localStorage.getItem('eduwork_uploaded_content');
    if (saved) {
      setUploadedContent(JSON.parse(saved));
    }
  };

  const simulateFileUpload = async (taskId: string, fileType: 'text' | 'video' | 'image' | 'document') => {
    const fileTypes = {
      text: { ext: '.txt', size: '2.1 KB', description: 'Text Document' },
      video: { ext: '.mp4', size: '45.8 MB', description: 'Video File' },
      image: { ext: '.jpg', size: '1.2 MB', description: 'Image File' },
      document: { ext: '.pdf', size: '892 KB', description: 'PDF Document' }
    };

    const fileInfo = fileTypes[fileType];

    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = fileType === 'text' ? '.txt,.doc,.docx' :
                  fileType === 'video' ? '.mp4,.avi,.mov' :
                  fileType === 'image' ? '.jpg,.jpeg,.png,.gif' :
                  '.pdf,.doc,.docx';

    return new Promise<void>((resolve) => {
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) {
          resolve(); // User cancelled
          return;
        }

        const fileName = file.name;

        // Start upload process
        setUploading(prev => ({ ...prev, [taskId]: true }));
        setUploadProgress(prev => ({ ...prev, [taskId]: 0 }));

        // Simulate upload progress (10 seconds total)
        const totalDuration = 10000; // 10 seconds
        const updateInterval = 100; // Update every 100ms
        const totalSteps = totalDuration / updateInterval;

        for (let step = 0; step <= totalSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, updateInterval));
          const progress = Math.min((step / totalSteps) * 100, 100);
          setUploadProgress(prev => ({ ...prev, [taskId]: progress }));
        }

        // Upload complete
        const newContent = {
          type: fileType,
          name: fileName,
          size: `${(file.size / 1024).toFixed(1)} KB`
        };

        const updatedContent = {
          ...uploadedContent,
          [taskId]: [...(uploadedContent[taskId] || []), newContent]
        };

        setUploadedContent(updatedContent);
        localStorage.setItem('eduwork_uploaded_content', JSON.stringify(updatedContent));

        // End upload simulation
        setUploading(prev => ({ ...prev, [taskId]: false }));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[taskId];
          return newProgress;
        });

        // Show success message
        alert(`✅ ${fileInfo.description} uploaded successfully!\n📁 File: ${fileName}\n📊 Size: ${(file.size / 1024).toFixed(1)} KB`);
        resolve();
      };

      input.click();
    });
  };

  const deleteUploadedFile = (taskId: string, fileIndex: number) => {
    if (confirm('Are you sure you want to delete this uploaded file?')) {
      const updatedContent = { ...uploadedContent };
      updatedContent[taskId] = updatedContent[taskId].filter((_, index) => index !== fileIndex);

      if (updatedContent[taskId].length === 0) {
        delete updatedContent[taskId];
      }

      setUploadedContent(updatedContent);
      localStorage.setItem('eduwork_uploaded_content', JSON.stringify(updatedContent));
    }
  };

  

  const calculateEarnings = (taskList: Task[]) => {
    const completedTasks = taskList.filter(task => task.completed).length;
    const totalTasks = taskList.length;

    let todayEarnings = 0;

    if (completedTasks === totalTasks && totalTasks > 0) {
      // All tasks completed: ₹167 per day
      todayEarnings = 167;
    } else if (completedTasks > 0) {
      // At least one task completed: ₹130 per day
      todayEarnings = 130;
    } else {
      // No tasks completed: ₹0
      todayEarnings = 0;
    }

    setTotalEarnings(todayEarnings);
    // Persist daily and update monthly aggregate
    setTodayEarnings(todayEarnings);
    setMonthlyEarnings(getMonthlyEarnings());
  };

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    setTasks(updatedTasks);
    setCompletedCount(updatedTasks.filter(task => task.completed).length);

    // Save to localStorage
    localStorage.setItem('eduwork_daily_tasks', JSON.stringify(updatedTasks));

    // Recalculate earnings
    calculateEarnings(updatedTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = () => {
    // You can add more specific icons based on categories
    return <Target className="w-4 h-4" />;
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
          <h1 className="text-lg font-semibold text-gray-900">Daily Tasks</h1>
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-green-600">₹{totalEarnings}</span>
            </div>
            <div className="text-xs text-gray-600">
              Month: <span className="font-semibold text-blue-600">₹{monthlyEarnings}</span>
            </div>
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
          /* Loading State */
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Today&apos;s Tasks</h2>
            <p className="text-gray-600">
              Creating personalized teaching tasks for you...
            </p>
          </div>
        ) : error ? (
          /* Error State */
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
          /* No Tasks State */
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Today</h2>
            <p className="text-gray-600 mb-6">
              Your daily tasks haven&apos;t been set up yet. Please check back later or contact your administrator.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          /* Tasks List */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Today&apos;s Teaching Tasks
              </h2>
              {completedCount === tasks.length && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">All Complete!</span>
                </div>
              )}
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
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>

                    {/* Task Content */}
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
                          {getCategoryIcon()}
                          <span>{task.category}</span>
                        </span>

                        {task.completed && (
                          <span className="text-xs font-medium text-green-600">
                            +₹{task.priority === 'hard' ? '50' : task.priority === 'medium' ? '30' : '20'}
                          </span>
                        )}
                      </div>

                      {/* Upload Content Section */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {uploading[task.id] && uploadProgress[task.id] !== undefined && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex items-center space-x-2 text-blue-700 mb-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm font-medium">Uploading file...</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[task.id]}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-600 mt-1 text-center">
                              {Math.round(uploadProgress[task.id])}% complete
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-2">
                          <button
                            onClick={() => simulateFileUpload(task.id, 'text')}
                            disabled={uploading[task.id]}
                            className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Add Text</span>
                          </button>
                          <button
                            onClick={() => simulateFileUpload(task.id, 'image')}
                            disabled={uploading[task.id]}
                            className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Add Image</span>
                          </button>
                          <button
                            onClick={() => simulateFileUpload(task.id, 'video')}
                            disabled={uploading[task.id]}
                            className="flex items-center space-x-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Video className="w-3 h-3" />
                            <span>Add Video</span>
                          </button>
                          <button
                            onClick={() => simulateFileUpload(task.id, 'document')}
                            disabled={uploading[task.id]}
                            className="flex items-center space-x-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Add Document</span>
                          </button>
                        </div>

                        {/* Uploaded Content Display */}
                        {uploadedContent[task.id] && uploadedContent[task.id].length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium">Uploaded Content:</p>
                            {uploadedContent[task.id].map((content, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-xs bg-gray-50 px-2 py-1 rounded">
                                {content.type === 'text' && <FileText className="w-3 h-3 text-blue-500" aria-hidden="true" />}
                                {content.type === 'image' && <ImageIcon className="w-3 h-3 text-green-500" aria-hidden="true" />}
                                {content.type === 'video' && <Video className="w-3 h-3 text-purple-500" aria-hidden="true" />}
                                {content.type === 'document' && <Upload className="w-3 h-3 text-orange-500" aria-hidden="true" />}
                                <span className="truncate flex-1">{content.name}</span>
                                <span className="text-gray-400">{content.size}</span>
                                <button
                                  onClick={() => deleteUploadedFile(task.id, idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Delete file"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion Summary */}
            {completedCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Great Progress!</p>
                      <p className="text-sm text-green-700">
                        You&apos;ve completed {completedCount} of {tasks.length} tasks today
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

            {/* Encouragement Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-900 text-sm">
                💪 <strong>Remember:</strong> Every task you complete brings you closer to becoming the amazing English teacher you want to be.
                Your dedication to creating wonderful learning experiences for children is making a real difference!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
