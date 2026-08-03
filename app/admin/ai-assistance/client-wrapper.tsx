// app/admin/ai-assistant/client-wrapper.tsx
// Client Component - Handles all interactive logic

"use client";

import { useState } from "react";
import { CgLaptop } from "react-icons/cg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bot, Sparkles } from "lucide-react";
import InteractiveBook from "./ai-assistant-client";

// User Guide Pages Data
const GUIDE_PAGES = [
    {
        pageNumber: 1,
        title: "🏠 Welcome to HOP",
        content: `Welcome to the HOP Church Management System! This guide will help you navigate the app, understand its features, and manage your church operations efficiently. No technical background needed - we'll explain everything in simple terms.

What is HOP?

HOP (House of Power Ministry) is a complete church management system designed to help you:
• 👥 Manage members and their information
• 💰 Track payments and financial contributions
• ✅ Organize tasks and activities
• 📱 Communicate with members via SMS
• 📊 Generate reports and analytics
• 🤖 Get answers instantly with AI Assistant

Let's get started!`
    },
    {
        pageNumber: 2,
        title: "🏠 Dashboard Overview",
        content: `When you log in, you'll land on the Dashboard - your command center for all church activities.

Key Sections:

• Welcome Message: Greets you by name and shows today's date
• Quick Stats: Shows total members, payments, tasks, and branches at a glance
• Recent Activity: Lists the latest actions taken in the system
• Quick Actions: Buttons to quickly add members, record payments, or create tasks

Navigation Menu (Left Sidebar):

🏠 Introduction - Home page with welcome message and quick overview
👥 All Users - Complete list of all church members
➕ Register Member - Form to add a new member to the church
📋 All Workflows - Manage church processes and activities
🏛️ Manage Branches - View and manage church branches
💰 Financial Analytics - View payment reports and financial insights
📋 Task Management - Create and track tasks for members
🎤 AI Assistant - Ask questions about your church data
🔐 Manage Accounts - Admin account settings
⚙️ Manage Settings - System configuration
🎨 Customize Settings - Personalize the app appearance`
    },
    {
        pageNumber: 3,
        title: "👥 Managing Members",
        content: `All Users Page

This page shows a complete list of all registered members.

What You Can Do:

🔍 Search Members
• Type a name, phone number, or membership ID in the search bar
• Results appear instantly as you type

📊 Sort and Filter
• Click column headers to sort (e.g., click "Name" to sort alphabetically)
• Use the "Filters" button to narrow down results by Gender, Position, or Group

👤 View Member Details
• Click any member's name to see their full profile
• View payment history, analytics, and personal information

✏️ Edit Member
• Click the "Edit" button on any member
• Update their information, add a photo, or change their membership status

📤 Export Members
• Use the "Export" button to download member lists as CSV or Excel
• Choose which columns to include (e.g., Name, Phone, Location)

Register Member Page

This is a step-by-step form to add new members with 6 steps:

Step 1: Basic Info - First name, last name, phone, gender
Step 2: Address - Place of stay, house number, member position
Step 3: Roles & Duties - Fellowship group, occupation, email
Step 4: Profile Photo - Upload a photo or take one with your camera
Step 5: Membership ID - Generate or enter a unique ID
Step 6: Certificate - Preview and download the membership certificate`
    },
    {
        pageNumber: 4,
        title: "💳 Payments & Finances",
        content: `Financial Analytics

This page shows you the financial health of your church.

What You'll See:

📊 Total Payments
• How much has been collected this year
• How many members have paid

📈 Monthly Trends
• Chart showing payments month by month
• See which months have the most payments

👥 Payment by Group
• See which fellowship groups are most active
• Compare Men's, Women's, and Youth Fellowship

📋 Member Payment Progress
• View each member's payment status
• See who is fully paid and who is behind

Member Payment Page

When viewing a specific member, you can:

📅 Monthly Payment Grid
• See all 12 months at a glance
• Green = Paid, Gray = Unpaid
• Mark months as paid or unpaid with one click

📊 Payment Analytics
• See their payment history over the years
• Track their payment streak
• View total contributions

📝 Add Testimonials
• Record member testimonies
• Add notes about duties and roles
• Keep track of member contributions`
    },
    {
        pageNumber: 5,
        title: "✅ Tasks & Workflows",
        content: `Task Management

Tasks help you organize church activities and assign them to members.

Creating a Task:

1. Name & Purpose
• Give your task a clear name
• Choose the purpose (Payments, Monitoring, Roles, etc.)

2. Duration (Optional)
• Set start and end dates
• Track progress over time

3. Assign Members
• Select which members should participate
• Each member gets their own progress tracker

4. Track Progress
• Members can mark tasks as complete
• View completion rates per member
• See overall task progress

Workflows

Workflows are like task templates for common church processes.

Examples:
• Payment Collection: Track monthly payments
• Role Assignment: Assign church roles to members
• Record Keeping: Document church activities
• Monitoring: Track member engagement`
    },
    {
        pageNumber: 6,
        title: "🤖 AI Assistant",
        content: `How to Use the AI Assistant

The AI Assistant is like having a knowledgeable helper who can answer questions about your church data instantly.

What You Can Ask:

Members
• "How many members do we have?"
• "Show me all members from Santasi"
• "Find John's membership ID"

Payments
• "Who hasn't paid this month?"
• "Show me payment trends for this year"
• "What's the total payment collected?"

Tasks
• "What tasks are overdue?"
• "How many tasks are completed?"
• "Show me all active tasks"

Analytics
• "Give me a summary of this month's activities"
• "Show me member growth trends"
• "What's the payment compliance rate?"

How to Use:

💬 Type Your Question
• Click the chat icon in the bottom-right corner
• Type your question in plain English
• Press Enter or click Send

🎤 Voice Search
• Click the microphone button
• Speak your question clearly
• The assistant will transcribe and answer

📊 View Results
• Answers come with charts and tables when relevant
• Click suggestions for follow-up questions`
    },
    {
        pageNumber: 7,
        title: "🏛️ Branches & Settings",
        content: `Branch Management

If your church has multiple locations, you can manage them here.

What You Can Do:

➕ Add Branch
• Enter branch name, location, and contact details
• Add leader information
• Set membership size

👁️ View Branch Details
• See all branch information
• View leader and spouse details
• Track branch membership

✏️ Edit Branch
• Update branch information
• Change leader details
• Update membership size

Settings & Customization

Account Settings
• Update your profile information
• Change your password
• Manage your preferences

Admin Settings
• Manage admin users
• View audit logs
• Track admin activity

Customize Settings
• Theme Mode: Choose Light, Dark, or Auto
• Colors: Pick your preferred color scheme
• Font: Choose font style
• Animations: Turn animations on/off`
    },
    {
        pageNumber: 8,
        title: "🔍 Quick Reference & Tips",
        content: `Quick Reference

What You Want To Do           | Where To Go
--------------------------------|--------------------------------
Add a new member               | Dashboard → Register Member
Find a member                  | Dashboard → All Users → Search
Record a payment               | Member Details → Payments Tab
Check payment status           | Member Details → Analytics Tab
Create a task                  | Dashboard → Task Management → New Task
Send an SMS                    | Dashboard → SMS Messaging
Add a branch                   | Dashboard → Manage Branches → Add Branch
Get church statistics          | Dashboard → Financial Analytics
Ask a question                 | Click AI Assistant icon (bottom-right)

💡 Tips for New Users

1. Start with the Dashboard - It gives you a quick overview of everything
2. Use the Search Bar - It's the fastest way to find members
3. Try the AI Assistant - Ask questions instead of clicking through menus
4. Check the Analytics - Stay informed about church health
5. Use Export - Download reports for sharing with church leadership

🆘 Need Help?

• 🤖 AI Assistant: Ask any question about the app
• 📧 Support: Contact your administrator
• 📚 Documentation: Check the "Introduction" page for more details

Welcome to HOP Church Management System! 🙏`
    }
];

export default function ClientWrapper() {
    const [activeTab, setActiveTab] = useState("guide");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="guide" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    User Guide
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                    <CgLaptop className="h-4 w-4" />
                    Assistant
                </TabsTrigger>
            </TabsList>

            {/* User Guide Tab */}
            <TabsContent value="guide" className="mt-0">
                <InteractiveBook
                    coverImage="/images/hero.png"
                    pages={GUIDE_PAGES}
                    className="w-full"
                />
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="ai" className="mt-0">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Quick Stats */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Try these sample questions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('ai-query', {
                                        detail: { query: "How many members do we have?" }
                                    });
                                    document.dispatchEvent(event);
                                }}
                                className="w-full text-left text-sm p-3 rounded-md hover:bg-muted transition-colors border"
                            >
                                How many members do we have?
                            </button>
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('ai-query', {
                                        detail: { query: "Show me payment trends for this month" }
                                    });
                                    document.dispatchEvent(event);
                                }}
                                className="w-full text-left text-sm p-3 rounded-md hover:bg-muted transition-colors border"
                            >
                                Show me payment trends for this month
                            </button>
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('ai-query', {
                                        detail: { query: "Who hasn't paid this month?" }
                                    });
                                    document.dispatchEvent(event);
                                }}
                                className="w-full text-left text-sm p-3 rounded-md hover:bg-muted transition-colors border"
                            >
                                Who hasn't paid this month?
                            </button>
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('ai-query', {
                                        detail: { query: "What tasks are overdue?" }
                                    });
                                    document.dispatchEvent(event);
                                }}
                                className="w-full text-left text-sm p-3 rounded-md hover:bg-muted transition-colors border"
                            >
                                What tasks are overdue?
                            </button>
                        </CardContent>
                    </Card>

                    {/* AI Chat Area */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" />
                                Chat with AI Assistant
                            </CardTitle>
                            <CardDescription>
                                Ask anything about your church data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-primary/10 p-6 mb-4">
                                <Bot className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">AI Assistant Ready</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Click the chat icon in the bottom-right corner of your screen to start a conversation with the AI Assistant.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                <span>Try asking: "How many members do we have?"</span>
                            </div>
                            <div className="mt-4 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                                <p>The AI Assistant can answer questions about members, payments, tasks, and more.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
}