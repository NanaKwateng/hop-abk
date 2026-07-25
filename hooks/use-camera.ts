"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseCameraOptions {
    facingMode?: "user" | "environment";
    width?: number;
    height?: number;
}

interface UseCameraReturn {
    isReady: boolean;
    isStreaming: boolean;
    error: string | null;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    captureImage: () => string | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    toggleCamera: () => void;
    facingMode: "user" | "environment";
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
    const {
        facingMode: initialFacingMode = "environment",
        width = 640,
        height = 480,
    } = options;

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">(
        initialFacingMode
    );

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
        setIsReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        stopCamera();

        setError(null);
        setIsReady(false);

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: width },
                    height: { ideal: height },
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsStreaming(true);
                    setIsReady(true);
                };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
            setError(errorMessage);
            setIsReady(false);
            setIsStreaming(false);

            // Handle specific errors
            if (err instanceof DOMException) {
                if (err.name === "NotAllowedError") {
                    setError("Camera access denied. Please allow camera permissions.");
                } else if (err.name === "NotFoundError") {
                    setError("No camera found on this device.");
                } else if (err.name === "NotReadableError") {
                    setError("Camera is in use by another application.");
                } else if (err.name === "OverconstrainedError") {
                    setError("Camera does not support the requested settings.");
                }
            }
        }
    }, [facingMode, width, height, stopCamera]);

    const toggleCamera = useCallback(() => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
        // Restart camera with new facing mode
        if (isStreaming) {
            startCamera();
        }
    }, [isStreaming, startCamera]);

    const captureImage = useCallback((): string | null => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || width;
        canvas.height = video.videoHeight || height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL (JPEG for smaller size)
        return canvas.toDataURL("image/jpeg", 0.9);
    }, [width, height]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        isReady,
        isStreaming,
        error,
        startCamera,
        stopCamera,
        captureImage,
        videoRef,
        canvasRef,
        toggleCamera,
        facingMode,
    };
}