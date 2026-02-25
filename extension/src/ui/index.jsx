import React from 'react';
import { createRoot } from 'react-dom/client';
import RiskModal from './RiskModal';

const urlParams = new URLSearchParams(window.location.search);
const txId = urlParams.get('txId');

if (txId) {
    // Transaction Mode
    chrome.runtime.sendMessage({ type: 'GET_PENDING_TX', txId }, (response) => {
        if (response && response.params) {
            const handleDecision = (approved) => {
                chrome.runtime.sendMessage({ type: 'TX_DECISION', txId, approved });
                window.close(); // Force close the popup so user can see wallet
            };

            const root = createRoot(document.getElementById('root'));
            root.render(
                <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#020617' }}>
                    <RiskModal params={response.params} onDecision={handleDecision} />
                </div>
            );
        } else {
            document.getElementById('root').innerHTML = "<div style='color: white; text-align: center; padding: 2rem; background-color: #020617; height: 100vh;'><h3 style='color: white;'>Transaction expired or not found.</h3></div>";
        }
    });
} else {
    // Default Popup Mode
    const DefaultPopup = () => {
        const [enabled, setEnabled] = React.useState(true);

        React.useEffect(() => {
            chrome.storage.local.get(['guardianEnabled'], (result) => {
                if (result.guardianEnabled !== undefined) {
                    setEnabled(result.guardianEnabled);
                }
            });
        }, []);

        const toggleGuardian = () => {
            const newState = !enabled;
            setEnabled(newState);
            chrome.storage.local.set({ guardianEnabled: newState });
        };

        return (
            <div style={{ padding: '1.5rem', width: '300px', textAlign: 'center', backgroundColor: '#020617', color: '#e2e8f0', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#00ffcc', margin: '0 0 1rem 0', fontFamily: 'system-ui' }}>RiskOracle Guardian</h2>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>Your Web3 transactions are actively protected.</p>

                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 255, 204, 0.2)', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: enabled ? '#00ffcc' : '#94a3b8' }}>{enabled ? 'Active' : 'Paused'}</span>
                        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={toggleGuardian}
                                style={{ display: 'none' }}
                            />
                            <div style={{
                                width: '48px', height: '24px',
                                backgroundColor: enabled ? 'rgba(0, 255, 204, 0.2)' : '#334155',
                                borderRadius: '12px', position: 'relative',
                                transition: '0.3s',
                                border: `1px solid ${enabled ? '#00ffcc' : '#475569'}`
                            }}>
                                <div style={{
                                    width: '18px', height: '18px',
                                    backgroundColor: enabled ? '#00ffcc' : '#94a3b8',
                                    borderRadius: '50%', position: 'absolute',
                                    top: '2px', left: enabled ? '26px' : '2px',
                                    transition: '0.3s',
                                    boxShadow: enabled ? '0 0 10px rgba(0, 255, 204, 0.5)' : 'none'
                                }}></div>
                            </div>
                        </label>
                    </div>
                    <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                        {enabled ? 'Intercepting risky transactions.' : 'Interception is currently disabled.'}
                    </p>
                </div>
            </div>
        );
    };

    const root = createRoot(document.getElementById('root'));
    root.render(<DefaultPopup />);
}
