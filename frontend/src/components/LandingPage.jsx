import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ oscarPhoto, jhonPhoto }) => {
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

            <section className="landing-section stats">
                <div className="cyber-panel">
                    <h2>The Growing Threat</h2>
                    <p className="subtitle">Crypto phishing and hacks are on the rise.</p>
                    <div className="charts-container">
                        <div className="chart-item">
                            <div className="bar-chart">
                                <div className="bar" style={{ height: '40%' }} data-label="2022"></div>
                                <div className="bar" style={{ height: '70%' }} data-label="2023"></div>
                                <div className="bar active" style={{ height: '95%' }} data-label="2024"></div>
                            </div>
                            <h3>Phishing Volume (EST)</h3>
                        </div>
                        <div className="chart-item info-cards">
                            <div className="info-card">
                                <span className="value">$1.8B+</span>
                                <span className="label">Lost to Hacks in 2024</span>
                            </div>
                            <div className="info-card highlight">
                                <span className="value">84%</span>
                                <span className="label">Start with 'Approve' Phishing</span>
                            </div>
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
                            <h3>Advanced AI & Optimization</h3>
                            <p>Multi-agent risk scoring, enhanced semantic patterns, and high-throughput optimization for mainnet readiness.</p>
                        </div>
                    </div>
                    <div className="roadmap-item">
                        <div className="roadmap-dot"></div>
                        <div className="roadmap-content">
                            <span className="phase-tag">PHASE 03 // Q4 2026</span>
                            <h3>Global Security Hub</h3>
                            <p>Multi-chain support (Optimism, Base, ZK), B2B API release, and institutional security dashboard.</p>
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
                <div className="monetization-grid">
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
