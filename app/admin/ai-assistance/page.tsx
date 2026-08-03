// app/admin/ai-assistant/page.tsx
import InteractiveBook from "./ai-assistant-client";

export const metadata = {
    title: "AI Assistant",
    description: "Get help with your church management tasks using AI",
};

export default function AIAssistantPage() {
    return (
        <div>
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
