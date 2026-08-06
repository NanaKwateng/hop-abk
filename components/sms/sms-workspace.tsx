"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SMSChatList } from "./sms-chat-list";
import { SMSChatThread } from "./sms-chat-thread";
import { SMSComposerBar } from "./sms-composer-bar";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "list" | "thread" | "compose";

export function SMSWorkspace() {
    const [view, setView] = useState<View>("list");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const handleSelect = (id: string) => {
        setSelectedId(id);
        setView("thread");
    };

    const handleCompose = () => {
        setSelectedId(null);
        setView("compose");
    };

    const handleSent = () => {
        queryClient.invalidateQueries({ queryKey: ["sms-history"] });
        setView("list");
    };

    return (
        <div className="grid h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border md:grid-cols-[360px_1fr]">
            {/* List pane — always visible on desktop, only when view==="list" on mobile */}
            <div className={cn("h-full border-r", view !== "list" && "hidden md:block")}>
                <SMSChatList selectedId={selectedId} onSelect={handleSelect} onCompose={handleCompose} />
            </div>

            {/* Detail pane */}
            <div className={cn("h-full", view === "list" && "hidden md:block")}>
                {view === "thread" && selectedId ? (
                    <SMSChatThread messageId={selectedId} onBack={() => setView("list")} />
                ) : view === "compose" ? (
                    <SMSComposerBar onBack={() => setView("list")} onSent={handleSent} />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground bg-[#ECE5DD] dark:bg-[#0b141a]">
                        <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                        <p className="text-sm">Select a message to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}