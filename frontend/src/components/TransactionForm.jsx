import React, { useState, useEffect } from 'react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import worldcoinLogo from '../assets/safari-pinned-tab.svg';

export default function TransactionForm({ onSubmit, loading }) {
    const [address, setAddress] = useState('');
    const [callData, setCallData] = useState('');
    const [bannerIndex, setBannerIndex] = useState(0);

    const banners = [
        { label: "SECURITY TIP", text: "Always verify the contract address on Arbiscan before interacting." },
        { label: "VIBECODERS", text: "Looking for a specialized Web3 development team? Contact us." },
        { label: "PRO FEATURE", text: "Try our new Chainlink CRE verifiable reports for high-value transactions." },
        { label: "NOTICE", text: "DeepSeek AI model is currently processing at high capacity." },
        { label: "SECURITY TIP", text: "Never share your private keys or seed phrase with anyone." },
        { label: "TIP", text: "Use hardware wallets for managing high-value assets." }
    ];

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setBannerIndex((prev) => (prev + 1) % banners.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [loading, banners.length]);

    const handleNextBanner = () => {
        setBannerIndex((prev) => (prev + 1) % banners.length);
    };

    const handlePrevBanner = () => {
        setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const currentBanner = banners[bannerIndex];

    const handleVerifySuccess = (result) => {
        // ZK-Proof received. For hackathon frontend-only mode, we allow analysis.
        if (address && callData) {
            onSubmit(address, callData, result);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Disabled direct submit since Worldcoin handles it now.
    };

    return (
        <form onSubmit={handleSubmit} className="cyber-panel" style={{ marginTop: '2rem' }}>
            <h2 className="cyber-text" style={{ color: '#fff', marginBottom: '1.5rem', fontWeight: 700 }}>
                Transaction Analysis
            </h2>

            <div style={{ marginBottom: '1rem' }}>
                <label className="cyber-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
                    Contract Address
                </label>
                <input
                    type="text"
                    className="cyber-input"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label className="cyber-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
                    Call Data
                </label>
                <textarea
                    className="cyber-input"
                    rows="4"
                    placeholder="0x..."
                    value={callData}
                    onChange={(e) => setCallData(e.target.value)}
                    disabled={loading}
                    style={{ resize: 'vertical' }}
                />
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={worldcoinLogo} alt="Worldcoin" style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} />
                <span className="cyber-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    World ID Verification is <strong style={{ color: 'var(--neon-green)' }}>required</strong> for risk analysis
                </span>
            </div>

            <IDKitWidget
                app_id="app_313c05c45f23d36337513238c91b3d23"
                action="risk-scan"
                onSuccess={handleVerifySuccess}
                verification_level={VerificationLevel.Device}
            >
                {({ open }) => (
                    <button
                        type="button"
                        className="cyber-button glitch-hover"
                        disabled={loading}
                        style={{ width: '100%', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={(e) => {
                            e.preventDefault();
                            if (address && callData) {
                                open();
                            } else {
                                alert("Please enter both Contract Address and Call Data.");
                            }
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="cyber-spinner"></span>
                                <span>ANALYZING...</span>
                            </div>
                        ) : (
                            <>
                                <img src={worldcoinLogo} alt="" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
                                <span>VERIFY & ANALYZE RISK</span>
                            </>
                        )}
                    </button>
                )}
            </IDKitWidget>

            {loading && (
                <>
                    <div className="info-banner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                            <span className="banner-label">{currentBanner.label}</span>
                            <span className="banner-text">{currentBanner.text}</span>
                        </div>
                        <div className="banner-nav">
                            <button type="button" onClick={handlePrevBanner} className="nav-btn">{"<"}</button>
                            <button type="button" onClick={handleNextBanner} className="nav-btn">{">"}</button>
                        </div>
                    </div>
                    <div className="oracle-terminal">
                        <div className="terminal-line" style={{ animationDelay: '0.1s' }}>&gt; INITIALIZING RUST_DECODER...</div>
                        <div className="terminal-line" style={{ animationDelay: '0.4s' }}>&gt; CONNECTING TO CHAINLINK CRE... [OK]</div>
                        <div className="terminal-line" style={{ animationDelay: '0.8s' }}>&gt; DEEPSEEK CORE: SCANNING INTENT...</div>
                        <div className="terminal-line" style={{ animationDelay: '1.2s' }}>&gt; DECODING HEX DATA...</div>
                        <div className="scanning-bar"></div>
                        <div className="terminal-cursor"></div>
                    </div>
                </>
            )}
        </form>
    );
}
