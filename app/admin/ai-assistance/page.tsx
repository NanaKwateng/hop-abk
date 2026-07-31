// app/admin/ai-assistant/page.tsx
import AIAssistantClient from "./ai-assistant-client";

export const metadata = {
    title: "AI Assistant",
    description: "Get help with your church management tasks using AI",
};

export default function AIAssistantPage() {
    return <AIAssistantClient />;
}
