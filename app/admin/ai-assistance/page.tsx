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
                coverImage="/images/logo.png" // Add your image path here
                pages={[
                    {
                        pageNumber: 1,
                        title: "Page 1",
                        content: "First page content"
                    },
                    {
                        pageNumber: 2,
                        title: "Page 2",
                        content: "Second page content"
                    },
                ]}
            />

        </div>
    );
}
