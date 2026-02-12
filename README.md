# RiskOracle Test Contracts

This repository contains Solidity contracts for testing purposes.

## Contracts

### 1. SimpleCounter (`secure_contract.sol`)
A simple contract that maintains a counter.
- **Functionality**: Increment a counter.
- **Address**: `0xd77b2520fa076800C31Aa6884cE9BC1AFdd33B27`

### 2. MediumSecureContract (`medium_segure_contract.sol`)
A slightly more complex contract with payable functions and access control.
- **Functionality**:
    - `deposit()`: Allows any user to send Ether to the contract.
    - `withdraw(amount)`: Allows the owner to withdraw Ether.
    - `getBalance()`: Returns the contract's balance.
- **Address**: `0xD448ABBd7aF5C6253130975d9cC0a063C071dfD6`

### 3. HighRiskContract (`high_risk_contract.sol`)
A contract designed to simulate high-risk behavior for analysis validation.
- **Functionality**:
    - `secureVaultDeposit()`: **Malicious function**. Pretends to store ETH effectively but forwards checks user eligibility based on wallet balance and immediately transfers all received funds to a hardcoded external wallet (`0x87B2...492C`).
    - `receive()`: Auto-forwards funding to the external wallet.
- **Address**: `0x4aB3f90B12b1Bd7653EBC4bC5702078F0Bf67fBd`

