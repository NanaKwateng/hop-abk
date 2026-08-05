import React from 'react';
import type { CertificateData } from "@/components/dashboard/users/steps-form/membership-certificate"; // Adjust import path if needed
import { format } from "date-fns";
import { FaAward } from "react-icons/fa6";

interface CertificateTemplateProps {
    data: CertificateData;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
    ({ data }, ref) => {
        const fullName = `${data.firstName || 'Nana'} ${data.lastName || 'Kwateng'}`;
        const group = data.memberGroup?.replace('_', ' ') || 'Member';
        const position = data.memberPosition || 'Member';
        const date = data.date ? format(new Date(data.date), "MMMM do, yyyy") : format(new Date(), "MMMM do, yyyy");

        return (
            <div
                ref={ref}
                // Fixed exactly to 1056x816 for standard 11x8.5 inch aspect ratio
                className="relative w-[1056px] h-[816px] bg-white overflow-hidden text-slate-800"
                style={{ backgroundColor: "#ffffff", boxSizing: "border-box" }}
            >
                {/* --- 100% Native SVG Texture --- */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23000000'/%3E%3C/svg%3E")`,
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* --- Abstract Geometric Background (Updated to match Reference Image) --- */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {/* Top-Left Geometric Block */}
                    <svg className="absolute top-0 left-0 w-[140px] h-[140px]" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="0,0 70,0 0,70" fill="#E31E24" />
                        <polygon points="70,0 140,0 70,70" fill="#4A90E2" />
                        <polygon points="0,70 70,70 0,140" fill="#4A90E2" />
                        <polygon points="70,70 140,70 70,140" fill="#FDB813" />
                    </svg>

                    {/* Top-Left 3x4 Dot Grid */}
                    <svg className="absolute top-10 left-[220px] w-[80px] h-[60px]" viewBox="0 0 80 60" fill="none">
                        <pattern id="dotGridTL" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="5" cy="5" r="3.5" fill="#1E293B" />
                        </pattern>
                        <rect width="80" height="60" fill="url(#dotGridTL)" />
                    </svg>

                    {/* Top-Right Decorative Composition */}
                    <svg className="absolute top-0 right-0 w-[200px] h-[220px]" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Sparkle Icon */}
                        <path d="M40 40 Q40 60 20 60 Q40 60 40 80 Q40 60 60 60 Q40 60 40 40 Z" fill="#E31E24" />

                        {/* Right Top Block */}
                        <polygon points="120,0 200,0 200,80" fill="#E31E24" />
                        <polygon points="120,0 200,80 120,80" fill="#4A90E2" />

                        {/* Semi-Circle Layer with Concentric Lines */}
                        <path d="M 120 80 A 60 60 0 0 1 200 80 Z" fill="#E31E24" />
                        <path d="M 200 80 A 70 70 0 0 1 130 150" stroke="#1E293B" strokeWidth="2" fill="none" />
                        <path d="M 200 80 A 85 85 0 0 1 115 165" stroke="#1E293B" strokeWidth="2" fill="none" />
                        <path d="M 200 80 A 100 100 0 0 1 100 180" stroke="#1E293B" strokeWidth="2" fill="none" />

                        {/* Thin accent lines (white/60) */}
                        <line x1="120" y1="20" x2="190" y2="20" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
                        <line x1="120" y1="35" x2="175" y2="35" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
                    </svg>

                    {/* Bottom-Left Large Geometric Corner Accent */}
                    <svg className="absolute bottom-0 left-0 w-[300px] h-[300px]" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Concentric Arc Lines */}
                        <path d="M 0 110 A 110 110 0 0 1 110 0" stroke="#1E293B" strokeWidth="2" fill="none" />
                        <path d="M 0 95 A 95 95 0 0 1 95 0" stroke="#1E293B" strokeWidth="2" fill="none" />
                        <path d="M 0 80 A 80 80 0 0 1 80 0" stroke="#1E293B" strokeWidth="2" fill="none" />

                        {/* Sparkle Accent */}
                        <path d="M 145 115 Q 145 135 125 135 Q 145 135 145 155 Q 145 135 165 135 Q 145 135 145 115 Z" fill="#FDB813" />

                        {/* Donut Circle */}
                        <circle cx="50" cy="170" r="35" fill="#E31E24" />
                        <circle cx="50" cy="170" r="18" fill="#ffffff" />

                        {/* Mosaic Triangle Array */}
                        <polygon points="0,220 50,170 50,220" fill="#E31E24" />
                        <polygon points="50,170 100,220 50,220" fill="#4A90E2" />
                        <polygon points="0,220 50,220 0,270" fill="#4A90E2" />
                        <polygon points="50,220 100,220 50,270" fill="#FDB813" />
                        <polygon points="50,220 100,170 100,220" fill="#E31E24" />

                        {/* Bottom Arch & Semi-Circles */}
                        <path d="M 0 300 A 70 70 0 0 1 140 300 Z" fill="#E31E24" />
                        <path d="M 70 300 A 70 70 0 0 1 210 300 Z" fill="#FDB813" />
                        <path d="M 210 300 A 45 45 0 0 1 300 300 Z" fill="#4A90E2" />

                        {/* Thin White Overlay Lines */}
                        <line x1="15" y1="240" x2="85" y2="240" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
                        <line x1="15" y1="255" x2="65" y2="255" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
                    </svg>

                    {/* Bottom-Right Vertical 3x8 Dot Grid */}
                    <svg className="absolute bottom-16 right-16 w-[60px] h-[160px]" viewBox="0 0 60 160" fill="none">
                        <pattern id="dotGridBR" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="5" cy="5" r="3.5" fill="#1E293B" />
                        </pattern>
                        <rect width="60" height="160" fill="url(#dotGridBR)" />
                    </svg>

                    {/* Bottom-Right Geometric Cluster */}
                    <svg className="absolute bottom-0 right-0 w-[200px] h-[120px]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="60,60 110,60 60,120" fill="#E31E24" />
                        <polygon points="110,60 160,60 110,120" fill="#FDB813" />
                        <polygon points="110,60 160,120 110,120" fill="#E31E24" />
                        <polygon points="160,60 200,60 200,100" fill="#4A90E2" />
                        <polygon points="110,120 160,120 160,60" fill="#FDB813" />
                        <polygon points="160,120 200,120 200,80" fill="#E31E24" />
                    </svg>
                </div>

                {/* --- Header / Logo (Centered at the very top) --- */}
                <div className="absolute top-6 w-full flex justify-center items-center gap-4 z-10">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="w-16 h-16 object-contain rounded-full"
                        crossOrigin="anonymous"
                    />
                    <div className="text-left">
                        <p className="font-semibold tracking-wider text-slate-800 uppercase m-0 leading-tight">
                            <span className="text-[11px] tracking-[0.2em] text-slate-500">House Of Power Ministry Int.</span>
                            <br />
                            <span className="text-md">Abuakwa Central</span>
                        </p>
                    </div>
                </div>

                {/* --- NEW: User Avatar (Top Right) --- */}
                {data.avatarUrl && (
                    <div className="absolute top-4 right-16 z-20">
                        {/* 
                          * Explicit inline px dimensions are critical here. 
                          * html2canvas sometimes ignores Tailwind w/h classes on images, 
                          * which causes them to collapse or stretch.
                        */}
                        <img
                            src={data.avatarUrl}
                            alt={`${data.firstName} Avatar`}
                            crossOrigin="anonymous"
                            style={{
                                width: "112px",
                                height: "112px",
                                objectFit: "cover",
                                display: "block",
                            }}
                            className="rounded-full border-[3px] border-white shadow-lg"
                        />
                    </div>
                )}

                {/* --- Main Content --- */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full pt-52 px-32 text-center">
                    <header className="mb-8">
                        <h1 className="text-7xl font-serif font-light tracking-wide text-slate-900 mb-2 m-0">
                            Certificate
                        </h1>
                        <p className="text-xl font-sans tracking-[0.25em] uppercase text-slate-500 m-0">
                            of Membership
                        </p>
                    </header>

                    <section className="flex flex-col items-center mb-16">
                        <p className="text-lg font-medium italic text-slate-500 mb-6 m-0">
                            This certificate is proudly presented to
                        </p>

                        <div className="flex items-center gap-6 mb-8">
                            <h2 className="text-6xl font-serif text-slate-900 m-0 leading-none">
                                {fullName}
                            </h2>
                        </div>

                        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 font-light italic m-0">
                            In official recognition of your formal induction into the House of Power Ministry International on <strong>{date}</strong>.
                            This certifies that you have met all requirements and are recognized as a dedicated
                            <strong> {position.toLowerCase()}</strong> within the <strong>{group.toLowerCase()}</strong>.
                            May you continue to grow in faith and serve with excellence.
                        </p>
                    </section>

                    {/* --- Footer / Signatures --- */}
                    <footer className="w-full mt-auto mb-16 grid grid-cols-3 items-end px-10">
                        {/* Left: Member Signature */}
                        <div className="flex flex-col items-center">
                            <div className="h-10 mb-2" />
                            <div className="w-48 h-[1px] bg-slate-400 mb-2" />
                            <p className="font-bold text-slate-800 text-sm m-0">Member Signature</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest m-0 mt-1">
                                ID: {data.membershipId || 'N/A'}
                            </p>
                        </div>

                        {/* Center: Seal */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative flex items-center justify-center bg-transparent p-4 rounded-full shadow-inner">
                                <FaAward className="w-12 h-12 text-[#FDB813] stroke-[1.5px]" />
                            </div>
                        </div>

                        {/* Right: Resident Pastor Signature */}
                        <div className="flex flex-col items-center">
                            <div className="h-10 mb-2" />
                            <div className="w-48 h-[1px] bg-slate-400 mb-2" />
                            <p className="font-bold text-slate-800 text-sm m-0">Residence Pastor</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest m-0 mt-1">
                                Signature
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";