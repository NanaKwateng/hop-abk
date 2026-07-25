// components/users/steps-form/step-four-photo.tsx

"use client";

import { useState } from "react";
import FileUpload from "@/components/dashboard/users/file-upload";
import { CameraCapture } from "@/components/users/camera-capture";
import { CameraPermissionDialog } from "@/components/users/camera-permission-dialog";
import { Button } from "@/components/ui/button";
import {
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Camera, Upload, AlertCircle } from "lucide-react";
import { isCameraSupported } from "@/lib/utils/camera-utils";
import type { UseFormReturn } from "react-hook-form";
import type { CreateUserInput } from "@/lib/validations/create-user-schema";

interface StepFourProps {
    form: UseFormReturn<CreateUserInput>;
}

export function StepFourPhoto({ form }: StepFourProps) {
    const { setValue, watch } = form;
    const avatarUrl = watch("avatarUrl");

    const [showCamera, setShowCamera] = useState(false);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [hasCameraError, setHasCameraError] = useState(false);

    const cameraSupported = isCameraSupported();

    const handleCaptureFromCamera = (imageDataUrl: string) => {
        setValue("avatarUrl", imageDataUrl, { shouldValidate: true });
        setShowCamera(false);
        setHasCameraError(false);
    };

    const handleCameraOpen = () => {
        setShowCamera(true);
    };

    const handleCameraError = () => {
        setShowCamera(false);
        setHasCameraError(true);
        setShowPermissionDialog(true);
    };

    const handleCameraCancel = () => {
        setShowCamera(false);
    };

    const handleRetryCamera = () => {
        setShowPermissionDialog(false);
        setHasCameraError(false);
        setShowCamera(true);
    };

    const handleUseUpload = () => {
        setShowPermissionDialog(false);
        setHasCameraError(false);
    };

    return (
        <FieldSet>
            <FieldLegend>Profile Photo</FieldLegend>
            <FieldDescription>
                Upload a clear photo of the member or take one with your camera.
                You can crop and adjust before accepting.
            </FieldDescription>

            <FieldGroup className="space-y-6">
                {/* Upload Section */}
                <FileUpload
                    currentPreview={avatarUrl}
                    onAccept={(croppedUrl) =>
                        setValue("avatarUrl", croppedUrl, { shouldValidate: true })
                    }
                    onClear={() => setValue("avatarUrl", undefined)}
                />

                {/* Camera Option */}
                {cameraSupported ? (
                    <>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or take a photo
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="gap-2 w-full sm:w-auto"
                                onClick={handleCameraOpen}
                            >
                                <Camera className="h-5 w-5" />
                                Take Photo
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            Use your device camera to take a photo directly. You&apos;ll be able to crop it afterward.
                        </p>
                    </>
                ) : (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                Camera not available
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400/80">
                                Your device doesn&apos;t support camera access or permissions are not available.
                                Please use the upload option above.
                            </p>
                        </div>
                    </div>
                )}
            </FieldGroup>

            {/* Camera Modal */}
            <CameraCapture
                open={showCamera}
                onOpenChange={setShowCamera}
                onCapture={handleCaptureFromCamera}
                onCancel={handleCameraCancel}
            />

            {/* Permission Dialog */}
            <CameraPermissionDialog
                open={showPermissionDialog}
                onOpenChange={setShowPermissionDialog}
                onRetry={handleRetryCamera}
                onUseUpload={handleUseUpload}
            />
        </FieldSet>
    );
}