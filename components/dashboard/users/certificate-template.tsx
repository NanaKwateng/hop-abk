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

                {/* --- Abstract Geometric Background --- */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FDB813] rounded-full opacity-20 blur-3xl" />
                    <div className="absolute top-10 -left-10 w-64 h-64 bg-[#0047AB] rounded-full opacity-80 mix-blend-multiply" />
                    <div className="absolute top-48 left-32 w-32 h-32 bg-[#E31E24] rounded-full opacity-90 shadow-lg" />
                    <div className="absolute top-20 left-64 w-16 h-16 bg-[#F39C12] rounded-full shadow-md" />
                    <div className="absolute top-72 left-16 w-20 h-20 bg-[#4CAF50] rounded-full shadow-md" />

                    <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#00A8B5] rounded-full opacity-10 blur-3xl" />
                    <div className="absolute -bottom-20 -right-15 w-72 h-72 bg-[#8E44AD] rounded-full opacity-80 mix-blend-multiply" />
                    <div className="absolute bottom-0 right-32 w-24 h-24 bg-[#87CEEB] rounded-full shadow-lg" />
                    <div className="absolute bottom-0 right-56 w-12 h-12 bg-[#BDC3C7] rounded-full" />
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