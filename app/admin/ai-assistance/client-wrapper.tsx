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
        title: "Welcome to HOP",
        content: `Welcome to the HOP Church Management System. This guide will help you navigate the app and manage your church operations efficiently.

HOP helps you manage members, track payments, organize tasks, communicate via SMS, generate reports, and get AI-powered assistance.

This guide covers all the key features in simple, easy-to-understand language.

Let's get started with your journey to efficient church management.`
    },
    {
        pageNumber: 2,
        title: "Dashboard & Navigation",
        content: `The Dashboard is your command center showing welcome message, quick stats, recent activity, and quick action buttons.

Use the left sidebar to navigate: Introduction, All Users, Register Member, Workflows, Branches, Financial Analytics, Task Management, AI Assistant, and Settings.

The search bar at the top helps you quickly find members by name, phone, or membership ID.

Your profile and account settings are accessible from the top-right corner.`
    },
    {
        pageNumber: 3,
        title: "Managing Members",
        content: `The All Users page shows a complete list of registered members with search, sort, and filter capabilities.

Click any member's name to view their full profile including payment history and personal information.

Use the Edit button to update member details, add a photo, or change membership status.

The Register Member form guides you through 6 steps: Basic Info, Address, Roles, Photo, Membership ID, and Certificate.`
    },
    {
        pageNumber: 4,
        title: "Payments & Finances",
        content: `Financial Analytics shows total collections, monthly trends, payment by group, and member payment progress.

Each member's payment page displays a 12-month grid showing paid (green) and unpaid (gray) months.

Track payment streaks, view total contributions, and record member testimonies.

Mark months as paid or unpaid with a single click for quick updates.`
    },
    {
        pageNumber: 5,
        title: "Tasks & Workflows",
        content: `Tasks help organize church activities by assigning members and tracking progress through completion.

Create tasks with a name, purpose, optional duration, and assigned members. Each member gets their own progress tracker.

Workflows are reusable templates for common processes like payment collection, role assignment, record keeping, and member monitoring.

Track completion rates and view overall progress at a glance.`
    },
    {
        pageNumber: 6,
        title: "Branches & Settings",
        content: `Manage multiple church locations by adding branches with name, location, contact details, and leader information.

View branch details including leader and spouse information, and track membership size for each branch.

Customize your experience with theme mode (Light/Dark/Auto), color schemes, font styles, and animation preferences.

Account settings allow profile updates and password changes.`
    },
    {
        pageNumber: 7,
        title: "Quick Reference",
        content: `Add a new member: Dashboard → Register Member
Find a member: Dashboard → All Users → Search
Record a payment: Member Details → Payments Tab
Check payment status: Member Details → Analytics Tab
Create a task: Dashboard → Task Management → New Task
Send an SMS: Dashboard → SMS Messaging
Add a branch: Dashboard → Manage Branches → Add Branch
Get statistics: Dashboard → Financial Analytics

Tips: Start with Dashboard, use Search Bar, try AI Assistant, check Analytics, use Export.`
    },
    {
        pageNumber: 8,
        title: "AI Assistant & Help",
        content: `The AI Assistant answers questions about members, payments, tasks, and analytics. Click the chat icon in the bottom-right corner.

Ask questions like: "How many members do we have?" or "Who hasn't paid this month?"

For help, contact your administrator. Additional documentation is available in the Introduction page.

Welcome to HOP Church Management System. We're here to help you serve your church better.`
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