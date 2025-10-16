'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface RawTaskFromAPI {
  title: string;
  description: string;
  category: string;
  estimated_time_in_minutes?: number;
  estimatedTime?: number;
  priority: 'high' | 'medium' | 'low';
}

export default function AdminTasksPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Load saved API key and existing tasks
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const existingTasks = localStorage.getItem('eduwork_daily_tasks');

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    if (existingTasks) {
      setSavedTasks(JSON.parse(existingTasks));
    }
  }, []);

  const generateTasksWithAI = async () => {
    if (!apiKey) {
      setError('Please enter your Gemini API key first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Generate exactly 3 daily teaching tasks for an English teacher who specializes in teaching children. The tasks should be realistic, educational, and help build teaching skills and content creation abilities.

Context about the teacher: They have experience in English teaching and want to focus on creating engaging content for kids. They're currently building their teaching portfolio and want to feel productive.

Please generate exactly 3 tasks with these specific requirements:
1. ONE easy task (priority: low) - Basic content creation or simple organization
2. ONE medium task (priority: medium) - Lesson planning or moderate content creation
3. ONE hard task (priority: high) - Complex lesson planning or advanced content creation

Each task should have:
- A clear, actionable title
- Detailed description of what to do
- Category (Lesson Planning, Content Creation, Organization, Student Engagement, Professional Development)
- Estimated time in minutes (easy: 15-25 min, medium: 30-45 min, hard: 50-70 min)
- Priority level (exactly one of each: high, medium, low)

Format your response as a JSON array of exactly 3 objects with these exact properties:
- title: string
- description: string
- category: string
- estimated_time_in_minutes: number
- priority: string

Make sure you generate exactly one task of each priority level: high, medium, and low.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response to extract JSON
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse the JSON response
      const rawTasks = JSON.parse(jsonText);

      // Transform the API response to match our Task interface
      const tasks: Task[] = rawTasks.map((task: RawTaskFromAPI, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        category: task.category,
        estimatedTime: task.estimated_time_in_minutes || 30,
        priority: task.priority as 'high' | 'medium' | 'low',
        completed: false
      }));

      setGeneratedTasks(tasks);
      setSuccess('Tasks generated successfully!');

      // Save API key
      localStorage.setItem('gemini_api_key', apiKey);

    } catch (err) {
      console.error('Error generating tasks:', err);
      setError('Failed to generate tasks. Please check your API key and try again. Make sure your API key has proper permissions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTasksForToday = () => {
    const today = new Date().toISOString().split('T')[0];

    localStorage.setItem('eduwork_daily_tasks', JSON.stringify(generatedTasks));
    localStorage.setItem('eduwork_tasks_date', today);

    setSavedTasks(generatedTasks);
    setSuccess('Tasks saved for today!');

    // Show success popup
    alert('✅ Saved!\n\nTasks have been successfully saved for today.');
  };

  const clearSavedTasks = () => {
    localStorage.removeItem('eduwork_daily_tasks');
    localStorage.removeItem('eduwork_tasks_date');
    setSavedTasks([]);
    setSuccess('Previous tasks cleared.');
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
          <h1 className="text-lg font-semibold text-gray-900">Generate Daily Tasks</h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* API Key Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gemini API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your free API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Generate Tasks Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Generate Today&apos;s Tasks</h2>
            <button
              onClick={generateTasksWithAI}
              disabled={isGenerating || !apiKey}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Tasks'}</span>
            </button>
          </div>

          {/* Generated Tasks */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Generated Tasks ({generatedTasks.length})</h3>
                <button
                  onClick={saveTasksForToday}
                  className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save for Today</span>
                </button>
              </div>

              <div className="space-y-3">
                {generatedTasks.map((task, index) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Task {index + 1}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.estimatedTime} min
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Tasks Status */}
          {savedTasks.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Tasks Saved!</p>
                  <p className="text-sm text-green-700">
                    {savedTasks.length} tasks are ready for today. You can clear them to generate new ones.
                  </p>
                </div>
              </div>
              <button
                onClick={clearSavedTasks}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear saved tasks
              </button>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-900">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-900">{success}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Enter your Gemini API key (free tier available)</li>
            <li>2. Click &quot;Generate Tasks&quot; to create personalized teaching tasks</li>
            <li>3. Review and save the tasks for your people to complete</li>
            <li>4. Tasks will appear in her dashboard with realistic time estimates</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
