import { useState, useEffect } from 'react'
import { Shield, ShieldAlert, Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
    const [enabled, setEnabled] = useState(true)

    useEffect(() => {
        // Escuchar el estado de chrome
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['guardianEnabled'], (result) => {
                if (result.guardianEnabled !== undefined) {
                    setEnabled(result.guardianEnabled)
                }
            })
        }
    }, [])

    const toggleStatus = () => {
        const newState = !enabled
        setEnabled(newState)
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ guardianEnabled: newState })
        }
    }

    return (
        <div className="w-[320px] bg-slate-950 text-slate-100 p-5 rounded-lg border border-slate-800/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className={`w-8 h-8 ${enabled ? 'text-cyan-400' : 'text-slate-600'}`} />
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-tight">RiskOracle</h1>
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guardian Web3</h2>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between shadow-inner">
                <div>
                    <span className="block text-sm font-medium text-slate-200">Intercepción Activa</span>
                    <span className="block text-xs text-slate-500 mt-1">Protección en proxy paralelo.</span>
                </div>
                <button
                    onClick={toggleStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-700'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                    <SettingsIcon className="w-4 h-4" /> Configuración Avanzada
                </button>
            </div>
        </div>
    )
}
