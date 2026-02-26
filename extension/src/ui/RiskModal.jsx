import { useState } from 'react'
import { Shield, ShieldAlert, CheckCircle2, Activity, Zap, XCircle, AlertTriangle, ChevronRight, Lock } from 'lucide-react'
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import riskOracleLogo from '../assets/RiskOracle.png'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

const RISK_STYLES = {
    Critical: { border: 'border-red-800/60', bg: 'bg-red-950/40', text: 'text-red-400', label: '🔴 CRITICAL' },
    High: { border: 'border-orange-800/60', bg: 'bg-orange-950/40', text: 'text-orange-400', label: '🟠 HIGH' },
    Medium: { border: 'border-yellow-800/60', bg: 'bg-yellow-950/40', text: 'text-yellow-400', label: '🟡 MEDIUM' },
    Low: { border: 'border-green-800/60', bg: 'bg-green-950/40', text: 'text-green-400', label: '🟢 LOW' },
}

function getRiskStyle(level) {
    if (!level) return RISK_STYLES.Medium
    const key = Object.keys(RISK_STYLES).find(k => k.toLowerCase() === level.toLowerCase())
    return RISK_STYLES[key] || RISK_STYLES.Medium
}

export default function RiskModal({ payload }) {
    // --- Estado secuencial de las 3 fases ---
    const [worldIdDone, setWorldIdDone] = useState(false)
    const [phase2Status, setPhase2Status] = useState('idle')   // idle | loading | done | error
    const [analysisResult, setAnalysisResult] = useState(null)
    const [phase3Status, setPhase3Status] = useState('idle')   // idle | loading | done | error
    const [creResult, setCreResult] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)

    // Extraer datos de la transacción interceptada
    // payload viene de eth_sendTransaction: { method, params: [{ to, data, from, value, gas }] }
    const txParams = payload?.params?.[0] || {}
    const contractAddress = txParams.to || ''
    const callData = txParams.data || txParams.input || '0x'

    const handleVerify = (result) => {
        console.log('✅ [RiskOracle] World ID OK:', result)
        setWorldIdDone(true)
    }

    // === Fase 2: Análisis semántico (Rust + DeepSeek) ===
    const runSemanticAnalysis = async () => {
        setPhase2Status('loading')
        setErrorMsg(null)
        try {
            const res = await fetch(`${BACKEND_URL}/analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contract_address: contractAddress, call_data: callData }),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || `HTTP ${res.status}`)
            }
            const data = await res.json()
            console.log('📊 [RiskOracle] Analysis result:', data)
            setAnalysisResult(data)
            setPhase2Status('done')
        } catch (e) {
            console.error('❌ [RiskOracle] Analysis error:', e.message)
            setErrorMsg(e.message)
            setPhase2Status('error')
        }
    }

    // === Fase 3: Auditoría Chainlink CRE (solo si el usuario lo autoriza) ===
    const runCreAudit = async () => {
        setPhase3Status('loading')
        try {
            const res = await fetch(`${BACKEND_URL}/chainlink-audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contract_address: contractAddress, call_data: callData }),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || `HTTP ${res.status}`)
            }
            const data = await res.json()
            console.log('🔗 [RiskOracle] CRE result:', data)
            setCreResult(data)
            setPhase3Status('done')
        } catch (e) {
            console.error('❌ [RiskOracle] CRE error:', e.message)
            setErrorMsg(e.message)
            setPhase3Status('error')
        }
    }

    const riskStyle = getRiskStyle(analysisResult?.risk_level)

    return (
        <div
            style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}
            className="flex flex-col bg-slate-950 text-slate-100 p-4"
        >

            {/* ── Header ── */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <img src={riskOracleLogo} alt="RiskOracle Logo" style={{ height: '24px', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.7))' }} />
                <h1 className="text-xl font-bold tracking-tight">
                    RiskOracle <span className="text-cyan-400 font-light">Guardian</span>
                </h1>
            </div>

            <div className="flex-1 flex flex-col gap-4">

                {/* ── Transacción interceptada ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Intercepted Transaction
                    </h2>
                    <div className="space-y-1 font-mono text-xs">
                        <div className="flex gap-2 items-start">
                            <span className="text-slate-500 shrink-0 w-16">Contract</span>
                            <span className="text-pink-300 break-all">{contractAddress || '—'}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="text-slate-500 shrink-0 w-16">Data</span>
                            <span className="text-pink-300 break-all">{callData?.slice(0, 50)}…</span>
                        </div>
                        {txParams.value && txParams.value !== '0x0' && (
                            <div className="flex gap-2">
                                <span className="text-slate-500 shrink-0 w-16">Value</span>
                                <span className="text-pink-300">{parseInt(txParams.value, 16)} wei</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Fase 1: World ID ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Phase 1 · Human Identity (World ID)
                    </h2>
                    {!worldIdDone ? (
                        <IDKitWidget
                            app_id={import.meta.env.VITE_WORLDCOIN_APP_ID}
                            action={import.meta.env.VITE_WORLDCOIN_ACTION || 'risk-scan'}
                            onSuccess={handleVerify}
                            verification_level={VerificationLevel.Device}
                        >
                            {({ open }) => (
                                <button
                                    onClick={open}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors border border-slate-700"
                                >
                                    <Activity className="w-4 h-4 text-cyan-400" />
                                    Verify with World ID
                                </button>
                            )}
                        </IDKitWidget>
                    ) : (
                        <div className="flex items-center text-green-400 gap-2 text-sm font-mono">
                            <CheckCircle2 className="w-4 h-4" /> Verification Successful — Device Gate Passed
                        </div>
                    )}
                </div>

                {/* ── Fase 2: Análisis Semántico ── */}
                <div
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 transition-opacity duration-300"
                    style={{ opacity: worldIdDone ? 1 : 0.4, pointerEvents: worldIdDone ? 'auto' : 'none' }}
                >
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Phase 2 · Semantic Analysis (Rust + DeepSeek)
                    </h2>

                    {phase2Status === 'idle' && (
                        <button
                            onClick={runSemanticAnalysis}
                            className="w-full flex items-center justify-center gap-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 py-2.5 rounded-lg font-medium transition-all"
                            style={{ boxShadow: '0 0 12px rgba(34,211,238,0.1)' }}
                        >
                            <Shield className="w-4 h-4" /> Run Risk Analysis
                        </button>
                    )}

                    {phase2Status === 'loading' && (
                        <div className="flex items-center justify-center gap-2 text-cyan-400 py-2">
                            <Zap className="w-4 h-4 animate-pulse" /> Analyzing contract with DeepSeek…
                        </div>
                    )}

                    {phase2Status === 'error' && (
                        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400 font-mono">
                            ❌ {errorMsg || 'Error connecting to Rust backend.'}
                            <button onClick={runSemanticAnalysis} className="ml-2 underline">Retry</button>
                        </div>
                    )}

                    {phase2Status === 'done' && analysisResult && (
                        <div className={`p-3 rounded-lg border ${riskStyle.border} ${riskStyle.bg}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400 font-mono">Risk Level:</span>
                                <span className={`text-sm font-bold ${riskStyle.text}`}>{riskStyle.label}</span>
                            </div>
                            {analysisResult.function_name && (
                                <div className="text-xs text-slate-400 mb-2 font-mono">
                                    Decoded Function: <span className="text-cyan-300">{analysisResult.function_name}</span>
                                </div>
                            )}
                            <pre
                                className="text-xs text-slate-300 leading-relaxed bg-black/40 p-2 rounded whitespace-pre-wrap"
                                style={{ fontFamily: '"JetBrains Mono", monospace' }}
                            >
                                {analysisResult.explanation}
                            </pre>
                        </div>
                    )}
                </div>

                {/* ── Fase 3: Auditoría CRE (solo visible después del análisis) ── */}
                {phase2Status === 'done' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Phase 3 · Chainlink CRE Audit
                        </h2>

                        {phase3Status === 'idle' && (
                            <button
                                onClick={runCreAudit}
                                className="w-full flex items-center justify-center gap-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 py-2.5 rounded-lg font-medium transition-all"
                            >
                                <ChevronRight className="w-4 h-4" /> Authorize Decentralized Audit (CRE)
                            </button>
                        )}

                        {phase3Status === 'loading' && (
                            <div className="flex items-center justify-center gap-2 text-purple-400 py-2">
                                <Zap className="w-4 h-4 animate-pulse" /> Executing workflow on Chainlink DON…
                            </div>
                        )}

                        {phase3Status === 'error' && (
                            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400 font-mono">
                                ❌ {errorMsg || 'Error in CRE workflow.'}
                            </div>
                        )}

                        {phase3Status === 'done' && creResult && (
                            <div className="space-y-2">
                                {/* Badge DON Consensus */}
                                <div
                                    className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 p-2 rounded-lg"
                                    style={{ boxShadow: '0 0 8px rgba(34,211,238,0.15)' }}
                                >
                                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                                    <span className="font-semibold">DON Consensus BFT</span>
                                    <span className="text-slate-500">·</span>
                                    <span className="text-slate-300">{creResult.auditor}</span>
                                </div>
                                {/* Hash */}
                                <div className="text-xs font-mono text-slate-500 px-1 break-all">
                                    Hash: <span className="text-slate-300">{creResult.verification_hash}</span>
                                </div>
                                {/* Funciones peligrosas */}
                                {creResult.dangerous_functions && (
                                    <div className="text-xs font-mono text-orange-400 px-1">
                                        ⚠️ Dangerous Functions: {creResult.dangerous_functions}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Aviso: el plugin no controla la billetera ── */}
                <div className="mt-2 flex items-start gap-3 text-xs text-cyan-200 bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.08)]">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    <span className="leading-relaxed text-slate-300">
                        <strong className="text-cyan-100 text-[13px] font-semibold tracking-wide">RiskOracle only informs.</strong><br />
                        The decision to sign or reject the transaction is yours, directly in MetaMask.
                    </span>
                </div>

            </div>{/* fin flex-1 */}

            {/* ── Botones de acción ── */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3">
                <button
                    onClick={() => window.close()}
                    className="flex-1 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"
                >
                    <XCircle className="w-4 h-4" /> Close Guardian
                </button>
                <button
                    onClick={() => window.close()}
                    disabled={!analysisResult}
                    className="flex-1 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm border border-cyan-500/20"
                    style={{ boxShadow: analysisResult ? '0 0 10px rgba(34,211,238,0.08)' : 'none' }}
                >
                    Report Reviewed ✓
                </button>
            </div>

        </div>
    )
}
