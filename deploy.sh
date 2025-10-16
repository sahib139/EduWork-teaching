#!/bin/bash

# EduWork Platform Deployment Script
# This script helps deploy the platform to Vercel

echo "🚀 EduWork Platform Deployment Script"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - EduWork Teaching Platform"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🌐 Deploying to Vercel..."
echo "Follow the prompts to create your Vercel account and project."
echo ""

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the deployment URL"
echo "2. Get your Gemini API key from: https://aistudio.google.com/app/apikey"
echo "3. Share the URL with your people"
echo "4. Use the admin mode to generate daily tasks"
echo ""
echo "📖 Full documentation available in README.md"

