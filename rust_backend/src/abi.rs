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
        "🌐 Solicitando ABIs de Etherscan/Arbiscan (Multi-chain) para contrato: {}",
        contract_address
    );
    let api_key = env::var("ARBISCAN_API_KEY").unwrap_or_default();
    let client = Client::new();

    // Lista de Chain IDs para probar: 
    // 11155111: Ethereum Sepolia (Prioridad 1)
    // 421614: Arbitrum Sepolia (Prioridad 2)
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
                        info!("✅ ABI encontrado exitosamente en {}", chain_name);
                        let abi_string = json["result"].as_str().unwrap();
                        let abi: Value = serde_json::from_str(abi_string)?;
                        found_abis.push(abi);
                    } else {
                        let msg = json["message"].as_str().unwrap_or("Desconocido");
                        info!("⚠️ No encontrado en {}: {}", chain_name, msg);
                    }
                } else {
                    error!("❌ Error al parsear respuesta JSON de {}", chain_name);
                }
            }
            Err(e) => {
                error!("❌ Error de conexión con {}: {}", chain_name, e);
            }
        }
    }

    if found_abis.is_empty() {
        Err("No se pudo obtener el ABI en ninguna de las redes. Verifique la dirección y la verificación del contrato.".into())
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
        info!("📁 Creando directorio ABI: {}", abi_dir);
        fs::create_dir_all(abi_dir)?;
    }

    if abi_path.exists() {
        info!("📖 Cargando ABI desde archivo local: {}", abi_filename);
        let abi_string = fs::read_to_string(&abi_path)?;
        let abi: Value = serde_json::from_str(&abi_string)?;
        
        // Cargar y mostrar funciones disponibles
        let contract = Contract::load(abi.to_string().as_bytes())?;
        
        info!("🔎 Funciones cargadas desde cache local:");
        for (name, _) in &contract.functions {
            info!("   - {}", name);
        }

        return Ok(vec![(contract, abi)]);
    }

    let address_string = format!("{:?}", contract_address);
    info!(
        "🌐 ABI no encontrado localmente ({}), buscando en Multi-chain...",
        abi_filename
    );

    match fetch_abi_from_arbiscan(&address_string).await {
        Ok(abis) => {
             let mut contracts_and_abis = Vec::new();
             for abi in &abis {
                 let abi_str = serde_json::to_string(abi)?;
                 if let Ok(contract) = Contract::load(abi_str.as_bytes()) {
                     // Log functions for this ABI
                     info!("🔎 Funciones encontradas en ABI descargado:");
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
                 info!("💾 Guardando ABI principal en archivo local: {}", abi_filename);
             }

             Ok(contracts_and_abis)
        }
        Err(e) => {
            error!("❌ Error al obtener ABI de Arbiscan: {}", e);
            Err(format!("No se pudo obtener el ABI: {}. Asegúrate de que el contrato esté verificado.", e).into())
        }
    }
}
