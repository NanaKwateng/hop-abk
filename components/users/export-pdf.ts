// components/users/testimonials/export-pdf.ts
import jsPDF from "jspdf";
import type { Testimonial } from "@/lib/types/testimonials";

export function exportTestimonialsPDF(
    memberName: string,
    testimonials: Testimonial[]
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── Header ──
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Member Records", margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(memberName, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.text(
        `Generated: ${new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })}`,
        margin,
        y
    );
    y += 4;

    // Separator line
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setTextColor(0);

    // ── Testimonials ──
    for (const item of testimonials) {
        // Check if we need a new page
        if (y > 260) {
            doc.addPage();
            y = margin;
        }

        // Title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(item.title, margin, y);
        y += 6;

        // Category + date
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);

        const meta: string[] = [];
        if (item.category) {
            meta.push(
                item.category.charAt(0).toUpperCase() + item.category.slice(1)
            );
        }
        if (item.eventDate) {
            try {
                meta.push(
                    new Date(item.eventDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })
                );
            } catch {
                meta.push(item.eventDate);
            }
        }
        if (meta.length > 0) {
            doc.text(meta.join(" • "), margin, y);
            y += 5;
        }

        // Content
        doc.setTextColor(40);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const lines = doc.splitTextToSize(item.content, contentWidth);
        for (const line of lines) {
            if (y > 275) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += 5;
        }

        y += 8;

        // Separator
        doc.setDrawColor(230);
        doc.line(margin, y - 4, pageWidth - margin, y - 4);
    }

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    doc.save(`${memberName.replace(/\s+/g, "-")}-records.pdf`);
}