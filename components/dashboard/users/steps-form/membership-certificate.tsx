"use client";

import React from "react";
import { Star } from "lucide-react";
import { format } from "date-fns";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CertificateData {
    firstName: string;
    lastName: string;
    membershipId?: string;
    phone?: string;
    avatarUrl?: string;
    memberGroup?: string;
    memberPosition?: string;
    date?: string;
}

interface MembershipCertificateProps {
    data: CertificateData;
}

// ─────────────────────────────────────────────
// Token map (all inline — html2canvas safe)
// ─────────────────────────────────────────────

const C = {
    navy: "#1D2D50",
    red: "#F05454",
    gold: "#FFD369",
    cream: "#F9F7F2",
    slate: "#334155",
    white: "#FFFFFF",
};

// ─────────────────────────────────────────────
// Root certificate
// ─────────────────────────────────────────────

const MembershipCertificate = React.forwardRef<
    HTMLDivElement,
    MembershipCertificateProps
>(({ data }, ref) => {
    const fullName = `${data.firstName} ${data.lastName}`;
    const displayDate = data.date
        ? format(new Date(data.date), "MMMM do, yyyy")
        : format(new Date(), "MMMM do, yyyy");

    return (
        <div ref={ref} id="certificate-render">
            {/*
             * ⚠️  html2canvas KEY RULES followed here:
             *
             * 1. NO Tailwind utility classes — html2canvas reads computed styles
             *    but Tailwind classes are only reliable when the element is fully
             *    in the visible viewport. We use 100% inline styles.
             *
             * 2. NO Next.js <Image> — it rewrites src to /_next/image which
             *    html2canvas can't resolve. We use a plain <img> instead.
             *
             * 3. avatarUrl should already be a data: URL (resolved upstream in
             *    StepSixCertificate) so no cross-origin fetch is needed.
             *
             * 4. All dimensions are explicit px — no percentages, no rem/em,
             *    no vw/vh — so the captured size matches exactly what we expect.
             */}
            <div
                style={{
                    position: "relative",
                    width: "1123px",
                    height: "794px",
                    backgroundColor: C.cream,
                    display: "flex",
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: C.navy,
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                {/* ── Left Sidebar ── */}
                <div
                    style={{
                        width: "120px",
                        borderRight: `1px solid #e2e0da`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "24px 0",
                        gap: "20px",
                        flexShrink: 0,
                    }}
                >
                    <GeometricPattern />
                </div>

                {/* ── Main Content ── */}
                <div
                    style={{
                        flex: 1,
                        padding: "48px 64px",
                        display: "flex",
                        flexDirection: "column",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Header row */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "36px",
                        }}
                    >
                        {/* Church name */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: C.navy,
                                    transform: "rotate(45deg)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        border: `2px solid ${C.white}`,
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                        color: C.slate,
                                        fontFamily: "'Arial', sans-serif",
                                    }}
                                >
                                    House of Power Ministry Int.
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: C.navy,
                                    }}
                                >
                                    Abuakwa Central
                                </p>
                            </div>
                        </div>

                        {/* Member ID badge */}
                        <div
                            style={{
                                backgroundColor: C.navy,
                                color: C.white,
                                padding: "8px 16px",
                                borderRadius: "6px",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "9px",
                                    textTransform: "uppercase",
                                    opacity: 0.7,
                                    fontFamily: "'Arial', sans-serif",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                Member ID
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {data.membershipId ?? "—"}
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: "28px" }}>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "68px",
                                fontWeight: 900,
                                lineHeight: 1,
                                color: C.navy,
                                fontFamily: "'Georgia', serif",
                            }}
                        >
                            Certificate
                        </h1>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                textTransform: "uppercase",
                                letterSpacing: "0.3em",
                                opacity: 0.65,
                                fontFamily: "'Arial', sans-serif",
                            }}
                        >
                            Of Membership
                        </p>
                    </div>

                    {/* Recipient */}
                    <div style={{ marginBottom: "28px" }}>
                        <p
                            style={{
                                margin: "0 0 12px",
                                textTransform: "uppercase",
                                fontSize: "11px",
                                letterSpacing: "0.15em",
                                fontWeight: 700,
                                fontFamily: "'Arial', sans-serif",
                            }}
                        >
                            This certificate is proudly presented to
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            {data.avatarUrl && (
                                /* Plain <img> — html2canvas handles data: URLs natively */
                                <img
                                    src={data.avatarUrl}
                                    alt={fullName}
                                    width={80}
                                    height={80}
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: `4px solid ${C.gold}`,
                                        flexShrink: 0,
                                        display: "block",
                                    }}
                                />
                            )}
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "40px",
                                    fontStyle: "italic",
                                    color: C.red,
                                    lineHeight: 1.15,
                                    fontFamily: "'Georgia', serif",
                                }}
                            >
                                {fullName}
                            </h2>
                        </div>
                    </div>

                    {/* Body text */}
                    <div style={{ maxWidth: "620px", marginBottom: "auto" }}>
                        <p
                            style={{
                                margin: "0 0 6px",
                                fontWeight: 700,
                                fontSize: "12px",
                                fontFamily: "'Arial', sans-serif",
                                color: C.navy,
                            }}
                        >
                            In recognition of faithful membership and dedicated service
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "13px",
                                lineHeight: 1.65,
                                fontFamily: "'Arial', sans-serif",
                                color: C.slate,
                            }}
                        >
                            This is to certify that <strong>{fullName}</strong> is a
                            registered member of the church community, recognised for
                            commitment and service.
                        </p>
                    </div>

                    {/* Footer signatures */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingRight: "80px",
                            marginTop: "32px",
                        }}
                    >
                        {/* Date */}
                        <div style={{ textAlign: "center", width: "192px" }}>
                            <p
                                style={{
                                    margin: "0 0 4px",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    color: C.slate,
                                    fontFamily: "'Arial', sans-serif",
                                }}
                            >
                                {displayDate}
                            </p>
                            <div style={{ height: "1px", backgroundColor: C.navy }} />
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    fontSize: "10px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.12em",
                                    color: C.slate,
                                    fontFamily: "'Arial', sans-serif",
                                }}
                            >
                                Date Issued
                            </p>
                        </div>

                        {/* Signature line */}
                        <div style={{ textAlign: "center", width: "192px" }}>
                            <div style={{ height: "1px", backgroundColor: C.navy, marginTop: "20px" }} />
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    fontSize: "10px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.12em",
                                    color: C.slate,
                                    fontFamily: "'Arial', sans-serif",
                                }}
                            >
                                Pastor&apos;s Signature
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Decorative Badge (top-right) ── */}
                <div
                    style={{
                        position: "absolute",
                        top: "48px",
                        right: "48px",
                    }}
                >
                    <MembershipBadge position={data.memberPosition?.toUpperCase() ?? "MEMBER"} />
                </div>
            </div>
        </div>
    );
});

MembershipCertificate.displayName = "MembershipCertificate";
export default MembershipCertificate;

// ─────────────────────────────────────────────
// Sub-components (all inline styles)
// ─────────────────────────────────────────────

export const GeometricPattern = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", opacity: 0.9 }}>
        {/* Circle with inner square */}
        <div
            style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: `6px solid ${C.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: C.red,
                    borderRadius: "2px",
                    transform: "rotate(12deg)",
                }}
            />
        </div>

        {/* Three navy bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "40px", height: "8px", backgroundColor: C.navy }} />
            ))}
        </div>

        {/* Triangle */}
        <div
            style={{
                width: 0,
                height: 0,
                borderLeft: "25px solid transparent",
                borderRight: "25px solid transparent",
                borderTop: `40px solid ${C.navy}`,
            }}
        />

        {/* Gold rounded corner */}
        <div
            style={{
                width: "48px",
                height: "48px",
                backgroundColor: C.gold,
                borderTopRightRadius: "100%",
            }}
        />

        {/* Three vertical bars */}
        <div style={{ display: "flex", gap: "4px" }}>
            {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "8px", height: "48px", backgroundColor: C.navy }} />
            ))}
        </div>

        {/* Red circle */}
        <div
            style={{
                width: "48px",
                height: "48px",
                backgroundColor: C.red,
                borderRadius: "50%",
            }}
        />

        {/* Navy outline circle */}
        <div
            style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: `6px solid ${C.navy}`,
            }}
        />

        {/* Two gold bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[0, 1].map((i) => (
                <div key={i} style={{ width: "40px", height: "8px", backgroundColor: C.gold }} />
            ))}
        </div>

        {/* Navy rounded corner (opposite) */}
        <div
            style={{
                width: "48px",
                height: "48px",
                backgroundColor: C.navy,
                borderBottomLeftRadius: "100%",
            }}
        />
    </div>
);

export const MembershipBadge = ({ position = "MEMBER" }: { position?: string }) => (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Ribbon tails */}
        <div
            style={{
                position: "absolute",
                top: "40px",
                display: "flex",
                gap: "16px",
                zIndex: 0,
            }}
        >
            <div
                style={{
                    width: "16px",
                    height: "64px",
                    backgroundColor: C.navy,
                    transform: "rotate(-12deg)",
                    transformOrigin: "top center",
                }}
            />
            <div
                style={{
                    width: "16px",
                    height: "64px",
                    backgroundColor: C.navy,
                    transform: "rotate(12deg)",
                    transformOrigin: "top center",
                }}
            />
        </div>

        {/* Badge circle */}
        <div
            style={{
                position: "relative",
                zIndex: 1,
                width: "128px",
                height: "128px",
                backgroundColor: C.white,
                borderRadius: "50%",
                border: `4px solid ${C.red}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
        >
            {/* Top stars */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                {[0, 1, 2].map((i) => (
                    <Star key={i} size={10} fill={C.red} stroke="none" />
                ))}
            </div>

            <p
                style={{
                    margin: 0,
                    fontWeight: 900,
                    fontSize: "16px",
                    lineHeight: 1,
                    color: C.navy,
                    fontFamily: "'Arial', sans-serif",
                    textAlign: "center",
                    letterSpacing: "0.02em",
                }}
            >
                {position}
            </p>

            <p
                style={{
                    margin: "2px 0 0",
                    fontWeight: 700,
                    fontSize: "9px",
                    letterSpacing: "0.08em",
                    color: C.navy,
                    fontFamily: "'Arial', sans-serif",
                }}
            >
                CERTIFIED
            </p>

            {/* Bottom stars */}
            <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                {[0, 1, 2].map((i) => (
                    <Star key={i} size={10} fill={C.red} stroke="none" />
                ))}
            </div>
        </div>
    </div>
);