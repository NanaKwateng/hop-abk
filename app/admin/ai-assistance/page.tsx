// app/admin/ai-assistant/page.tsx
import InteractiveBook from "./ai-assistant-client";
import { BooksShowcase } from "@/components/ui/books-showcase"


const DEMO_BOOKS = [
    {
        id: "book1",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        year: "2020",
        stars: 5,
        desc: "Timeless lessons on wealth, greed, and happiness.",
        spineBg: "#1e1e1e",
        spineInk: "#ffffff",
        spineFont: "700 42px Georgia",
        backBg: "#1e1e1e",
        backInk: "255,255,255",
        edge: "#e0d6c8"
    }
];

export const metadata = {
    title: "Assistant",
    description: "Get help with your church management tasks",
};




export default function AIAssistantPage() {
    return (
        <div>
            <BooksShowcase
                books={DEMO_BOOKS}
                heroTitle="Books"
                navTitle="Bestsellers"
                showNav={true}
                showDetailPanel={true}
                showCarousel={true}
                themeColors={{
                    navy: "#0f172a",
                    pink: "#f43f5e",
                    cream: "#f5f5f4",
                    lav: "#8b5cf6",
                    peri: "#c084fc",
                    bg: "#0f172a",
                    bgLight: "#1e293b",
                    bgDark: "#020617",
                    foregroundLight: "#f1f5f9",
                    foregroundDark: "#94a3b8"
                }}
                className="w-full h-screen"
                onBookSelect={(book) => {
                    console.log("Selected book:", book);
                }}
            />
            <InteractiveBook
                coverImage="/images/logo.png"
                pages={[
                    {
                        pageNumber: 1,
                        title: "Welcome to HOP, ABUAKWA ASSEMBLY",
                        content: `Welcome to the HOP Church Management System! This guide will help you navigate the app, understand its features, and manage your church operations efficiently. No technical background needed - we'll explain everything in simple terms.

What is HOP?

HOP (House of Power Ministry) is a complete church management system designed to help you:
•  Manage members and their information
•  Track payments and financial contributions
•  Organize tasks and activities
•  Communicate with members via SMS
•  Generate reports and analytics
•  Get answers instantly with AI Assistant

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

 Introduction - Home page with welcome message and quick overview
 All Users - Complete list of all church members
 Register Member - Form to add a new member to the church
 All Workflows - Manage church processes and activities
 Manage Branches - View and manage church branches
 Financial Analytics - View payment reports and financial insights
 Task Management - Create and track tasks for members
 AI Assistant - Ask questions about your church data
 Manage Accounts - Admin account settings
 Manage Settings - System configuration
 Customize Settings - Personalize the app appearance`
                    },
                    {
                        pageNumber: 3,
                        title: "👥 Managing Members",
                        content: `All Users Page

This page shows a complete list of all registered members.

What You Can Do:

 Search Members
• Type a name, phone number, or membership ID in the search bar
• Results appear instantly as you type

 Sort and Filter
• Click column headers to sort (e.g., click "Name" to sort alphabetically)
• Use the "Filters" button to narrow down results by Gender, Position, or Group

 View Member Details
• Click any member's name to see their full profile
• View payment history, analytics, and personal information

 Edit Member
• Click the "Edit" button on any member
• Update their information, add a photo, or change their membership status

Export Members
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
                        title: " Payments & Finances",
                        content: `Financial Analytics

This page shows you the financial health of your church.

What You'll See:

 Total Payments
• How much has been collected this year
• How many members have paid

 Monthly Trends
• Chart showing payments month by month
• See which months have the most payments

👥 Payment by Group
• See which fellowship groups are most active
• Compare Men's, Women's, and Youth Fellowship

 Member Payment Progress
• View each member's payment status
• See who is fully paid and who is behind

Member Payment Page

When viewing a specific member, you can:

 Monthly Payment Grid
• See all 12 months at a glance
• Green = Paid, Gray = Unpaid
• Mark months as paid or unpaid with one click

 Payment Analytics
• See their payment history over the years
• Track their payment streak
• View total contributions

 Add Testimonials
• Record member testimonies
• Add notes about duties and roles
• Keep track of member contributions`
                    },
                    {
                        pageNumber: 5,
                        title: " Tasks & Workflows",
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
                        pageNumber: 7,
                        title: "Branches & Settings",
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
                        title: "Quick Reference & Tips",
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

Tips for New Users

1. Start with the Dashboard - It gives you a quick overview of everything
2. Use the Search Bar - It's the fastest way to find members
3. Try the AI Assistant - Ask questions instead of clicking through menus
4. Check the Analytics - Stay informed about church health
5. Use Export - Download reports for sharing with church leadership
 Need Help?

•Support: Contact your administrator
•Documentation: Check the "Introduction" page for more details

Welcome to HOP Church Management System!`
                    }
                ]}
            />

        </div>
    );
}
