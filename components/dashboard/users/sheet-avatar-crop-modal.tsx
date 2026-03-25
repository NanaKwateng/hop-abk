// src/components/dashboard/users/sheet-avatar-crop-modal.tsx

"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImage } from "@/lib/utils/crop-image";
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
import { Loader2 } from "lucide-react";

interface SheetAvatarCropModalProps {
    open: boolean;
    image: string;
    onClose: () => void;
    onComplete: (croppedImageUrl: string) => void;
}

export default function SheetAvatarCropModal({
    open,
    image,
    onClose,
    onComplete,
}: SheetAvatarCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null
    );
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    async function handleSave() {
        if (!croppedAreaPixels) return;

        setProcessing(true);

        try {
            const croppedUrl = await getCroppedImage(image, croppedAreaPixels);
            onComplete(croppedUrl);
        } catch (err) {
            console.error("Crop failed:", err);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crop Profile Photo</DialogTitle>
                    <DialogDescription>
                        Adjust the crop area to frame the photo perfectly.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
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

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                            Zoom: {zoom.toFixed(1)}x
                        </Label>
                        <Slider
                            min={1}
                            max={3}
                            step={0.1}
                            value={[zoom]}
                            onValueChange={([val]) => setZoom(val)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                            Rotation: {rotation}°
                        </Label>
                        <Slider
                            min={0}
                            max={360}
                            step={1}
                            value={[rotation]}
                            onValueChange={([val]) => setRotation(val)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={processing}>
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