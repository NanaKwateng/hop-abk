// src/components/users/file-upload.tsx

"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Camera, RotateCcw, Upload, X } from "lucide-react"
import AvatarCropModal from "./avatar-crop-modal"

interface FileUploadProps {
    currentPreview?: string
    onAccept: (croppedUrl: string) => void
    onClear: () => void
}

export default function FileUpload({
    currentPreview,
    onAccept,
    onClear,
}: FileUploadProps) {
    const [rawImage, setRawImage] = useState<string | null>(null)
    const [showCropper, setShowCropper] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            // Validate file
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file")
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be under 5MB")
                return
            }

            const url = URL.createObjectURL(file)
            setRawImage(url)
            setShowCropper(true)

            // Reset input so same file can be re-selected
            e.target.value = ""
        },
        []
    )

    function handleCropComplete(croppedUrl: string) {
        setShowCropper(false)

        // Clean up raw image blob
        if (rawImage) URL.revokeObjectURL(rawImage)
        setRawImage(null)

        onAccept(croppedUrl)
    }

    function handleCropCancel() {
        setShowCropper(false)

        if (rawImage) URL.revokeObjectURL(rawImage)
        setRawImage(null)
    }

    function handleRemove() {
        if (currentPreview) URL.revokeObjectURL(currentPreview)
        onClear()
    }

    function triggerFileInput() {
        fileInputRef.current?.click()
    }

    return (
        <FieldSet>
            <FieldLegend>Profile Photo</FieldLegend>
            <FieldDescription>
                Upload a clear photo of the member. You can crop and adjust before
                accepting.
            </FieldDescription>

            <FieldGroup>
                <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed p-8">
                    {/* Preview */}
                    {currentPreview ? (
                        <div className="relative">
                            <Image
                                src={currentPreview}
                                alt="Member profile preview"
                                width={160}
                                height={160}
                                className="h-40 w-40 rounded-full object-cover ring-4 ring-muted"
                                unoptimized
                                priority
                            />

                            {/* Remove overlay */}
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
                                aria-label="Remove photo"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted">
                            <Camera className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant={currentPreview ? "outline" : "default"}
                            onClick={triggerFileInput}
                        >
                            {currentPreview ? (
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
                    </div>

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
            </FieldGroup>

            {/* Crop modal */}
            {rawImage && (
                <AvatarCropModal
                    open={showCropper}
                    image={rawImage}
                    onClose={handleCropCancel}
                    onComplete={handleCropComplete}
                />
            )}
        </FieldSet>
    )
}