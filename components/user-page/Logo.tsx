import React from 'react';

/**
 * HOPLogo Component
 * A high-fidelity SVG recreation of the House of Power Ministry International logo.
 * Designed to be pixel-perfect, scalable, and self-contained.
 */
const HOPLogo = ({ className = "w-96 h-96" }: { className?: string }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* --- Definitions for Text Paths and Gradients --- */}
                <defs>
                    <path id="circlePath" d="M 250, 250 m -160, 0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0" />
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="50%" stopColor="#F9E076" />
                        <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                </defs>

                {/* --- Outer Gold Ring --- */}
                <circle cx="250" cy="220" r="190" stroke="url(#goldGradient)" strokeWidth="4" />

                {/* --- Main Blue Circular Border --- */}
                <circle cx="250" cy="220" r="175" fill="white" stroke="#1A3A8A" strokeWidth="25" />

                {/* --- Inner Gold Ring --- */}
                <circle cx="250" cy="220" r="160" stroke="url(#goldGradient)" strokeWidth="3" />

                {/* --- Circular Text --- */}
                <text className="font-serif font-bold fill-white" style={{ fontSize: '24px', letterSpacing: '2px' }}>
                    <textPath href="#circlePath" startOffset="50%" textAnchor="middle" transform="rotate(-90, 250, 250)">
                        HOUSE OF POWER MINISTRY INTERNATIONAL
                    </textPath>
                </text>

                {/* --- Sunburst Rays --- */}
                <g transform="translate(250, 220)">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <line
                            key={i}
                            x1="0"
                            y1="-155"
                            x2="0"
                            y2="-70"
                            stroke="url(#goldGradient)"
                            strokeWidth="2"
                            transform={`rotate(${i * 9 - 90})`}
                            opacity="0.8"
                        />
                    ))}
                </g>

                {/* --- Central Content (Eagle + HOP) --- */}
                <g transform="translate(250, 230)">
                    {/* Stylized Wings/Eagle Silhouette */}
                    <path
                        d="M -100 -20 C -120 -60 -40 -80 0 -30 C 40 -80 120 -60 100 -20 L 80 10 L -80 10 Z"
                        fill="white"
                        stroke="#1A3A8A"
                        strokeWidth="1.5"
                    />
                    {/* Eagle Head (Simplified representation) */}
                    <circle cx="0" cy="-45" r="15" fill="white" />
                    <path d="M -5 -45 Q 0 -55 5 -45 L 0 -35 Z" fill="#D4AF37" /> {/* Beak */}
                    <circle cx="-3" cy="-48" r="1.5" fill="black" /> {/* Eye */}

                    {/* HOP Text */}
                    <text
                        x="0"
                        y="40"
                        textAnchor="middle"
                        className="font-sans font-black fill-[#1A3A8A]"
                        style={{ fontSize: '60px', letterSpacing: '-2px' }}
                    >
                        HOP
                    </text>
                </g>

                {/* --- Bottom Ribbon Banner --- */}
                <g transform="translate(250, 400)">
                    {/* Ribbon Shadow/Folds */}
                    <path d="M -180 -20 L -210 30 L -160 10 Z" fill="#12265A" />
                    <path d="M 180 -20 L 210 30 L 160 10 Z" fill="#12265A" />

                    {/* Main Ribbon Body */}
                    <path
                        d="M -190 -30 Q 0 -10 190 -30 L 200 10 Q 0 30 -200 10 Z"
                        fill="#1A3A8A"
                        stroke="url(#goldGradient)"
                        strokeWidth="2"
                    />

                    {/* Ribbon Motto Text */}
                    <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        className="fill-white font-sans font-medium italic"
                        style={{ fontSize: '18px' }}
                    >
                        Heaven oo!!, εhɔ a na yε pε
                    </text>
                </g>
            </svg>
        </div>
    );
};

export default HOPLogo;




