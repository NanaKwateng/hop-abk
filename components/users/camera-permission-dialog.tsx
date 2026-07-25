// components/users/camera-permission-dialog.tsx

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, Upload } from "lucide-react";

interface CameraPermissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRetry: () => void;
    onUseUpload: () => void;
}

export function CameraPermissionDialog({
    open,
    onOpenChange,
    onRetry,
    onUseUpload,
}: CameraPermissionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Camera Access Required
                    </DialogTitle>
                    <DialogDescription>
                        We need camera access to take a photo. Please allow camera permissions in your browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-muted/50">
                    <Camera className="h-8 w-8 text-muted-foreground shrink-0 mt-1" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Why do we need this?</p>
                        <p className="text-sm text-muted-foreground">
                            Taking a photo directly from your camera allows for quick member registration
                            without needing to upload a file from your device.
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Tip:</strong> You can also use the upload option if you prefer to select an existing photo.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        onClick={onUseUpload}
                    >
                        <Upload className="h-4 w-4" />
                        Use Upload Instead
                    </Button>
                    <Button
                        className="w-full sm:w-auto gap-2"
                        onClick={onRetry}
                    >
                        <Camera className="h-4 w-4" />
                        Try Again
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}