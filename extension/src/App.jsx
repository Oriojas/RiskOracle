import { useEffect, useState } from 'react'
import RiskModal from './ui/RiskModal'
import Settings from './ui/Settings'

function App() {
    const [view, setView] = useState('loading')
    const [payload, setPayload] = useState(null)

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get('type') === 'risk_modal') {
            const payloadStr = searchParams.get('payload')
            if (payloadStr) {
                try {
                    setPayload(JSON.parse(decodeURIComponent(payloadStr)))
                } catch (e) {
                    console.error("Failed to parse payload", e)
                }
            }
            setView('risk_modal')
        } else {
            setView('settings')
        }
    }, [])

    if (view === 'loading') return <div className="p-4">Loading...</div>
    if (view === 'risk_modal') return <RiskModal payload={payload} />

    return <Settings />
}

export default App
