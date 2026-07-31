// components/ai-assistant/ai-voice-input.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// SAFE FIX: Extend the global Window interface for TypeScript compilation
interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
}

interface AIVoiceInputProps {
    onResult: (transcript: string) => void;
    isProcessing?: boolean;
}

export function AIVoiceInput({ onResult, isProcessing = false }: AIVoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [recognition, setRecognition] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            // TypeScript now recognizes these properties safely on the window instance
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();

                recognitionInstance.continuous = false;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = "en-US";
                recognitionInstance.maxAlternatives = 3;

                recognitionInstance.onresult = (event: any) => {
                    let finalTranscript = "";
                    let interimTranscript = "";

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    const fullTranscript = finalTranscript || interimTranscript;
                    setTranscript(fullTranscript);

                    if (finalTranscript) {
                        onResult(finalTranscript);
                        stopListening();
                    }
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error("[Voice] Error:", event.error);
                    setError(event.error);
                    stopListening();

                    // Handle specific errors
                    if (event.error === "not-allowed") {
                        setError("Microphone access denied. Please allow microphone access.");
                    } else if (event.error === "no-speech") {
                        setError("No speech detected. Please try again.");
                    }
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                setRecognition(recognitionInstance);
            } else {
                setIsSupported(false);
                setError("Voice input is not supported in this browser.");
            }
        }
    }, [onResult]);

    const startListening = useCallback(() => {
        if (!recognition) return;

        try {
            recognition.start();
            setIsListening(true);
            setError(null);
            setTranscript("");
        } catch (error) {
            console.error("[Voice] Failed to start:", error);
            setError("Failed to start voice recognition.");
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                // Ignore errors on stop
            }
        }
        setIsListening(false);
    }, [recognition]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognition) {
                try {
                    recognition.stop();
                } catch (error) {
                    // Ignore
                }
            }
        };
    }, [recognition]);

    if (!isSupported) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={cn(
                "relative transition-all",
                isListening && "border-primary bg-primary/10 text-primary",
                error && "border-destructive text-destructive"
            )}
            title={isListening ? "Stop recording" : "Start voice input"}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isListening ? (
                <Mic className="h-4 w-4 animate-pulse" />
            ) : (
                <Mic className="h-4 w-4" />
            )}
            {isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
            )}
        </Button>
    );
}
