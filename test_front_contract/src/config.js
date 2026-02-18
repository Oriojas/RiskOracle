
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia } from '@reown/appkit/networks'

// 1. Get projectId
// Using the ID found in .env, falling back if not set properly in process.env (Vite uses import.meta.env)
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'fe688be2235f7ce0c77d57fdd39488e1'

export const networks = [arbitrumSepolia]

// 2. Set up Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks
})

// 3. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
        name: 'Malicious App Demo',
        description: 'High Risk Contract Interaction Demo',
        url: 'https://risk-oracle-demo.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
    }
})

export const config = wagmiAdapter.wagmiConfig
