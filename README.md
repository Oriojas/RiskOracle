# RiskOracle: AI-Powered Decentralized Transaction Security

RiskOracle is a next-generation security tool for DeFi users, leveraging **AI (DeepSeek-V3)** and **Chainlink Decentralized Oracle Networks (DONs)** to analyze transaction risks in real-time before execution.

![RiskOracle UI](https://via.placeholder.com/800x400?text=RiskOracle+App+Preview)

## 🚀 Key Features

### 1. AI-Powered Analysis
Uses **DeepSeek-V3** via a high-performance **Rust** backend to decompile and analyze raw calldata and contract bytecode. It identifies:
- Reentrancy vulnerabilities
- Malicious fund redirection
- Proxy implementation risks
- Unauthorized state modifications

### 2. Decentralized Verification (Chainlink CRE)
After the initial AI assessment, users can request a **Decentralized Audit**.
- **Chainlink Functions / CRE**: A decentralized network of nodes independently analyzes the contract.
- **BFT Consensus**: Nodes must reach consensus (2/3 majority) on the risk level.
- **Cryptographic Verification**: The result is hashed and signed by the DON (mocked in current simulation), ensuring censorship resistance and integrity.

### 3. Real-Time Risk Scoring
- **Critical**: High probability of fund loss (e.g., drainers).
- **High**: Dangerous functions detected without proper safeguards.
- **Medium**: Complex logic with potential edge cases.
- **Low**: Standard verified token standards (ERC20/721).
    
## ⚠️ Current Limitations

- **Network Support**: Currently optimized and tested for the **Arbitrum** network (specifically Arbitrum Sepolia).
- **Verified Contracts Only**: For accurate analysis, the contract must be **verified** on a block explorer (like Arbiscan or Etherscan). This is required so the system can fetch the ABI to correctly decode the transaction's calldata.

## 🏗 Architecture

- **Frontend**: React + Vite (Modern Cyberpunk UI)
- **Backend**: Rust (Actix-Web) for high-performance API handling.
- **AI Engine**: DeepSeek-V3 (via API).
- **Oracle Layer**: Chainlink CRE (Chainlink Runtime Environment) simulating a DON.

## 🛠 Setup & Installation

### Prerequisites
- Node.js & npm
- Rust & Cargo
- Chainlink CRE CLI (`npm install -g @chainlink/cre`)

### 1. Clone & Install
```bash
git clone https://github.com/Oriojas/RiskOracle.git
cd RiskOracle
```

### 2. Configure Environment
Create a `.env` file in `rust_backend/` with:
```env
DEEPSEEK_API_KEY=your_api_key_here
ARBISCAN_API_KEY=your_arbiscan_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
```

### 3. Run Backend (Rust)
```bash
cd rust_backend
cargo run
# Server runs at http://localhost:8080
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## 🧪 Test Contracts (Arbitrum Sepolia)

| Risk Level | Contract Name | Address | Description |
|------------|---------------|---------|-------------|
| 🟢 **Low** | `SimpleCounter` | `0xd77b2520fa076800C31Aa6884cE9BC1AFdd33B27` | Basic counter, safe and verified. |
| 🟠 **Medium**| `Vault` | `0xD448ABBd7aF5C6253130975d9cC0a063C071dfD6` | Deposit/Withdraw logic, potentially complex. |
| 🔴 **Critical** | `HighRiskVault` | `0x4aB3f90B12b1Bd7653EBC4bC5702078F0Bf67fBd` | **HoneyPot**. Accepts deposits but redirects funds to hardcoded wallet immediately. |

### Test Data (Calldata)
- **Safe Increment**: `0xd09de08a`
- **Deposit (Medium)**: `0xd0e30db0`
- **Malicious Deposit**: `0x6a2a530a`

## 🔐 Chainlink Verification Process

1. **User Request**: User clicks "Verify with Chainlink DON".
2. **CRE Simulation**: The backend triggers a Chainlink Runtime Environment workflow.
3. **Consensus**: Multiple simulated nodes fetch the ABI and analyze the contract logic.
4. **Verification Hash**: The backend generates a SHA-256 hash of the consensus result. In a production mainnet deployment, this would be accompanied by an on-chain BFT signature from the DON.

---

*Built for the Chainlink Constellation Hackathon 2024*
