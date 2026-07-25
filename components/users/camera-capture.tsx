// components/users/camera-capture.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Camera,
    RotateCw,
    Check,
    X,
    Loader2,
    AlertCircle,
    Smartphone,
    Laptop,
} from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { isMobileDevice } from "@/lib/utils/camera-utils";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCapture: (imageDataUrl: string) => void;
    onCancel: () => void;
}

export function CameraCapture({
    open,
    onOpenChange,
    onCapture,
    onCancel,
}: CameraCaptureProps) {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const isMobile = isMobileDevice();

    const {
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
    } = useCamera({
        facingMode: isMobile ? "environment" : "user",
        width: 640,
        height: 480,
    });

    // Start camera when dialog opens
    useEffect(() => {
        if (open) {
            setIsInitializing(true);
            // Small delay to allow dialog to render
            const timer = setTimeout(() => {
                startCamera();
                setIsInitializing(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            stopCamera();
            setCapturedImage(null);
        }
    }, [open, startCamera, stopCamera]);

    const handleCapture = () => {
        const image = captureImage();
        if (image) {
            setCapturedImage(image);
            // Stop camera to save battery
            stopCamera();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        // Restart camera
        startCamera();
    };

    const handleConfirm = () => {
        if (capturedImage) {
            setIsProcessing(true);
            // Small delay to show processing state
            setTimeout(() => {
                onCapture(capturedImage);
                setIsProcessing(false);
                onOpenChange(false);
            }, 300);
        }
    };

    const handleCancel = () => {
        setCapturedImage(null);
        stopCamera();
        onCancel();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Take Photo
                    </DialogTitle>
                    <DialogDescription>
                        {capturedImage
                            ? "Review your photo. Click confirm to use it."
                            : isMobile
                                ? "Position the camera and tap the capture button."
                                : "Position the camera and click the capture button."}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative bg-black/5 dark:bg-black/20">
                    {/* Camera Preview */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                        {!capturedImage ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={cn(
                                        "h-full w-full object-cover",
                                        !isStreaming && "hidden"
                                    )}
                                />
                                {isInitializing && !isReady && !error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Initializing camera...</p>
                                    </div>
                                )}
                                {!isStreaming && !isInitializing && !error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        <Camera className="h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">Camera not ready</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={startCamera}
                                        >
                                            Start Camera
                                        </Button>
                                    </div>
                                )}
                                {error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
                                        <div className="rounded-full bg-destructive/10 p-3">
                                            <AlertCircle className="h-8 w-8 text-destructive" />
                                        </div>
                                        <p className="text-sm text-center text-destructive max-w-xs">
                                            {error}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={startCamera}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                )}
                                {/* Hidden canvas for capture */}
                                <canvas ref={canvasRef} className="hidden" />
                            </>
                        ) : (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>

                    {/* Device Info Badge */}
                    <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 text-xs text-muted-foreground">
                            {isMobile ? (
                                <>
                                    <Smartphone className="h-3 w-3" />
                                    Mobile
                                </>
                            ) : (
                                <>
                                    <Laptop className="h-3 w-3" />
                                    Desktop
                                </>
                            )}
                        </div>
                    </div>

                    {/* Camera Controls Overlay */}
                    {!capturedImage && isReady && !error && (
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                            {/* Switch Camera (only on mobile) */}
                            {isMobile && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 h-12 w-12"
                                    onClick={toggleCamera}
                                    title="Switch camera"
                                >
                                    <RotateCw className="h-5 w-5" />
                                </Button>
                            )}

                            {/* Capture Button */}
                            <Button
                                size="lg"
                                className="rounded-full h-16 w-16 bg-white hover:bg-white/90 shadow-lg border-2 border-primary/20"
                                onClick={handleCapture}
                                disabled={!isStreaming}
                            >
                                <div className="h-12 w-12 rounded-full border-4 border-primary" />
                            </Button>

                            {/* Cancel */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 h-12 w-12"
                                onClick={handleCancel}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* Review Controls */}
                    {capturedImage && (
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                                onClick={handleRetake}
                                disabled={isProcessing}
                            >
                                <X className="h-4 w-4" />
                                Retake
                            </Button>
                            <Button
                                size="lg"
                                className="gap-2"
                                onClick={handleConfirm}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Confirm
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-4 pb-4 pt-2">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-muted-foreground">
                            {!capturedImage
                                ? isMobile
                                    ? "Tap the circle button to take a photo"
                                    : "Click the circle button to take a photo"
                                : "Review your photo before confirming"}
                        </p>
                        {!capturedImage && isReady && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Ready
                            </span>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}