import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  priority: 'hard' | 'medium' | 'easy';
  completed: boolean;
}

interface RawTaskFromAPI {
  title: string;
  description: string;
  category: string;
  estimated_time_in_minutes?: number;
  estimatedTime?: number;
  priority: 'hard' | 'medium' | 'easy';
}

/**
 * Automatically generates tasks for the current day if they don't exist
 * @returns Promise<Task[]> - Array of generated tasks
 */
export async function generateDailyTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const tasksDate = localStorage.getItem('eduwork_tasks_date');

  // Check if tasks already exist for today
  if (tasksDate === today) {
    const existingTasks = localStorage.getItem('eduwork_daily_tasks');
    if (existingTasks) {
      return JSON.parse(existingTasks);
    }
  }

  // Get API key from localStorage
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set up the API key first.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate exactly 3 daily teaching tasks for an English/General Knowledge/Math teacher who specializes in teaching children. The tasks should be realistic, educational, and help build teaching skills and content creation abilities.

Context about the teacher: They have experience in English/General Knowledge/Math teaching and want to focus on creating engaging content for kids till 2nd standard (6-7 years old in India). They're currently building their teaching portfolio and want to feel productive.

Please generate exactly 3 tasks with these specific requirements:
1. ONE easy task (priority: easy) - Basic English/General Knowledge/Math tasks (15-25 min) till 2nd standard (6-7 years old in India).

Each task should have:
- A clear, actionable title
- Detailed description of what to do
- Category (English/General Knowledge/Math Tasks)
- Estimated time in minutes (with the ranges specified above)
- Priority level (easy)

Format your response as a JSON array of exactly 3 objects with these exact properties:
- title: string
- description: string
- category: string
- estimated_time_in_minutes: number
- priority: string

Make sure you generate exactly three tasks of easy priority.`;

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

    // Validate that we have exactly 3 tasks with the right priorities
    if (!Array.isArray(rawTasks) || rawTasks.length !== 3) {
      throw new Error('Invalid response: Expected exactly 3 tasks');
    }

    const priorities = rawTasks.map((task: RawTaskFromAPI) => task.priority);
    if (!priorities.includes('easy') || !priorities.includes('medium') || !priorities.includes('hard')) {
      throw new Error('Invalid response: Missing required priority levels (easy, medium, hard)');
    }

    // Transform the API response to match our Task interface
    const tasks: Task[] = rawTasks.map((task: RawTaskFromAPI, index: number) => ({
      id: `task-${Date.now()}-${index}`,
      title: task.title,
      description: task.description,
      category: task.category,
      estimatedTime: task.estimated_time_in_minutes || 30,
      priority: task.priority as 'hard' | 'medium' | 'easy',
      completed: false
    }));

    // Save tasks for today
    localStorage.setItem('eduwork_daily_tasks', JSON.stringify(tasks));
    localStorage.setItem('eduwork_tasks_date', today);

    return tasks;

  } catch (error) {
    console.error('Error generating daily tasks:', error);
    throw error;
  }
}

/**
 * Checks if tasks exist for today and returns them, otherwise generates new ones
 * @returns Promise<Task[]> - Array of tasks for today
 */
export async function getOrGenerateDailyTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const tasksDate = localStorage.getItem('eduwork_tasks_date');
  const existingTasks = localStorage.getItem('eduwork_daily_tasks');

  // If tasks exist for today, return them
  if (existingTasks && tasksDate === today) {
    return JSON.parse(existingTasks);
  }

  // Otherwise, generate new tasks
  return await generateDailyTasks();
}

/**
 * Checks if API key is configured
 * @returns boolean - true if API key exists
 */
export function isApiKeyConfigured(): boolean {
  return localStorage.getItem('gemini_api_key') !== null;
}

/**
 * Sets the Gemini API key
 * @param apiKey - The API key to store
 */
export function setApiKey(apiKey: string): void {
  localStorage.setItem('gemini_api_key', apiKey);
}

