import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TransactionForm from './components/TransactionForm';
import RiskAnalysis from './components/RiskAnalysis';
import ChainlinkVerification from './components/ChainlinkVerification';
import LandingPage from './components/LandingPage';
import { analyzeRisk } from './api';
import oscarPhoto from './assets/oscar.png';
import jhonPhoto from './assets/jhon.jpg';

function MainAnalyzer({ handleAnalyze, loading, analysisData, lastAddress, lastCallData }) {
  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 className="cyber-title" style={{ fontSize: '3rem', margin: 0 }}>
          Risk<span style={{ color: '#fff' }}>Oracle</span>
        </h1>
        <p className="cyber-text" style={{ color: 'var(--brand-electric)', marginTop: '0.5rem' }}>
          Arbitrum Sepolia Transaction Analyzer
        </p>
        <Link to="/about" className="know-more-btn">Want to Know more?</Link>
      </header>

      <main>
        <TransactionForm onSubmit={handleAnalyze} loading={loading} />
        {analysisData && <RiskAnalysis data={analysisData} />}
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

      <footer style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        <p className="cyber-text">SECURE // DECENTRALIZE // VERIFY</p>
      </footer>
    </>
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAddress, setLastAddress] = useState('');
  const [lastCallData, setLastCallData] = useState('');

  const handleAnalyze = async (address, callData) => {
    setLoading(true);
    setAnalysisData(null);
    setLastAddress(address);
    setLastCallData(callData);
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
        <Routes>
          <Route path="/" element={
            <MainAnalyzer
              handleAnalyze={handleAnalyze}
              loading={loading}
              analysisData={analysisData}
              lastAddress={lastAddress}
              lastCallData={lastCallData}
            />
          } />
          <Route path="/about" element={<LandingPage oscarPhoto={oscarPhoto} jhonPhoto={jhonPhoto} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
