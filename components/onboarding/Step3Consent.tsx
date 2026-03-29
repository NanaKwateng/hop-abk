// src/components/onboarding/steps/Step3Terms.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Step3Terms() {
    const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
    const [agreed, setAgreed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (id: string) => {
        setExpandedSections((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const termsContent = [
        {
            id: "terms-1",
            title: "1. Acceptance of Terms",
            content:
                "By accessing and using hop, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
        },
        {
            id: "terms-2",
            title: "2. Use License",
            content:
                "Permission is granted to temporarily download one copy of the materials (information or software) on hop's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials, use the materials for any commercial purpose or for any public display, attempt to decompile or reverse engineer any software contained on hop, remove any copyright or other proprietary notations from the materials.",
        },
        {
            id: "terms-3",
            title: "3. Disclaimer",
            content:
                "The materials on hop's website are provided as is. hop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
        },
        {
            id: "terms-4",
            title: "4. Limitations",
            content:
                "In no event shall hop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on hop's website.",
        },
        {
            id: "terms-5",
            title: "5. Accuracy of Materials",
            content:
                "The materials appearing on hop's website could include technical, typographical, or photographic errors. hop does not warrant that any of the materials on our website are accurate, complete, or current. hop may make changes to the materials contained on our website at any time without notice.",
        },
    ];

    const privacyContent = [
        {
            id: "privacy-1",
            title: "1. Information Collection",
            content:
                "We collect information you provide directly, such as when you create an account, complete your profile, or contact us. This includes name, email address, profile information, and any other information you choose to provide.",
        },
        {
            id: "privacy-2",
            title: "2. How We Use Your Information",
            content:
                "We use the information we collect to provide, maintain, and improve our services. Your information may be used to: send you service-related announcements, respond to your inquiries, personalize your experience, conduct research and analytics, and comply with legal obligations.",
        },
        {
            id: "privacy-3",
            title: "3. Data Security",
            content:
                "We implement comprehensive security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption, secure servers, and regular security audits to ensure your data remains protected.",
        },
        {
            id: "privacy-4",
            title: "4. Information Sharing",
            content:
                "We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business, subject to strict confidentiality agreements.",
        },
        {
            id: "privacy-5",
            title: "5. Your Rights",
            content:
                "You have the right to access, update, or delete your personal information at any time. You can control your privacy settings and choose what information is visible to other users. Contact us with any privacy concerns.",
        },
    ];

    const content = activeTab === "terms" ? termsContent : privacyContent;

    return (
        <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 border-b border-gray-800"
            >
                {["terms", "privacy"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as "terms" | "privacy")}
                        className={`pb-4 font-semibold transition-all duration-300 relative capitalize ${activeTab === tab ? "text-white" : "text-gray-500"
                            }`}
                    >
                        {tab === "terms" ? "Terms of Service" : "Privacy Policy"}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </motion.div>

            {/* Content Sections */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar"
            >
                {content.map((section) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border border-gray-800 rounded-lg bg-gray-900/30 backdrop-blur-sm hover:border-gray-700 transition-colors"
                    >
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900/50 transition-colors rounded-lg"
                        >
                            <h3 className="font-semibold text-white">{section.title}</h3>
                            <motion.div
                                animate={{
                                    rotate: expandedSections.includes(section.id) ? 180 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes(section.id) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-4 pb-4"
                                >
                                    <p className="text-gray-400 leading-relaxed text-sm">{section.content}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>

            {/* Custom Scrollbar CSS */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.4);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.6);
                }
            `}</style>

            {/* Agreement Checkbox */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-sm"
            >
                <label className="flex items-start gap-3 cursor-pointer group">
                    <motion.div
                        className="w-5 h-5 rounded border border-gray-600 bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-blue-500 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="hidden"
                        />
                        {agreed && (
                            <motion.svg
                                className="w-3 h-3 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </motion.svg>
                        )}
                    </motion.div>
                    <span className="text-white font-medium">
                        I agree to the {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"}
                    </span>
                </label>
            </motion.div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800"
            >
                <span className="text-lg">ℹ️</span>
                <p className="text-sm text-gray-400">
                    You must agree to proceed. You can always review these documents later in your account settings.
                </p>
            </motion.div>
        </div>
    );
}