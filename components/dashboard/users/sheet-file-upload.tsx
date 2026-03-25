// src/components/dashboard/users/sheet-file-upload.tsx

"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, RotateCcw, Upload, X } from "lucide-react";
import SheetAvatarCropModal from "./sheet-avatar-crop-modal";

interface SheetFileUploadProps {
    /** Current preview URL — can be a blob URL (new) or a Supabase URL (existing) */
    currentPreview?: string | null;
    /** Called with the cropped blob URL when user accepts a crop */
    onAccept: (croppedBlobUrl: string) => void;
    /** Called when user removes the photo */
    onClear: () => void;
}

export function SheetFileUpload({
    currentPreview,
    onAccept,
    onClear,
}: SheetFileUploadProps) {
    const [rawImage, setRawImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be under 5MB");
                return;
            }

            const url = URL.createObjectURL(file);
            setRawImage(url);
            setShowCropper(true);

            // Reset input so same file can be re-selected
            e.target.value = "";
        },
        []
    );

    function handleCropComplete(croppedBlobUrl: string) {
        setShowCropper(false);

        if (rawImage) URL.revokeObjectURL(rawImage);
        setRawImage(null);

        onAccept(croppedBlobUrl);
    }

    function handleCropCancel() {
        setShowCropper(false);

        if (rawImage) URL.revokeObjectURL(rawImage);
        setRawImage(null);
    }

    function handleRemove() {
        // Only revoke blob URLs, not Supabase URLs
        if (currentPreview && currentPreview.startsWith("blob:")) {
            URL.revokeObjectURL(currentPreview);
        }
        onClear();
    }

    function triggerFileInput() {
        fileInputRef.current?.click();
    }

    const hasPreview = currentPreview && currentPreview.length > 0;

    return (
        <div className="space-y-2">
            <Label>Profile Photo</Label>
            <p className="text-xs text-muted-foreground">
                Upload a clear photo. You can crop and adjust before accepting.
            </p>

            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-6">
                {/* Preview */}
                {hasPreview ? (
                    <div className="relative">
                        <Image
                            src={currentPreview}
                            alt="Member profile preview"
                            width={128}
                            height={128}
                            className="h-32 w-32 rounded-full object-cover ring-4 ring-muted"
                            unoptimized // blob URLs and external URLs need this
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
                            aria-label="Remove photo"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                    </div>
                )}

                {/* Actions */}
                <Button
                    type="button"
                    variant={hasPreview ? "outline" : "default"}
                    size="sm"
                    onClick={triggerFileInput}
                >
                    {hasPreview ? (
                        <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Choose Different
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Photo
                        </>
                    )}
                </Button>

                {/* Hidden file input */}
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                    aria-label="Select profile image"
                />

                <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max 5MB.
                </p>
            </div>

            {/* Crop modal */}
            {rawImage && (
                <SheetAvatarCropModal
                    open={showCropper}
                    image={rawImage}
                    onClose={handleCropCancel}
                    onComplete={handleCropComplete}
                />
            )}
        </div>
    );
}