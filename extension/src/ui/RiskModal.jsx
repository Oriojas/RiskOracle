import React, { useState, useEffect } from 'react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { ShieldAlert, ShieldCheck, Activity, BrainCircuit, XCircle, FileWarning } from 'lucide-react';

const RiskModal = ({ params, onDecision }) => {
    const [worldIdVerified, setWorldIdVerified] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [chainlinkResult, setChainlinkResult] = useState(null);
    const [chainlinkLoading, setChainlinkLoading] = useState(false);

    const tx = params && params.length ? params[0] : {};
    const contractAddress = tx.to || "Unknown";
    const callData = tx.data || "0x";

    const runAnalysis = () => {
        setAnalyzing(true);
        fetch('http://localhost:8080/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contract_address: contractAddress, call_data: callData })
        })
            .then(res => res.json())
            .then(data => {
                setAnalysisResult(data);
                setAnalyzing(false);
            })
            .catch(err => {
                console.error(err);
                setAnalysisResult({ status: 'error', message: 'Failed to reach RiskOracle backend.' });
                setAnalyzing(false);
            });
    };

    const runChainlinkAudit = () => {
        setChainlinkLoading(true);
        fetch('http://localhost:8080/chainlink-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contract_address: contractAddress, call_data: callData })
        })
            .then(res => res.json())
            .then(data => {
                setChainlinkResult(data);
                setChainlinkLoading(false);
            })
            .catch(err => {
                console.error(err);
                setChainlinkResult({ status: 'error', message: 'Failed to reach Chainlink DON.' });
                setChainlinkLoading(false);
            });
    };

    const handleVerify = (proof) => {
        console.log("WorldID proof:", proof);
        setWorldIdVerified(true);
    };

    const isHighRisk = analysisResult?.risk_level && (analysisResult.risk_level.toLowerCase().includes('high') || analysisResult.risk_level.toLowerCase().includes('critical') || analysisResult.risk_level.toLowerCase().includes('alto'));
    const isMediumRisk = analysisResult?.risk_level && (analysisResult.risk_level.toLowerCase().includes('medium') || analysisResult.risk_level.toLowerCase().includes('medio'));

    // Inline CSS for the Landing Page Aesthetic (Dark Slate & Neon Green)
    const styles = {
        overlay: {
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: '#0f172a', /* slate-900 */
            border: `1px solid ${isHighRisk ? '#ff3366' : 'rgba(0, 255, 204, 0.3)'}`,
            borderRadius: '16px',
            width: '450px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            color: '#f8fafc',
            boxShadow: `0 0 40px ${isHighRisk ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0, 255, 204, 0.1)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '16px'
        },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' },
        subtitle: { margin: 0, fontSize: '12px', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
        txBox: {
            backgroundColor: '#020617', /* slate-950 */
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '13px',
            wordBreak: 'break-all',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: '#94a3b8'
        },
        sectionTitle: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#64748b', margin: '0 0 10px 0' },
        badge: {
            padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
            backgroundColor: isHighRisk ? 'rgba(255,51,102,0.1)' : isMediumRisk ? 'rgba(255,170,0,0.1)' : 'rgba(0,255,204,0.1)',
            color: isHighRisk ? '#ff3366' : isMediumRisk ? '#ffaa00' : '#00ffcc',
            border: `1px solid ${isHighRisk ? 'rgba(255,51,102,0.3)' : isMediumRisk ? 'rgba(255,170,0,0.3)' : 'rgba(0,255,204,0.3)'}`,
            boxShadow: `0 0 15px ${isHighRisk ? 'rgba(255,51,102,0.2)' : isMediumRisk ? 'rgba(255,170,0,0.2)' : 'rgba(0,255,204,0.2)'}`
        },
        btnPrimary: {
            backgroundColor: '#00ffcc', color: '#020617', border: 'none', padding: '14px',
            borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
            flex: 1, opacity: worldIdVerified ? 1 : 0.5,
            boxShadow: worldIdVerified ? '0 0 20px rgba(0, 255, 204, 0.4)' : 'none'
        },
        btnReject: {
            backgroundColor: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', border: '1px solid rgba(255, 51, 102, 0.4)',
            padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
            transition: 'all 0.2s', flex: 1
        },
        chainlinkBox: {
            border: '1px solid rgba(55, 91, 210, 0.5)', backgroundColor: 'rgba(55, 91, 210, 0.1)',
            padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px',
            boxShadow: 'inset 0 0 20px rgba(55, 91, 210, 0.05)'
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}><ShieldAlert size={20} color={isHighRisk ? "#ff3366" : "#00ffcc"} /> RiskOracle Guardian</h2>
                    <p style={styles.subtitle}>Transaction Intercepted</p>
                </div>
            </div>

            <div>
                <h3 style={styles.sectionTitle}>Target Contract</h3>
                <div style={styles.txBox}>
                    {contractAddress}
                </div>
            </div>

            <div>
                <h3 style={styles.sectionTitle}>Backend Analysis</h3>
                {!analyzing && !analysisResult ? (
                    <button
                        style={{ ...styles.btnPrimary, width: '100%', marginTop: '8px', opacity: worldIdVerified ? 1 : 0.5 }}
                        onClick={runAnalysis}
                        disabled={!worldIdVerified}
                        title={!worldIdVerified ? "Please verify with World ID first" : "Run Analysis"}
                    >
                        Run Risk Analysis
                    </button>
                ) : analyzing ? (
                    <div style={{ ...styles.txBox, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity className="animate-pulse" size={16} /> Analyzing signature & bytecode...
                    </div>
                ) : analysisResult?.status === 'error' ? (
                    <div style={{ ...styles.txBox, color: '#ff3366' }}>Failed to analyze contract.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>Risk Level:</span>
                            <span style={styles.badge}>{analysisResult?.risk_level || 'UNKNOWN'}</span>
                        </div>
                        <div style={{ ...styles.txBox, fontSize: '12px', color: '#cbd5e1' }}>
                            {analysisResult?.explanation || 'No detailed explanation provided.'}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <h3 style={styles.sectionTitle}>Chainlink DON Verification</h3>
                {!chainlinkLoading && !chainlinkResult ? (
                    <button
                        style={{ ...styles.btnPrimary, width: '100%', marginTop: '8px', backgroundColor: '#375bd2', color: '#fff', opacity: worldIdVerified && analysisResult ? 1 : 0.5, boxShadow: (worldIdVerified && analysisResult) ? '0 0 20px rgba(55, 91, 210, 0.4)' : 'none' }}
                        onClick={runChainlinkAudit}
                        disabled={!worldIdVerified || !analysisResult}
                        title={!worldIdVerified ? "Please verify with World ID first" : !analysisResult ? "Please run Backend Analysis first" : "Run Chainlink DON"}
                    >
                        Run Chainlink DON
                    </button>
                ) : chainlinkLoading ? (
                    <div style={{ ...styles.txBox, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BrainCircuit className="animate-pulse" size={16} color="#375bd2" /> Reaching Consensus...
                    </div>
                ) : chainlinkResult?.status === 'error' ? (
                    <div style={{ ...styles.txBox, color: '#ff3366' }}>
                        Failed to verify via Chainlink DON.
                        <br />
                        <span style={{ fontSize: '10px', color: '#cbd5e1' }}>Note: Ensure cre.exe is not blocked by antivirus.</span>
                    </div>
                ) : (
                    <div style={styles.chainlinkBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} color="#375bd2" /> DON Consensus</span>
                            <span style={{ ...styles.badge, borderColor: '#375bd2', color: '#375bd2', backgroundColor: 'transparent' }}>
                                {chainlinkResult?.risk_level || 'VERIFIED'}
                            </span>
                        </div>
                        {chainlinkResult?.verification_hash && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Hash: {chainlinkResult.verification_hash.slice(0, 16)}...
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <h3 style={styles.sectionTitle}>Human Verification</h3>
                {worldIdVerified ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ffcc', fontSize: '14px' }}>
                        <ShieldCheck size={18} /> Humanity Verified
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                        <IDKitWidget
                            app_id="app_313c05c45f23d36337513238c91b3d23"
                            action="risk-scan"
                            onSuccess={handleVerify}
                            verification_level={VerificationLevel.Device}
                        >
                            {({ open }) => (
                                <button onClick={open} style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Verify with World ID
                                </button>
                            )}
                        </IDKitWidget>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                    style={styles.btnPrimary}
                    onClick={() => onDecision(true)}
                >
                    Close Guardian
                </button>
            </div>
        </div>
    );
};

export default RiskModal;
