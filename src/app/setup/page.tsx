'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Key, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { setApiKey, isApiKeyConfigured, getOrGenerateDailyTasks } from '../../utils/taskGenerator';

export default function SetupPage() {
  const [apiKey, setApiKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if already configured
    if (isApiKeyConfigured()) {
      setIsConfigured(true);
    }
  }, []);

  const testAndSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      // Save the API key
      setApiKey(apiKey.trim());

      // Test it by trying to generate tasks
      await getOrGenerateDailyTasks();

      setSuccess('✅ API key configured successfully! Tasks will be automatically generated.');
      setIsConfigured(true);

      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err) {
      console.error('API key test failed:', err);
      setError(err instanceof Error ? err.message : 'Invalid API key or network error. Please check your key and try again.');
      // Remove the invalid key
      localStorage.removeItem('gemini_api_key');
    } finally {
      setIsTesting(false);
    }
  };

  if (isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
          <p className="text-gray-600 mb-6">
            Your EduWork platform is ready to use. Tasks will be automatically generated when someone visits the site.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-gray-900">Setup EduWork</h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Configure AI Tasks</h2>
              <p className="text-gray-600 text-sm">
                Set up your Gemini API key to enable automatic task generation
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyInput(e.target.value)}
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

              <button
                onClick={testAndSaveApiKey}
                disabled={isTesting || !apiKey.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing API Key...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Configure & Test</span>
                  </>
                )}
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-900 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-900 text-sm">{success}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Get a free Gemini API key from Google AI Studio</li>
              <li>2. Enter your API key above and click &quot;Configure & Test&quot;</li>
              <li>3. The system will test the key and generate sample tasks</li>
              <li>4. Tasks will be automatically created each day when someone visits</li>
            </ol>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Your API key is stored locally and never sent to any external servers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

