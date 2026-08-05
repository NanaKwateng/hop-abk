// app/admin/ai-assistant/page.tsx
// Server Component

import InteractiveBook from "@/components/ui/interactive-book";

export const metadata = {
    title: "User Guide",
    description: "Learn how to use the HOP Church Management System",
};

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

export default function AIAssistantPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">User Guide</h1>
                <p className="text-muted-foreground mt-2">
                    Learn how to use the HOP Church Management System
                </p>
            </div>

            <div className="flex justify-center">
                <InteractiveBook
                    coverImage="/images/logo.png"
                    bookTitle="HOP User Guide"
                    bookAuthor="House of Power Ministry"
                    pages={GUIDE_PAGES}
                    width={400}
                    height={550}
                    className="w-full max-w-5xl"
                />
            </div>
        </div>
    );
}