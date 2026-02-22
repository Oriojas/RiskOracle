import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ oscarPhoto, jhonPhoto }) => {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [timelineVisible, setTimelineVisible] = useState(false);
    const timelineRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimelineVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.2 }
        );

        if (timelineRef.current) {
            observer.observe(timelineRef.current);
        }

        return () => {
            if (timelineRef.current) observer.unobserve(timelineRef.current);
        };
    }, []);

    const quotes = [
        {
            text: "The complexity of modern smart contracts has created a professional-grade attack surface. Traditional audits are no longer enough; we need real-time, verifiable intent analysis.",
            author: "Lead Researcher, Web3 Security Alliance"
        },
        {
            text: "AI-aided scams are evolving faster than human detection. RiskOracle's approach to decoding semantic intent is the only viable defense for mass adoption.",
            author: "CTO, Decentralized Security Hub"
        },
        {
            text: "We are seeing a 1,025% surge in contract-based phishing. Pre-transaction validation isn't a luxury anymore; it's a fundamental security primitive.",
            author: "Senior Auditor, Chainlink Labs"
        },
        {
            text: "Decentralized verification of transaction intent is the 'missing link' in the Web3 stack. RiskOracle is building exactly that.",
            author: "Protocol Architect, L2 Scaling Solutions"
        },
        {
            text: "In 2025, every user will need an 'Oracle' by their side to navigate the minefield of malicious rollups and fake token drains.",
            author: "Founder, Arbitrum Ecosystem Watch"
        }
    ];

    const timelineEvents = [
        { year: "2020", title: "DEFI SUMMER", desc: "First wave of flash loan attacks. $150M lost.", x: 450, y: 50 },
        { year: "2022", title: "BRIDGE WARS", desc: "Infrastructure breaches. $800M+ drained.", x: 380, y: 150 },
        { year: "2024", title: "PHISHING PEAK", desc: "Wallet drains via 'Approve'. $1B+ lost.", x: 340, y: 280 },
        { year: "2025", title: "AI DOMINANCE", desc: "AI-generated malicious contracts. $3.1B crisis.", x: 320, y: 430, highlight: true }
    ];

    return (
        <div className="landing-container">
            <header className="landing-header">
                <Link to="/" className="back-link" style={{ display: 'inline-block', padding: '0.8rem 1.5rem', background: 'rgba(46,123,255,0.15)', border: '1px solid var(--brand-blue)', borderRadius: '8px', color: '#fff', fontWeight: 'bold', marginBottom: '2rem' }}>← Back to Analyzer</Link>

                <div className="hero-split">
                    <div className="hero-text-content">
                        <h1 className="cyber-title">THE <span style={{ color: '#fff' }}>ORACLE'S</span> VISION</h1>
                        <p className="cyber-text accent">Securing the future of Web3 through AI-assisted Risk & Compliance verification, one transaction at a time.</p>
                    </div>

                    <div className="hero-3d-node">
                        <div className="core-sphere"></div>
                        <div className="orbit-ring ring-x"></div>
                        <div className="orbit-ring ring-y"></div>
                        <div className="orbit-ring ring-z"></div>
                        <div className="data-particles"></div>
                    </div>
                </div>
            </header>

            <section className="landing-section purpose">
                <div className="cyber-panel">
                    <h2>Our Purpose</h2>
                    <p>
                        In the rapidly evolving world of decentralized finance, uncertainty is the enemy.
                        RiskOracle is a pre-execution verification tool. Users can copy any suspicious contract address and calldata *before* signing, allowing our AI to decode the semantic intent and prevent catastrophic losses.
                    </p>
                    <div className="purpose-grid">
                        <div className="purpose-item">
                            <span className="icon">🛡️</span>
                            <h3>Pre-Sign Defense</h3>
                            <p>Identify risks manually before you ever click 'Approve'.</p>
                        </div>
                        <div className="purpose-item">
                            <span className="icon">🧠</span>
                            <h3>AI Agent Abstraction</h3>
                            <p>DeepSeek AI translates complex hex into human-readable logic.</p>
                        </div>
                        <div className="purpose-item">
                            <span className="icon">⛓️</span>
                            <h3>Verify</h3>
                            <p>Leverage Chainlink CRE for verifiable security.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-section market-shock">
                <div className="hacker-hud">

                    {/* Left Column: Global Alerts & Metrics */}
                    <div className="hud-panel alert flex-col">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-cyan)' }}>
                            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                            <span className="hud-label" style={{ color: 'var(--neon-cyan)' }}>Security Crisis Detected</span>
                        </div>

                        <h2 className="hud-title">GLOBAL ALERT:<br /><span>2025 CRISIS</span></h2>

                        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                            <span className="hud-label" style={{ marginBottom: '0.5rem' }}>Total Value Stolen H1 2025</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                                <h3 className="glitch-text">$3.1B</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-cyan)' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>+1,025%</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <span className="hud-label">H1 2025 vs. Full Year 2024</span>
                                <span className="hud-label" style={{ color: 'var(--neon-cyan)' }}>85% CAP_EXCEEDED</span>
                            </div>
                            <div className="hud-progress">
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar"></div>
                                <div className="hud-progress-bar pulse"></div>
                                <div className="hud-progress-bar dim"></div>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>CRITICAL: H1 ALREADY EXCEEDING TOTAL 2024 AGGREGATE LOSSES. PROJECTED YEAR-END LOSS: $7.2B.</p>
                        </div>

                        {/* Attack Vector Breakdown */}
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 className="hud-label" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📊 Attack Vector Breakdown (H1)
                            </h4>

                            <div className="attack-vector">
                                <div className="attack-vector-header"><span>Governance & Logic Exploits</span><span style={{ color: '#fff' }}>59%</span></div>
                                <div className="attack-vector-track"><div className="attack-vector-fill" style={{ width: '59%' }}></div></div>
                            </div>
                            <div className="attack-vector">
                                <div className="attack-vector-header"><span>AI-Enhanced Phishing</span><span style={{ color: '#fff' }}>20%</span></div>
                                <div className="attack-vector-track"><div className="attack-vector-fill" style={{ width: '20%' }}></div></div>
                            </div>
                            <div className="attack-vector">
                                <div className="attack-vector-header"><span>Smart Contract Vulnerabilities</span><span style={{ color: '#fff' }}>8%</span></div>
                                <div className="attack-vector-track"><div className="attack-vector-fill" style={{ width: '8%' }}></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timeline & Trend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Timeline Panel */}
                        <div className="hud-panel" style={{ flexGrow: 1 }}>
                            <h4 className="hud-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⏱️ Crisis Evolution Timeline
                            </h4>

                            <div className="hud-timeline">
                                <div className="hud-timeline-item">
                                    <span className="hud-year">2020</span>
                                    <span className="hud-amount">$150M</span>
                                    <span className="hud-desc">Flash Loan Emergence</span>
                                </div>
                                <div className="hud-timeline-item">
                                    <span className="hud-year">2022</span>
                                    <span className="hud-amount">$800M+</span>
                                    <span className="hud-desc">Cross-Chain Bridge Vulnerabilities</span>
                                </div>
                                <div className="hud-timeline-item">
                                    <span className="hud-year">2024</span>
                                    <span className="hud-amount">$1.2B</span>
                                    <span className="hud-desc">Private Key Leak Explosion</span>
                                </div>
                                <div className="hud-timeline-item critical">
                                    <span className="hud-label" style={{ color: 'var(--neon-cyan)' }}>CRITICAL_2025</span>
                                    <span className="hud-amount">$3.1B (H1 ONLY)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '1rem' }}>🤖</span>
                                        <span className="hud-desc" style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>AI DOMINANCE ERA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Callout Trend */}
                        <div className="hud-panel">
                            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                                <h5 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                                    +1,025%<br />
                                    <span className="hud-label" style={{ color: 'var(--neon-cyan)' }}>AI-Driven Scam Surge</span>
                                </h5>
                                <button style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer' }}>
                                    View Full Analysis →
                                </button>
                            </div>
                            <svg className="surge-chart" viewBox="0 0 100 40">
                                <path d="M0 40 L10 35 L20 38 L30 25 L40 28 L50 15 L60 18 L70 5 L80 10 L90 2 L100 0" fill="none" stroke="var(--neon-cyan)" strokeLinecap="round" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 5px rgba(0,242,255,0.8))' }}></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="quote-stepper-container" style={{ marginTop: '2rem' }}>
                    <div className="cyber-quote slide-active">
                        "{quotes[quoteIndex].text}"
                        <cite>— {quotes[quoteIndex].author}</cite>
                    </div>
                    <div className="stepper-controls">
                        <button className="nav-btn" onClick={() => setQuoteIndex((prev) => (prev > 0 ? prev - 1 : quotes.length - 1))}>{"<"}</button>
                        <div className="stepper-dots">
                            {quotes.map((_, i) => (
                                <span key={i} className={`dot ${i === quoteIndex ? 'active' : ''}`} onClick={() => setQuoteIndex(i)}></span>
                            ))}
                        </div>
                        <button className="nav-btn" onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}>{">"}</button>
                    </div>
                </div>
            </section>

            <section className="landing-section solution highlight">
                <div className="cyber-panel solution-panel">
                    <h2>The Solution: RiskOracle</h2>
                    <div className="solution-content">
                        <div className="solution-text">
                            <p>
                                RiskOracle acts as an intelligent intermediary. By combining sub-millisecond
                                Rust-based decoding with DeepSeek's advanced AI, we analyze the semantic
                                intent of every transaction.
                            </p>
                            <p>
                                <strong>Chainlink CRE Integration:</strong> Our architecture utilizes Chainlink
                                Runtime Environment to ensure that the security analysis isn't just fast,
                                but <strong>verifiable</strong> and <strong>decentrally executed</strong>.
                            </p>
                        </div>
                        <div className="solution-graphic">
                            <div className="hex-shield">
                                <div className="shield-inner"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-section features">
                <h1 className="cyber-title" style={{ textAlign: 'center', marginTop: '4rem' }}>PRO <span style={{ color: '#fff' }}>FEATURES</span></h1>
                <div className="features-grid">
                    <div className="feature-card highlight-rust">
                        <div className="feature-header">
                            <span className="feature-icon">🦀</span>
                            <span className="tech-tag">RUST CORE</span>
                        </div>
                        <h3>Memory-Safe Analysis</h3>
                        <p>Built 100% in Rust for sub-millisecond decoding. Zero garbage collection ensures consistent, lightning-fast safety checks.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-header">
                            <span className="feature-icon">🧠</span>
                            <span className="tech-tag">DEEPSEEK AI</span>
                        </div>
                        <h3>Semantic Intent Detection (CRE & AI)</h3>
                        <p>Beyond simple hex decoding, our AI agent abstracts the blockchain logic to understand the "why" behind a transaction.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-header">
                            <span className="feature-icon">⛓️</span>
                            <span className="tech-tag">RISK & COMPLIANCE</span>
                        </div>
                        <h3>Decentralized Risk Verification</h3>
                        <p>Leveraging Chainlink CRE to provide automated, verifiable security consensus that doesn't rely on centralized servers.</p>
                    </div>
                </div>
            </section>

            <section className="landing-section roadmap">
                <h1 className="cyber-title" style={{ textAlign: 'center', marginTop: '4rem' }}>PROJECT <span style={{ color: '#fff' }}>ROADMAP</span></h1>
                <div className="roadmap-container">
                    <div className="roadmap-line"></div>
                    <div className="roadmap-item current">
                        <div className="roadmap-dot"></div>
                        <div className="roadmap-content">
                            <span className="phase-tag">PHASE 01 // Q1 2026 (MVP)</span>
                            <h3>Security Foundation & CRE</h3>
                            <p>Launch of Rust core decoder, DeepSeek AI integration, and core **Chainlink CRE** verifiable security for Arbitrum Sepolia.</p>
                        </div>
                    </div>
                    <div className="roadmap-item">
                        <div className="roadmap-dot"></div>
                        <div className="roadmap-content">
                            <span className="phase-tag">PHASE 02 // Q2 2026</span>
                            <h3>Intelligent Agents & MCP</h3>
                            <p>Deployment of specialized intelligent agents and **MCP (Model Context Protocol)** connections for cross-verified security validations.</p>
                        </div>
                    </div>
                    <div className="roadmap-item">
                        <div className="roadmap-dot"></div>
                        <div className="roadmap-content">
                            <span className="phase-tag">PHASE 03 // Q4 2026</span>
                            <h3>Global Security Hub</h3>
                            <p>Multi-chain support (Optimism, Base, ZK), B2B API release, and ecosystem-wide autonomous risk management.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-section team">
                <h1 className="cyber-title" style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.8rem', color: 'var(--text-muted)' }}>TEAM & <span style={{ color: 'var(--brand-blue)' }}>VIBECODERS</span></h1>
                <div className="team-grid">
                    <div className="team-card">
                        <div className="member-photo oscar" style={{ backgroundImage: `url(${oscarPhoto})` }}></div>
                        <h3>Oscar</h3>
                        <p className="role" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>Backend & IA</p>
                        <span className="vibe-tag">VIBECODER</span>
                    </div>
                    <div className="team-card">
                        <div className="member-photo jhon" style={{ backgroundImage: `url(${jhonPhoto})` }}></div>
                        <h3>Jhon</h3>
                        <p className="role" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>Front UX</p>
                        <span className="vibe-tag">VIBECODER</span>
                    </div>
                    <div className="team-card antigravity">
                        <div className="member-photo ai-logo">
                            <svg viewBox="0 0 100 100" className="antigravity-svg">
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#00ccff', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#0066ff', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="url(#grad1)" strokeWidth="4" />
                                <circle cx="50" cy="50" r="20" fill="white">
                                    <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
                                </circle>
                                <path d="M30 50 H70 M50 30 V70" stroke="url(#grad1)" strokeWidth="2" opacity="0.5" />
                            </svg>
                        </div>
                        <h3>Antigravity</h3>
                        <p className="role" style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>AI Core Assistant</p>
                        <span className="vibe-tag">INTELLIGENCE</span>
                    </div>
                </div>
            </section>

            <section className="landing-section monetization">
                <h1 className="cyber-title" style={{ textAlign: 'center', marginTop: '4rem' }}>BUSINESS <span style={{ color: '#fff' }}>LOGIC</span> & REVENUE</h1>
                <p className="cyber-text" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
                    RiskOracle is designed to scale from individual users to global financial institutions,
                    creating a sustainable ecosystem of security.
                </p>
                <div className="monetization-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    <div className="monetization-card">
                        <div className="monetization-icon">💳</div>
                        <h3>Freemium Security</h3>
                        <p>Free basic analysis for every user in the Arbitrum ecosystem. Premium deep-scan reports available for high-value transactions.</p>
                        <ul className="monetization-features">
                            <li>Instant Basic Risk Assessment</li>
                            <li>Community Driven Blacklists</li>
                        </ul>
                    </div>
                    <div className="monetization-card featured">
                        <div className="monetization-icon">🔌</div>
                        <h3>B2B API Licensing</h3>
                        <p>Direct integration into Wallets, Exchanges, and dApps (Metamask, Rabby, Uniswap). Charging a sub-cent fee per analysis call.</p>
                        <ul className="monetization-features">
                            <li>High Volume API Access</li>
                            <li>Real-time Fraud Alerts</li>
                        </ul>
                    </div>
                    <div className="monetization-card">
                        <div className="monetization-icon">🏛️</div>
                        <h3>Enterprise Solutions</h3>
                        <p>Custom security layers for DAO treasuries and institutional grade smart contracts with verifiable audit trails.</p>
                        <ul className="monetization-features">
                            <li>Verifiable CRE Reports</li>
                            <li>Multisig Security Layer</li>
                        </ul>
                    </div>
                    <div className="monetization-card">
                        <div className="monetization-icon">📊</div>
                        <h3>Risk Scoring-as-a-Service</h3>
                        <p>Expose transaction, wallet, and contract risk scores as a consumable service for DeFi protocols like Lending and Market Makers.</p>
                        <ul className="monetization-features">
                            <li>Per-query fee model</li>
                            <li>BFT-backed consensus scores</li>
                        </ul>
                    </div>
                    <div className="monetization-card">
                        <div className="monetization-icon">📦</div>
                        <h3>SDK for dApps (Lite)</h3>
                        <p>Lightweight SDK to allow dApps, Launchpads, and Bridges to check transaction risk before execution for their users.</p>
                        <ul className="monetization-features">
                            <li>Integration fee model</li>
                            <li>Native UI components included</li>
                        </ul>
                    </div>
                    <div className="monetization-card">
                        <div className="monetization-icon">📡</div>
                        <h3>Risk Feed API</h3>
                        <p>Offer real-time risk data through an API for contracts, wallets, and transactions targeted at defensive bots and DAOs.</p>
                        <ul className="monetization-features">
                            <li>Tiered API plans</li>
                            <li>High-throughput data stream</li>
                        </ul>
                    </div>

                </div>
            </section>

            <footer className="landing-footer">
                <button className="cyber-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    READY TO SECURE YOUR ASSETS?
                </button>
                <p className="cyber-text footer-note">BUILT FOR CHAINLINK CRE HACKATHON // 2026</p>
            </footer>
        </div>
    );
};

export default LandingPage;
