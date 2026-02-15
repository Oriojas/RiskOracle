use ethabi::Contract;
use ethers::types::Address;
use log::{error, info};
use reqwest::Client;
use serde_json::Value;
use std::env;
use std::fs;
use std::path::Path;

pub async fn fetch_abi_from_arbiscan(
    contract_address: &str,
) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    info!(
        "🌐 Fetching ABIs from Etherscan/Arbiscan (Multi-chain) for contract: {}",
        contract_address
    );
    let api_key = env::var("ARBISCAN_API_KEY").unwrap_or_default();
    let client = Client::new();

    // List of Chain IDs to try:
    // 11155111: Ethereum Sepolia (Priority 1)
    // 421614: Arbitrum Sepolia (Priority 2)
    let chain_ids = ["11155111", "421614"];
    let mut found_abis = Vec::new();

    for chain_id in chain_ids {
        let chain_name = if chain_id == "421614" { "Arbitrum Sepolia" } else { "Ethereum Sepolia" };
        
        let url = if api_key.is_empty() {
            format!(
                "https://api.etherscan.io/v2/api?chainid={}&module=contract&action=getabi&address={}",
                chain_id, contract_address
            )
        } else {
            format!(
                "https://api.etherscan.io/v2/api?chainid={}&module=contract&action=getabi&address={}&apikey={}",
                chain_id, contract_address, api_key
            )
        };

        // Mask API Key for logging
        let masked_url = url.replace(&api_key, "HIDDEN_KEY");
        info!("📤 Request: {} (Chain ID: {})", masked_url, chain_id);
        
        match client.get(&url).send().await {
            Ok(response) => {
                if let Ok(json) = response.json::<Value>().await {
                    if json["status"] == "1" {
                        info!("✅ ABI found successfully on {}", chain_name);
                        let abi_string = json["result"].as_str().unwrap();
                        let abi: Value = serde_json::from_str(abi_string)?;
                        found_abis.push(abi);
                    } else {
                        let msg = json["message"].as_str().unwrap_or("Unknown");
                        info!("⚠️ Not found on {}: {}", chain_name, msg);
                    }
                } else {
                    error!("❌ Failed to parse JSON response from {}", chain_name);
                }
            }
            Err(e) => {
                error!("❌ Connection error with {}: {}", chain_name, e);
            }
        }
    }

    if found_abis.is_empty() {
        Err("Could not fetch ABI on any network. Verify the address and contract verification status.".into())
    } else {
        Ok(found_abis)
    }
}

pub async fn get_or_fetch_abi(
    contract_address: &Address,
) -> Result<Vec<(Contract, Value)>, Box<dyn std::error::Error>> {
    let abi_dir = "ABI";
    // Force lowercase filename to match Linux file system behavior reliably
    let abi_filename = format!("{:?}.json", contract_address).to_lowercase();
    let abi_path = Path::new(abi_dir).join(&abi_filename);

    if !Path::new(abi_dir).exists() {
        info!("📁 Creating ABI directory: {}", abi_dir);
        fs::create_dir_all(abi_dir)?;
    }

    if abi_path.exists() {
        info!("📖 Loading ABI from local file: {}", abi_filename);
        let abi_string = fs::read_to_string(&abi_path)?;
        let abi: Value = serde_json::from_str(&abi_string)?;
        
        // Load and display available functions
        let contract = Contract::load(abi.to_string().as_bytes())?;
        
        info!("🔎 Functions loaded from local cache:");
        for (name, _) in &contract.functions {
            info!("   - {}", name);
        }

        return Ok(vec![(contract, abi)]);
    }

    let address_string = format!("{:?}", contract_address);
    info!(
        "🌐 ABI not found locally ({}), searching Multi-chain...",
        abi_filename
    );

    match fetch_abi_from_arbiscan(&address_string).await {
        Ok(abis) => {
             let mut contracts_and_abis = Vec::new();
             for abi in &abis {
                 let abi_str = serde_json::to_string(abi)?;
                 if let Ok(contract) = Contract::load(abi_str.as_bytes()) {
                     // Log functions for this ABI
                     info!("🔎 Functions found in downloaded ABI:");
                     for (name, _) in &contract.functions {
                         info!("   - {}", name);
                     }
                     contracts_and_abis.push((contract, abi.clone()));
                 }
             }

             if !abis.is_empty() {
                 // Save the first one (Ethereum Sepolia priority)
                 let best_abi = &abis[0];
                 let abi_string = serde_json::to_string_pretty(best_abi)?;
                 fs::write(&abi_path, &abi_string)?;
                 info!("💾 Saving primary ABI to local file: {}", abi_filename);
             }

             Ok(contracts_and_abis)
        }
        Err(e) => {
            error!("❌ Failed to fetch ABI from Arbiscan: {}", e);
            Err(format!("Could not fetch ABI: {}. Make sure the contract is verified.", e).into())
        }
    }
}
