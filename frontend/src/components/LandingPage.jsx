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
                <h1 className="cyber-title">THE <span style={{ color: '#fff' }}>ORACLE'S</span> VISION</h1>
                <p className="cyber-text accent">Securing the future of Web3, one transaction at a time.</p>
            </header>

            <section className="landing-section purpose">
                <div className="cyber-panel">
                    <h2>Our Purpose</h2>
                    <p>
                        In the rapidly evolving world of decentralized finance, uncertainty is the enemy.
                        Users are often forced to sign transactions that they don't fully understand,
                        leading to catastrophic losses from phishing, malicious contracts, and hidden drains.
                    </p>
                    <div className="purpose-grid">
                        <div className="purpose-item">
                            <span className="icon">🛡️</span>
                            <h3>Prevent</h3>
                            <p>Identify risks before you sign.</p>
                        </div>
                        <div className="purpose-item">
                            <span className="icon">🔍</span>
                            <h3>Clarify</h3>
                            <p>Decode complex hex data into human logic.</p>
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
                <div className="cyber-panel">
                    <h2 className="cyber-text" style={{ textAlign: 'center', color: 'var(--neon-red)' }}>
                        &gt; GLOBAL ALERT: 2025 SECURITY CRISIS
                    </h2>
                    <div className="shock-number" style={{ textAlign: 'center' }}>$3,100,000,000</div>
                    <p className="cyber-text" style={{ textAlign: 'center', opacity: 0.7, marginBottom: '4rem', fontSize: '0.9rem' }}>
                        VALUE STOLEN IN H1 2025 ALONE (EXCEEDING ALL 2024)
                    </p>

                    <div className="market-chart-container">
                        <div className="chart-box">
                            <h3 className="cyber-text" style={{ fontSize: '0.9rem', marginBottom: '2.5rem' }}>// 2025 ATTACK VECTORS (H1)</h3>
                            <svg width="200" height="200" viewBox="0 0 100 100" className="chart-svg" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="12"
                                    strokeDasharray="148.2 251.2" className="path-animate segment-exploits" />
                                <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="12"
                                    strokeDasharray="50.2 251.2" className="path-animate segment-phishing" />
                                <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="12"
                                    strokeDasharray="20.1 251.2" className="path-animate segment-logic" />
                                <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="12"
                                    strokeDasharray="32.7 251.2" className="path-animate segment-ai" />
                            </svg>
                            <div className="chart-legend" style={{ marginTop: '2.5rem', fontSize: '0.8rem', textAlign: 'left', display: 'inline-block' }}>
                                <p><span style={{ color: 'var(--neon-cyan)' }}>●</span> EXPLOITS: 59%</p>
                                <p><span style={{ color: 'var(--neon-red)' }}>●</span> PHISHING: 20%</p>
                                <p><span style={{ color: 'var(--neon-purple)' }}>●</span> CONTRACT HACKS: 8%</p>
                                <p><span style={{ color: 'var(--neon-pink)' }}>●</span> OTHERS: 13%</p>
                            </div>
                        </div>

                        <div className="chart-box">
                            <h3 className="cyber-text" style={{ fontSize: '0.9rem', marginBottom: '3rem' }}>// AI-DRIVEN SCAM SURGE</h3>
                            <div style={{ marginBottom: '2rem' }}>
                                <div className="shock-number" style={{ fontSize: '3rem', color: 'var(--neon-pink)' }}>+1,025%</div>
                                <p className="cyber-text" style={{ fontSize: '0.7rem', opacity: 0.6 }}>INCREASE IN AI-AIDED SCAMS SINCE 2023</p>
                            </div>
                            <svg width="220" height="100" viewBox="0 0 200 100" className="chart-svg">
                                <polyline fill="none" stroke="var(--neon-pink)" strokeWidth="3"
                                    points="0,95 30,90 60,80 90,60 120,50 150,20 200,5" className="path-animate" />
                                {[0, 30, 60, 90, 120, 150, 200].map((x, i) => (
                                    <circle key={i} cx={x} cy={[95, 90, 80, 60, 50, 20, 5][i]} r="3" fill="var(--neon-pink)" />
                                ))}
                            </svg>
                        </div>
                    </div>

                    <div className="quote-stepper-container">
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

                    <div className="orbital-timeline-container" ref={timelineRef}>
                        <h3 className="cyber-text" style={{ color: 'var(--brand-blue)', marginBottom: '3rem', textAlign: 'center' }}>// CRISIS EVOLUTION</h3>
                        <div className={`orbital-view ${timelineVisible ? 'animate-in' : ''}`}>
                            <svg width="800" height="600" viewBox="0 0 800 600" className="orbital-svg">
                                <path d="M 750 20 Q 200 300 750 580" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" className="orbital-path-bg" />
                                {timelineVisible && (
                                    <path d="M 750 20 Q 200 300 750 580" fill="transparent" stroke="var(--brand-blue)" strokeWidth="3" className="orbital-path-draw" />
                                )}

                                {timelineEvents.map((event, i) => {
                                    const orbitalCoords = [
                                        { x: 680, y: 100 },
                                        { x: 480, y: 250 },
                                        { x: 480, y: 400 },
                                        { x: 680, y: 550 }
                                    ][i];

                                    return (
                                        <g key={i} className="timeline-node" style={{ transitionDelay: `${0.5 + i * 0.7}s` }}>
                                            <circle cx={orbitalCoords.x} cy={orbitalCoords.y} r="8" fill={event.highlight ? 'var(--neon-red)' : 'var(--brand-blue)'} className="node-point" />
                                            <foreignObject x={orbitalCoords.x - 330} y={orbitalCoords.y - 45} width="310" height="120">
                                                <div className="event-detail-card">
                                                    <span className="event-year">{event.year}</span>
                                                    <h4 className="event-title">{event.title}</h4>
                                                    <p className="event-desc">{event.desc}</p>
                                                </div>
                                            </foreignObject>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
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
                        <h3>Semantic Intent Detection</h3>
                        <p>Beyond simple hex decoding, our AI understands the "why" behind a transaction, flagging malicious logic in real-time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-header">
                            <span className="feature-icon">🔗</span>
                            <span className="tech-tag">CHAINLINK CRE</span>
                        </div>
                        <h3>Decentralized Verification</h3>
                        <p>Leveraging Chainlink Runtime Environment to provide a verifiable security layer that doesn't rely on centralized servers.</p>
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
                    <div className="monetization-card">
                        <div className="monetization-icon">🏅</div>
                        <h3>Security Certification</h3>
                        <p>Provide monitoring and risk assessment certification for new DeFi projects and Treasury Managers.</p>
                        <ul className="monetization-features">
                            <li>"Monitored by RiskOracle" badge</li>
                            <li>Monthly monitoring subscription</li>
                        </ul>
                    </div>
                    <div className="monetization-card">
                        <div className="monetization-icon">🗳️</div>
                        <h3>DAO Proposal Reports</h3>
                        <p>Analyze smart contracts and upgrades proposed in DAO governance processes to protect voters and funds.</p>
                        <ul className="monetization-features">
                            <li>Per-proposal analysis fee</li>
                            <li>Governance safety dashboard</li>
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
