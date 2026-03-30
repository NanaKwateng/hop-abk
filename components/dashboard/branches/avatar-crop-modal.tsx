// components/dashboard/branches/avatar-crop-modal.tsx
"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImage } from "@/lib/utils/branch-crop-image";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCw, ZoomIn } from "lucide-react";

interface AvatarCropModalProps {
    open: boolean;
    image: string;
    onClose: () => void;
    onComplete: (croppedImageBase64: string) => void;
}

export function AvatarCropModal({
    open,
    image,
    onClose,
    onComplete,
}: AvatarCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    async function handleSave() {
        if (!croppedAreaPixels) return;

        setProcessing(true);

        try {
            const croppedBase64 = await getCroppedImage(
                image,
                croppedAreaPixels,
                rotation
            );
            onComplete(croppedBase64);
            onClose();
        } catch (err) {
            console.error("Crop failed:", err);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCw className="h-5 w-5 text-primary" />
                        Crop Leader Photo
                    </DialogTitle>
                    <DialogDescription>
                        Adjust the crop area, zoom, and rotation to frame the photo
                        perfectly.
                    </DialogDescription>
                </DialogHeader>

                {/* Crop Area */}
                <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted border-2 border-dashed">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Controls */}
                <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <ZoomIn className="h-3.5 w-3.5" />
                            Zoom: {zoom.toFixed(1)}x
                        </Label>
                        <Slider
                            min={1}
                            max={3}
                            step={0.1}
                            value={[zoom]}
                            onValueChange={([val]) => setZoom(val)}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <RotateCw className="h-3.5 w-3.5" />
                            Rotation: {rotation}°
                        </Label>
                        <Slider
                            min={0}
                            max={360}
                            step={1}
                            value={[rotation]}
                            onValueChange={([val]) => setRotation(val)}
                            className="cursor-pointer"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing…
                            </>
                        ) : (
                            "Accept & Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}