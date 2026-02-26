import { useEffect, useState } from 'react'
import RiskModal from './ui/RiskModal'
import Settings from './ui/Settings'

function App() {
    const [view, setView] = useState('loading')
    const [payload, setPayload] = useState(null)

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const type = searchParams.get('type')
        const payloadParam = searchParams.get('payload')

        console.log('[RiskOracle App] type:', type)
        console.log('[RiskOracle App] raw payload param:', payloadParam)

        if (type === 'risk_modal') {
            if (payloadParam) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(payloadParam))
                    console.log('[RiskOracle App] payload parsed:', parsed)
                    setPayload(parsed)
                } catch (e) {
                    console.error('[RiskOracle App] Failed to parse payload:', e)
                    setPayload(null)
                }
            }
            setView('risk_modal')
        } else {
            setView('settings')
        }
    }, [])

    if (view === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 text-sm">
                Cargando...
            </div>
        )
    }

    if (view === 'risk_modal') {
        return <RiskModal payload={payload} />
    }

    return <Settings />
}

export default App
