// components/users/testimonials/export-word.ts
import {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    Packer,
    AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import type { Testimonial } from "@/lib/types/testimonials";

export async function exportTestimonialsWord(
    memberName: string,
    testimonials: Testimonial[]
) {
    const children: Paragraph[] = [];

    // ── Header ──
    children.push(
        new Paragraph({
            text: "Member Records",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 100 },
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: memberName,
                    bold: true,
                    size: 28,
                }),
            ],
            spacing: { after: 50 },
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Generated: ${new Date().toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}`,
                    size: 18,
                    color: "888888",
                }),
            ],
            spacing: { after: 300 },
        })
    );

    // ── Testimonials ──
    for (const item of testimonials) {
        // Title
        children.push(
            new Paragraph({
                text: item.title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 80 },
            })
        );

        // Meta
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
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: meta.join(" • "),
                            size: 18,
                            color: "888888",
                            italics: true,
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );
        }

        // Content
        const contentParagraphs = item.content.split("\n");
        for (const para of contentParagraphs) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: para,
                            size: 22,
                        }),
                    ],
                    spacing: { after: 80 },
                })
            );
        }
    }

    // ── Build document ──
    const doc = new Document({
        sections: [
            {
                children,
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${memberName.replace(/\s+/g, "-")}-records.docx`);
}