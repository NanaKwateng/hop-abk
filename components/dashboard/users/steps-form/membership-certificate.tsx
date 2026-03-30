"use client";

import React from "react";
import { Star, BadgeCheck } from "lucide-react";
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
                                <AvatarBadge avatarUrl={data.avatarUrl} />
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

export const AvatarBadge = ({ avatarUrl }: { avatarUrl: string }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: "4px" }}>
            {/* Badge Graphic Container */}
            <div style={{ position: "relative", width: "80px", height: "100px" }}>

                {/* Left Ribbon Tail */}
                <div style={{
                    position: "absolute",
                    top: "45px",
                    left: "12px",
                    width: "20px",
                    display: "flex",
                    flexDirection: "column",
                    transform: "rotate(25deg)",
                    transformOrigin: "top center",
                    zIndex: 0,
                }}>
                    <div style={{ width: "20px", height: "40px", backgroundColor: "#0ea5e9" }} />
                    {/* The triangle cutout (uses background cream color to act as a mask) */}
                    <div style={{
                        width: 0, height: 0,
                        borderLeft: "10px solid #0ea5e9",
                        borderRight: "10px solid #0ea5e9",
                        borderBottom: `10px solid ${C.cream}`
                    }} />
                    {/* Golden accent lines matching the image */}
                    <div style={{ position: "absolute", top: 0, left: "2px", width: "1.5px", height: "36px", backgroundColor: "#FBE18D" }} />
                    <div style={{ position: "absolute", top: 0, right: "2px", width: "1.5px", height: "36px", backgroundColor: "#FBE18D" }} />
                </div>

                {/* Right Ribbon Tail */}
                <div style={{
                    position: "absolute",
                    top: "45px",
                    right: "12px",
                    width: "20px",
                    display: "flex",
                    flexDirection: "column",
                    transform: "rotate(-25deg)",
                    transformOrigin: "top center",
                    zIndex: 0,
                }}>
                    <div style={{ width: "20px", height: "40px", backgroundColor: "#0ea5e9" }} />
                    {/* The triangle cutout */}
                    <div style={{
                        width: 0, height: 0,
                        borderLeft: "10px solid #0ea5e9",
                        borderRight: "10px solid #0ea5e9",
                        borderBottom: `10px solid ${C.cream}`
                    }} />
                    {/* Golden accent lines matching the image */}
                    <div style={{ position: "absolute", top: 0, left: "2px", width: "1.5px", height: "36px", backgroundColor: "#FBE18D" }} />
                    <div style={{ position: "absolute", top: 0, right: "2px", width: "1.5px", height: "36px", backgroundColor: "#FBE18D" }} />
                </div>

                {/* Main Circular Body */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "80px",
                    height: "80px",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {/* Scalloped Outer Edge (built with rotated squares for html2canvas safety) */}
                    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                        {[0, 15, 30, 45, 60, 75].map((deg) => (
                            <div
                                key={deg}
                                style={{
                                    position: "absolute",
                                    top: "2px", left: "2px", right: "2px", bottom: "2px",
                                    backgroundColor: "#0ea5e9", // Sky Blue outer ring
                                    borderRadius: "4px",
                                    transform: `rotate(${deg}deg)`,
                                    border: "1px solid rgba(0,0,0,0.15)"
                                }}
                            />
                        ))}
                    </div>

                    {/* Thick Golden Linen Ring */}
                    <div style={{
                        position: "relative",
                        zIndex: 2,
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FBE18D 0%, #D4AF37 40%, #FFF3B0 60%, #B8860B 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                    }}>
                        {/* Inner White Container locking the Avatar */}
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: C.white,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
                        }}>
                            <img
                                src={avatarUrl}
                                alt="Member Avatar"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    objectFit: "cover",
                                    display: "block",
                                    backgroundColor: "#f1f5f9"
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Text & Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", zIndex: 2 }}>
                <BadgeCheck size={12} color="#0ea5e9" strokeWidth={3} />
                <span style={{
                    fontSize: "8px",
                    fontWeight: 800,
                    color: "#0284c7",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "'Arial', sans-serif"
                }}>
                    Member Verified
                </span>
            </div>
        </div>
    );
};