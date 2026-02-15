import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TransactionForm from './components/TransactionForm';
import RiskAnalysis from './components/RiskAnalysis';
import LandingPage from './components/LandingPage';
import { analyzeRisk } from './api';
import oscarPhoto from './assets/oscar.png';
import jhonPhoto from './assets/jhon.jpg';

function MainAnalyzer({ handleAnalyze, loading, analysisData }) {
  return (
    <>
      <main>
        <TransactionForm onSubmit={handleAnalyze} loading={loading} />
        {analysisData && <RiskAnalysis data={analysisData} />}
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <Link to="/about" className="know-more-btn">WANT TO KNOW MORE ABOUT THE PROJECT?</Link>
        <p className="cyber-text" style={{ opacity: 0.5, fontSize: '0.8rem' }}>SECURE // DECENTRALIZE // VERIFY</p>
      </footer>
    </>
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (address, callData) => {
    setLoading(true);
    setAnalysisData(null);
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
        <header style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '2rem' }}>
          <h1 className="cyber-title glitch-hover" style={{ fontSize: '3rem', margin: 0, cursor: 'pointer' }}>
            Risk<span style={{ color: '#fff' }}>Oracle</span>
          </h1>
          <p className="cyber-text" style={{ color: 'var(--neon-cyan)', marginTop: '0.5rem' }}>
            Arbitrum Sepolia Transaction Analyzer
          </p>
        </header>

        <main className="page-fade-enter-active">
          <Routes>
            <Route path="/" element={<MainAnalyzer handleAnalyze={handleAnalyze} loading={loading} analysisData={analysisData} />} />
            <Route path="/about" element={<LandingPage oscarPhoto={oscarPhoto} jhonPhoto={jhonPhoto} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
