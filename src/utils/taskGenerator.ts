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

  // Get API key and model from localStorage
  const apiKey = localStorage.getItem('openrouter_api_key');
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Please set up the API key first.');
  }

  const model = localStorage.getItem('openrouter_model') || 'minimax/minimax-m2.5:free';

  try {
    const prompt = `STRICT TASK GENERATION SPECIFICATION (FOLLOW EXACTLY)

Absolute Rules (must obey all):
1) Quantity: Exactly 3 tasks.
2) Difficulty: All 3 must have priority "easy" only. Do NOT use medium or hard.
3) Domains allowed: ONLY these categories — "Writing Skills" or "Math Skills". No other categories.
4) Age/Grades: KG (LKG/UKG), Grade 1, Grade 2 in India.
5) Duration: Each task must take 15–25 minutes (estimated_time_in_minutes within this range).
6) Content specificity: Align to foundational Indian syllabus skills. Examples allowed:
   - Writing Skills: letter/word tracing, CVC words writing, picture–sentence writing (1–3 short sentences), capital/small letter practice, dictation of common sight words, punctuation basics (full stop), ordering words to form a simple sentence.
   - Math Skills: counting (1–20 / 1–50 as age-appropriate), number comparison (<, >, =), number bonds within 10, shapes recognition, simple addition/subtraction within 10 or 20, skip counting by 2s/5s/10s (Grade 1/2), place value (tens/ones) for Grade 1/2.
7) Tone: Simple, kid-friendly classroom tasks that a teacher would assign. No advanced concepts. No extra subjects.
8) Language Simplicity: Use the easiest, plain language possible. Very short sentences. Avoid jargon. Make it effortless for the teacher to understand at a glance.
 8) Output format: JSON array ONLY (no prose, no markdown fences), with exactly 3 objects.

For EACH task include these exact fields:
- title: string (concise and clear, e.g., "Write 5 CVC Words from Pictures" or "Add Within 10 Using Counters")
- description: string (step-by-step, 3–6 short bullet-like steps separated by " • ", and mention the grade e.g., "(Grade 1)" or "(KG)". At the end, append one simple "Example:" with 1–3 sample items to show how to do it.)
- category: string (MUST be either "Writing Skills" or "Math Skills")
- estimated_time_in_minutes: number (integer between 15 and 25)
- priority: string (MUST be "easy")

Additional constraints:
- Balance across KG/Grade 1/Grade 2 when possible (at least two different grade levels across the 3 tasks).
- Use Indian English where appropriate (e.g., "maths" is acceptable but stick to simple wording).
 - No external materials or printing required; use notebook/pencil/manipulatives available in class (counters, beans, sticks).
 - DO NOT use or refer to pictures/photos/images, websites, videos, or printable worksheets. Avoid phrases like "look at the picture" or "use the image".

Return ONLY the JSON array as the response, nothing else.`;

    // Helper validation
    const allowedCategories = ['Writing Skills', 'Math Skills'];
    const bannedTokens = ['picture', 'photo', 'image', 'images', 'look at the picture', 'printable', 'worksheet', 'internet', 'website', 'video'];
    const hasBanned = (text: string): boolean => {
      const lower = text.toLowerCase();
      return bannedTokens.some(t => lower.includes(t));
    };

    const isValid = (rawTasks: RawTaskFromAPI[]): boolean => {
      if (!Array.isArray(rawTasks) || rawTasks.length !== 3) return false;
      if (!rawTasks.every(t => t && typeof t.title === 'string' && typeof t.description === 'string')) return false;
      const prioritiesOk = rawTasks.every(t => t.priority === 'easy');
      const categoriesOk = rawTasks.every(t => allowedCategories.includes(t.category));
      const timeOk = rawTasks.every(t => {
        const m: number | undefined = t.estimated_time_in_minutes ?? t.estimatedTime;
        return typeof m === 'number' && m >= 15 && m <= 25;
      });
      const exampleOk = rawTasks.every(t => t.description.includes('Example:'));
      const gradeOk = rawTasks.every(t => /(\(KG\)|\(Grade 1\)|\(Grade 2\))/.test(t.description));
      const bulletsOk = rawTasks.every(t => t.description.includes(' • '));
      const bannedOk = rawTasks.every(t => !hasBanned(t.description) && !hasBanned(t.title));
      return prioritiesOk && categoriesOk && timeOk && exampleOk && gradeOk && bulletsOk && bannedOk;
    };

    // Try multiple attempts to get a compliant response
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'EduWork Teaching Platform'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          reasoning: {
            enabled: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content ?? '';

      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      let rawTasks: RawTaskFromAPI[];
      try {
        rawTasks = JSON.parse(jsonText);
      } catch {
        if (attempt === 2) throw new Error('Invalid response: not JSON');
        continue;
      }

      if (!isValid(rawTasks)) {
        if (attempt === 2) throw new Error('Invalid response: does not meet constraints');
        continue;
      }

      const tasks: Task[] = rawTasks.map((task: RawTaskFromAPI, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        category: task.category,
        estimatedTime: task.estimated_time_in_minutes || 30,
        priority: task.priority as 'hard' | 'medium' | 'easy',
        completed: false
      }));

      localStorage.setItem('eduwork_daily_tasks', JSON.stringify(tasks));
      localStorage.setItem('eduwork_tasks_date', today);
      return tasks;
    }

    // Fallback (should not reach due to throws above)
    throw new Error('Failed to generate valid tasks after retries');

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
  return localStorage.getItem('openrouter_api_key') !== null;
}

/**
 * Sets the OpenRouter API key
 * @param apiKey - The API key to store
 */
export function setApiKey(apiKey: string): void {
  localStorage.setItem('openrouter_api_key', apiKey);
}

/**
 * Sets the OpenRouter model
 * @param model - The model to store
 */
export function setModel(model: string): void {
  localStorage.setItem('openrouter_model', model);
}

/**
 * Checks if model is configured
 * @returns boolean - true if model exists
 */
export function isModelConfigured(): boolean {
  return localStorage.getItem('openrouter_model') !== null;
}
