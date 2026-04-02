// src/components/users/steps-form/step-six-certificate.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { CertificateTemplate } from "../certificate-template";
import type { CertificateData } from "./membership-certificate";
import { Button } from "@/components/ui/button";
import {
    DownloadIcon,
    FileImage,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const CERT_WIDTH = 1056;
const CERT_HEIGHT = 816;
const ZOOM_STEP = 0.05;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 0.85;

async function remoteUrlToDataUrl(url: string): Promise<string> {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to fetch image`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

interface StepSixProps {
    data: CertificateData;
    onReset: () => void;
}

export function StepSixCertificate({ data, onReset }: StepSixProps) {
    const captureRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.55);
    const [isCapturing, setIsCapturing] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(data.avatarUrl);
    const [hasConfettiFired, setHasConfettiFired] = useState(false);

    // Pre-fetch avatar to prevent CORS taint
    useEffect(() => {
        if (!data.avatarUrl || data.avatarUrl.startsWith("data:")) return;
        remoteUrlToDataUrl(data.avatarUrl)
            .then(setAvatarDataUrl)
            .catch(() => setAvatarDataUrl(data.avatarUrl));
    }, [data.avatarUrl]);

    // Fire confetti when this step mounts
    useEffect(() => {
        if (hasConfettiFired) return;
        setHasConfettiFired(true);

        const timer = setTimeout(() => {
            // First burst — center
            confetti({
                particleCount: 100,
                spread: 90,
                origin: { y: 0.4, x: 0.5 },
                colors: ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"],
                gravity: 1,
                scalar: 1,
                ticks: 200,
            });

            // Second burst — left side (delayed)
            setTimeout(() => {
                confetti({
                    particleCount: 40,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.5 },
                    colors: ["#10b981", "#fbbf24", "#6366f1"],
                });
            }, 200);

            // Third burst — right side (delayed)
            setTimeout(() => {
                confetti({
                    particleCount: 40,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.5 },
                    colors: ["#ef4444", "#3b82f6", "#8b5cf6"],
                });
            }, 400);
        }, 300);

        return () => clearTimeout(timer);
    }, [hasConfettiFired]);

    const resolvedData = { ...data, avatarUrl: avatarDataUrl };

    // Canvas Generation Logic
    const captureCanvas = useCallback(async () => {
        if (!captureRef.current) throw new Error("Capture ref not ready");

        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 300));

        const html2canvas = (await import("html2canvas-pro")).default;

        return await html2canvas(captureRef.current, {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#FFFFFF",
            width: CERT_WIDTH,
            height: CERT_HEIGHT,
        });
    }, []);

    const handleDownloadPNG = async () => {
        setIsCapturing(true);
        try {
            const canvas = await captureCanvas();
            const link = document.createElement("a");
            link.download = `${data.firstName}-Certificate.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
            setDownloaded(true);
            toast.success("PNG Downloaded!");
        } catch (error) {
            console.error(error);
            toast.error("Download failed");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsCapturing(true);
        try {
            const canvas = await captureCanvas();
            const { default: jsPDF } = await import("jspdf");

            const PX_TO_MM = 0.264583;
            const pageW = CERT_WIDTH * PX_TO_MM;
            const pageH = CERT_HEIGHT * PX_TO_MM;

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [pageW, pageH],
            });

            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
            pdf.save(`${data.firstName}-Certificate.pdf`);

            setDownloaded(true);
            toast.success("PDF Downloaded!");
        } catch (error) {
            console.error(error);
            toast.error("PDF generation failed");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Zoom</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN))}>
                    <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX))}>
                    <ZoomIn className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* VISIBLE PREVIEW */}
            <div
                className="overflow-hidden border rounded-xl bg-slate-50 shadow-inner flex justify-center"
                style={{ height: `${CERT_HEIGHT * zoom}px` }}
            >
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: CERT_WIDTH, height: CERT_HEIGHT }}>
                    <CertificateTemplate data={resolvedData} />
                </div>
            </div>

            {/* HIDDEN CAPTURE TARGET */}
            <div className="fixed top-[-9999px] left-[-9999px] z-[-9999] pointer-events-none">
                <CertificateTemplate data={resolvedData} ref={captureRef} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleDownloadPNG} disabled={isCapturing} className="gap-2">
                    {isCapturing ? <Loader2 className="h-4 w-4 animate-spin" /> : downloaded ? <CheckCircle2 className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                    {isCapturing ? "Generating..." : "Download PNG"}
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF} disabled={isCapturing} className="gap-2">
                    {isCapturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
                    {isCapturing ? "Generating..." : "Download PDF"}
                </Button>
                <Button variant="ghost" onClick={onReset} disabled={isCapturing} className="gap-2 ml-auto">
                    <RotateCcw className="h-4 w-4" />
                    Register Another
                </Button>
            </div>
        </div>
    );
}