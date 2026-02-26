import { useState } from 'react'
import { Shield, ShieldAlert, CheckCircle2, Activity, Zap, AlertTriangle, XCircle } from 'lucide-react'
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

// Mapa de nivel de riesgo -> estilos
const RISK_STYLES = {
    Critical: {
        border: 'border-red-900/60',
        bg: 'bg-red-950/30',
        text: 'text-red-400',
        glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        label: '🔴 CRITICAL',
    },
    High: {
        border: 'border-orange-900/60',
        bg: 'bg-orange-950/30',
        text: 'text-orange-400',
        glow: 'shadow-[0_0_10px_rgba(251,146,60,0.3)]',
        label: '🟠 HIGH',
    },
    Medium: {
        border: 'border-yellow-900/60',
        bg: 'bg-yellow-950/30',
        text: 'text-yellow-400',
        glow: '',
        label: '🟡 MEDIUM',
    },
    Low: {
        border: 'border-green-900/60',
        bg: 'bg-green-950/30',
        text: 'text-green-400',
        glow: 'shadow-[0_0_8px_rgba(52,211,153,0.2)]',
        label: '🟢 LOW',
    },
}

function getRiskStyle(level) {
    if (!level) return RISK_STYLES.Medium
    const key = Object.keys(RISK_STYLES).find(k => k.toLowerCase() === level.toLowerCase())
    return RISK_STYLES[key] || RISK_STYLES.Medium
}

export default function RiskModal({ payload }) {
    const [worldIdVerified, setWorldIdVerified] = useState(false)
    const [analysisStatus, setAnalysisStatus] = useState('idle') // idle | analyzing | complete | error
    const [analysisResult, setAnalysisResult] = useState(null)
    const [creConsensus, setCreConsensus] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)

    // Extraer los campos del payload de MetaMask
    const txParams = payload?.params?.[0] || {}
    const contractAddress = txParams.to || ''
    const callData = txParams.data || txParams.input || '0x'

    const handleVerify = (result) => {
        console.log('✅ [RiskOracle] World ID verified:', result)
        setWorldIdVerified(true)
    }

    const runAnalysis = async () => {
        setAnalysisStatus('analyzing')
        setErrorMsg(null)

        // === Fase 2: Análisis Semántico - Rust Backend ===
        try {
            console.log('📡 [RiskOracle] Calling /analysis with:', { contract_address: contractAddress, call_data: callData })
            const res = await fetch(`${BACKEND_URL}/analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_address: contractAddress,
                    call_data: callData,
                }),
            })

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}))
                throw new Error(errBody.message || `HTTP ${res.status}`)
            }

            const data = await res.json()
            console.log('📡 [RiskOracle] Analysis response:', data)

            // El backend devuelve risk_level y explanation (no score)
            setAnalysisResult({
                risk_level: data.risk_level || 'Medium',
                explanation: data.explanation || 'Sin explicación disponible.',
                function_name: data.function_name,
                arguments: data.arguments,
            })

            // === Fase 3: Auditoría Chainlink CRE ===
            console.log('🔗 [RiskOracle] Calling /chainlink-audit...')
            const creRes = await fetch(`${BACKEND_URL}/chainlink-audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_address: contractAddress,
                    call_data: callData,
                }),
            })

            if (creRes.ok) {
                const creData = await creRes.json()
                console.log('🔗 [RiskOracle] CRE response:', creData)
                setCreConsensus(creData)
            } else {
                console.warn('⚠️ [RiskOracle] CRE audit returned non-OK status:', creRes.status)
            }

            setAnalysisStatus('complete')
        } catch (e) {
            console.error('❌ [RiskOracle] Analysis error:', e.message)
            setErrorMsg(e.message || 'Error conectando con el backend. Verifica que el servidor Rust esté corriendo.')
            setAnalysisStatus('error')
        }
    }

    const riskStyle = getRiskStyle(analysisResult?.risk_level)
    const isCritical = analysisResult?.risk_level?.toLowerCase() === 'critical'

    return (
        <div className="flex flex-col bg-slate-950 text-slate-100 p-4 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <h1 className="text-xl font-bold tracking-tight">
                    RiskOracle <span className="text-cyan-400 font-light">Guardian</span>
                </h1>
            </div>

            <div className="flex-1 space-y-4">
                {/* Fase 1: World ID */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        Fase 1 · Identidad Humana (World ID)
                    </h2>
                    {!worldIdVerified ? (
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
                                    Verificar Humanidad con World ID
                                </button>
                            )}
                        </IDKitWidget>
                    ) : (
                        <div className="flex items-center text-green-400 gap-2 font-mono text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Verificación Exitosa — Device Gate Passed
                        </div>
                    )}
                </div>

                {/* Payload: Transacción interceptada */}
                {payload && (
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                        <h2 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                            Transacción Interceptada
                        </h2>
                        <div className="space-y-1 font-mono text-xs">
                            <div className="flex gap-2">
                                <span className="text-slate-500 shrink-0">Contrato:</span>
                                <span className="text-pink-300 break-all">{contractAddress || '—'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 shrink-0">Call Data:</span>
                                <span className="text-pink-300 break-all">{callData?.slice(0, 42)}…</span>
                            </div>
                            {txParams.value && (
                                <div className="flex gap-2">
                                    <span className="text-slate-500 shrink-0">Valor:</span>
                                    <span className="text-pink-300">{txParams.value} wei</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Fase 2 & 3: Análisis */}
                <div
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 transition-all duration-300"
                    style={{ opacity: worldIdVerified ? 1 : 0.45, pointerEvents: worldIdVerified ? 'auto' : 'none' }}
                >
                    <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        Fase 2 & 3 · Motor Semántico (Rust + CRE)
                    </h2>

                    {/* Botón de análisis */}
                    <button
                        disabled={!worldIdVerified || analysisStatus === 'analyzing' || analysisStatus === 'complete'}
                        onClick={runAnalysis}
                        className="w-full disabled:cursor-not-allowed bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 py-3 rounded-lg font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(34,211,238,0.1)] hover:shadow-[0_0_18px_rgba(34,211,238,0.2)]"
                    >
                        {analysisStatus === 'analyzing' && <><Zap className="w-4 h-4 animate-pulse" /> Analizando Riesgo...</>}
                        {analysisStatus === 'complete' && <><CheckCircle2 className="w-4 h-4" /> Análisis Completado</>}
                        {analysisStatus === 'error' && <><AlertTriangle className="w-4 h-4 text-red-400" /> <span className="text-red-400">Error — Reintentar</span></>}
                        {analysisStatus === 'idle' && <><Shield className="w-4 h-4" /> Ejecutar Análisis de Riesgo</>}
                    </button>

                    {/* Error de conexión */}
                    {errorMsg && (
                        <div className="mt-3 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400 font-mono">
                            ❌ {errorMsg}
                        </div>
                    )}

                    {/* Resultado del análisis */}
                    {analysisResult && (
                        <div className={`mt-4 p-3 rounded-lg border ${riskStyle.border} ${riskStyle.bg} ${riskStyle.glow}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400 font-mono">Nivel de Riesgo:</span>
                                <span className={`text-sm font-bold ${riskStyle.text}`}>
                                    {riskStyle.label}
                                </span>
                            </div>
                            {analysisResult.function_name && (
                                <div className="text-xs text-slate-400 mb-2 font-mono">
                                    Función: <span className="text-cyan-300">{analysisResult.function_name}</span>
                                </div>
                            )}
                            <pre className="font-mono text-xs text-slate-300 leading-relaxed bg-black/40 p-2 rounded whitespace-pre-wrap">
                                {analysisResult.explanation}
                            </pre>
                        </div>
                    )}

                    {/* Resultado Chainlink CRE */}
                    {creConsensus && creConsensus.status === 'success' && (
                        <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 p-2 rounded-lg shadow-[0_0_8px_rgba(34,211,238,0.15)]">
                                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                                <span className="font-semibold">DON Consensus BFT</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-300">{creConsensus.auditor}</span>
                            </div>
                            <div className="text-xs font-mono text-slate-500 px-1 break-all">
                                Hash: <span className="text-slate-300">{creConsensus.verification_hash}</span>
                            </div>
                            {creConsensus.dangerous_functions && (
                                <div className="text-xs font-mono text-orange-400 px-1">
                                    ⚠️ Funciones peligrosas: {creConsensus.dangerous_functions}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3">
                <button
                    onClick={() => window.close()}
                    className="flex-1 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                >
                    <XCircle className="w-4 h-4" /> Rechazar
                </button>
                <button
                    disabled={!analysisResult || isCritical}
                    onClick={() => window.close()}
                    className="flex-1 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.05)] hover:shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                >
                    Proceder Seguro
                </button>
            </div>
        </div>
    )
}
