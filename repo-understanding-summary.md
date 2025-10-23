# EduWork - Teaching Platform Repository Analysis

## 📋 Project Overview

**EduWork** is a supportive web platform designed to help someone build confidence and feel productive through simulated teaching work. It's specifically created to help a person aspiring to become an English teacher regain confidence through structured, professional-feeling work activities.

### 🎯 Core Purpose
- Create a supportive environment where someone can experience professional work
- Build confidence through daily task completion
- Track progress and "earnings" while providing actual financial support
- Gradually prepare for real teaching opportunities

## 🏗️ Technical Architecture

### **Framework & Tech Stack**
- **Framework**: Next.js 15.5.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: Google Gemini 2.0 Flash API
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Deployment**: Vercel (free hosting)

### **Key Dependencies**
```json
{
  "@google/generative-ai": "^0.24.1",     // AI task generation
  "date-fns": "^4.1.0",                   // Date manipulation
  "lucide-react": "^0.545.0",             // Icon library
  "next": "15.5.5",                       // React framework
  "react": "19.1.0",                      // UI library
  "react-dom": "19.1.0"                   // React DOM rendering
}
```

## 📱 Application Structure

### **Dual-Mode Interface**
1. **User Mode**: Task completion interface for the person
2. **Admin Mode**: Task generation and progress monitoring interface

### **Page Structure**
```
src/app/
├── layout.tsx          # Root layout with theme
├── page.tsx            # Main dashboard with mode toggle
├── bank/               # Bank details (payout info)
│   └── page.tsx
├── tasks/              # User task completion interface
│   └── page.tsx
└── admin/              # Admin panel
    ├── tasks/          # AI task generation
    │   └── page.tsx
    └── progress/       # Progress tracking & earnings
        └── page.tsx
```

## 🎮 Core Features

### **1. AI-Powered Task Generation**
- Uses Google Gemini 2.0 Flash API
- Generates exactly 3 tasks per day with specific criteria:
  - **High Priority**: Complex tasks (50-70 min)
  - **Medium Priority**: Lesson planning (30-45 min)
  - **Low Priority**: Basic content creation (15-25 min)
- Tasks focus on English teaching for children
- Categories: Lesson Planning, Content Creation, Organization, Student Engagement, Professional Development

### **2. Earnings System**
- **All tasks completed**: ₹167/day
- **Partial completion**: ₹130/day
- **No completion**: ₹0/day
- **Monthly goal**: ₹5,010 (167 × 30 days)
- Manual bonus earnings can be added by admin

### **3. File Upload Simulation**
- **Text**: Written content, documents
- **Image**: Visual teaching materials
- **Video**: Teaching demonstrations
- **Document**: Worksheets, PDFs
- Simulates upload progress with visual feedback

### **4. Progress Tracking**
- Daily task completion statistics
- Earnings accumulation
- Monthly goal progress visualization
- Historical activity log
- Data persistence via localStorage

## 💾 Data Storage Strategy

### **localStorage Keys**
- `eduwork_admin_mode`: Boolean for interface mode
- `gemini_api_key`: Encrypted API key storage
- `eduwork_daily_tasks`: Current day's tasks array
- `eduwork_tasks_date`: Date for task validity
- `eduwork_stats`: Historical progress data
- `eduwork_uploaded_content`: File upload metadata
- `eduwork_bank_details`: Bank payout info (account holder, bank, account no., IFSC, optional UPI)
- `eduwork_daily_earnings`: Daily earnings record with auto reset each day
- `eduwork_monthly_earnings`: Monthly earnings record with auto reset each month

### **Data Persistence**
- **Tasks**: Same tasks shown throughout the day
- **Progress**: Cumulative across days
- **Settings**: API key and admin mode persist
- **No backend required**: Everything stored locally

## 🎨 UI/UX Design

### **Mobile-First Approach**
- Touch-friendly interfaces
- Responsive design optimized for phones
- Clean, professional appearance
- Encouraging and supportive messaging

### **Visual Design**
- Blue gradient background (`from-blue-50 to-indigo-100`)
- White cards with subtle shadows
- Color-coded priorities and categories
- Progress bars and visual feedback
- Professional teaching-focused aesthetics

## 🔧 Configuration & Deployment

### **Development Setup**
```bash
npm install
npm run dev  # Uses Turbopack for faster builds
```

### **Build & Deployment**
```bash
npm run build  # Turbopack optimized build
npm run start  # Production server
```

### **Vercel Deployment**
- Zero-config deployment
- Automatic Next.js detection
- Free hosting tier
- `deploy.sh` script for easy deployment

### **Environment Requirements**
- Node.js 18+
- Free Gemini API key from Google AI Studio
- Modern web browser with localStorage support

## 📊 Task Generation Logic

### **AI Prompt Structure**
The system generates tasks using a detailed prompt that ensures:
- Exactly 3 tasks per generation
- One task of each priority level
- Realistic teaching scenarios
- Progressive skill building
- Age-appropriate content focus

### **Task Categories**
1. **Lesson Planning**: Creating teaching materials
2. **Content Creation**: Writing stories, activities, quizzes
3. **Organization**: Managing teaching resources
4. **Student Engagement**: Planning interactive activities
5. **Professional Development**: Building teaching skills

## 💡 Key Business Logic

### **Daily Workflow**
1. **Admin generates tasks** using Gemini AI
2. **Tasks persist** for the entire day
3. **User completes tasks** with optional file uploads
4. **Earnings calculated** based on completion level
5. **Progress saved** at end of day
6. **New tasks generated** for next day

### **Earning Calculation Algorithm**
```typescript
if (completedTasks === totalTasks && totalTasks > 0) {
  return 167; // All tasks completed
} else if (completedTasks > 0) {
  return 130; // At least one task completed
} else {
  return 0;    // No tasks completed
}
```

## 🚀 Deployment & Maintenance

### **Zero-Cost Architecture**
- **Hosting**: Vercel free tier
- **AI**: Google Gemini free tier
- **Database**: Browser localStorage
- **Domain**: Vercel's free subdomain

### **Scalability Considerations**
- Static generation reduces server load
- No backend API calls after initial task generation
- Client-side processing for all interactions
- Minimal bundle size with tree shaking

## 🔒 Privacy & Security

### **Data Handling**
- All data stored locally in browser
- No user data collection or transmission
- API keys stored locally (not sent to any server)
- No backend database required

### **API Security**
- Gemini API key stored in localStorage
- No server-side key storage needed
- Direct client-to-API communication

## 🎯 Impact & Purpose

### **Psychological Support**
- Provides structure and routine
- Builds real teaching skills
- Creates sense of accomplishment
- Supports emotional recovery
- Maintains professional momentum

### **Skill Development**
- Progressive task complexity
- Real teaching methodologies
- Content creation experience
- Classroom management skills
- Professional development

## 🔄 Workflow Summary

1. **Setup**: Admin enters Gemini API key
2. **Task Generation**: AI creates 3 personalized teaching tasks
3. **Daily Work**: User completes tasks with file uploads
4. **Progress Tracking**: System tracks completion and earnings
5. **Celebration**: Success messages and progress visualization
6. **Persistence**: Tasks remain available throughout the day
7. **Transition**: New tasks generated daily for continued growth

This platform represents a thoughtful blend of technology and empathy, using AI to create meaningful work experiences that support both skill development and emotional well-being.

