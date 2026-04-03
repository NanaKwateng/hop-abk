// components/error-boundary.tsx
"use client";

import { Component, type ReactNode } from "react";
import { IoRefreshOutline, IoWarningOutline } from "react-icons/io5";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex items-center justify-center px-6">
                    <div className="text-center max-w-sm space-y-4">
                        <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <IoWarningOutline className="h-7 w-7 text-amber-600" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground">
                            An unexpected error occurred. Try refreshing the page.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold"
                        >
                            <IoRefreshOutline className="h-4 w-4" />
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}