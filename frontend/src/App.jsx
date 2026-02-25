import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TransactionForm from './components/TransactionForm';
import RiskAnalysis from './components/RiskAnalysis';
import ChainlinkVerification from './components/ChainlinkVerification';
import LandingPage from './components/LandingPage';
import { analyzeRisk } from './api';
import oscarPhoto from './assets/oscar.png';
import jhonPhoto from './assets/jhon.jpg';
import riskOracleLogo from './assets/logo.svg';
import chainlinkLogo from './assets/Chainlink_Logo_Blue.svg.png';
import worldcoinLogo from './assets/safari-pinned-tab.svg';

function MainAnalyzer({ handleAnalyze, loading, analysisData, lastAddress, lastCallData, userName }) {
  return (
    <>
      <main style={{ marginTop: '2rem' }}>
        <TransactionForm onSubmit={handleAnalyze} loading={loading} />
        {analysisData && <RiskAnalysis data={analysisData} userName={userName} />}
        {analysisData && analysisData.status === 'success' ? (
          <ChainlinkVerification
            contractAddress={lastAddress}
            callData={lastCallData}
            initialRiskLevel={analysisData.risk_level}
            disabled={false}
          />
        ) : (
          <ChainlinkVerification disabled={true} />
        )}
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <p className="cyber-text" style={{ opacity: 0.5, fontSize: '0.8rem', letterSpacing: '2px' }}>SECURE // DECENTRALIZE // VERIFY</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', opacity: 0.7, marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="cyber-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>POWERED BY</span>
            <img src={chainlinkLogo} alt="Chainlink" style={{ height: '20px', filter: 'drop-shadow(0 0 2px var(--brand-electric))' }} />
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="cyber-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VERIFIED VIA</span>
            <img src={worldcoinLogo} alt="Worldcoin" style={{ height: '18px', filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))' }} />
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAddress, setLastAddress] = useState('');
  const [lastCallData, setLastCallData] = useState('');
  const [userName, setUserName] = useState(''); // Dynamic user name from World ID

  const handleAnalyze = async (address, callData, verificationResult) => {
    setLoading(true);
    setAnalysisData(null);
    setLastAddress(address);
    setLastCallData(callData);

    // Set dynamic name based on World ID nullifier hash for uniqueness
    if (verificationResult && verificationResult.nullifier_hash) {
      const shortHash = verificationResult.nullifier_hash.slice(-4).toUpperCase();
      setUserName(`Human-${shortHash}`);
    } else {
      setUserName('Verified');
    }
    try {
      const result = await analyzeRisk(address, callData);
      setAnalysisData(result);
    } catch (error) {
      console.error(error);
      setAnalysisData({ status: 'error', message: 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <header style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link to="/">
            <img
              src={riskOracleLogo}
              alt="RiskOracle"
              style={{
                height: '64px',
                width: 'auto',
                filter: 'drop-shadow(0 0 4px #00BFFF) drop-shadow(0 0 10px #0088cc)',
                cursor: 'pointer'
              }}
            />
          </Link>
          <p className="cyber-text" style={{ color: 'var(--neon-cyan)', marginTop: '0.75rem', opacity: 0.8 }}>
            Arbitrum Sepolia Transaction Analyzer
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/about" className="know-more-btn">WANT TO KNOW MORE ABOUT THE PROJECT?</Link>
            <a href="/riskoracle-extension.zip" download className="know-more-btn" style={{ backgroundColor: 'rgba(0,255,204,0.1)', borderColor: '#00ffcc', color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              DOWNLOAD GUARDIAN PLUGIN
            </a>
          </div>
        </header>

        <main className="page-fade-enter-active">
          <Routes>
            <Route path="/" element={
              <MainAnalyzer
                handleAnalyze={handleAnalyze}
                loading={loading}
                analysisData={analysisData}
                lastAddress={lastAddress}
                lastCallData={lastCallData}
                userName={userName}
              />
            } />
            <Route path="/about" element={<LandingPage oscarPhoto={oscarPhoto} jhonPhoto={jhonPhoto} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
