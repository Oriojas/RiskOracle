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
) -> Result<Value, Box<dyn std::error::Error>> {
    info!(
        "🌐 Solicitando ABI de Arbiscan/Etherscan para contrato: {}",
        contract_address
    );
    let api_key = env::var("ARBISCAN_API_KEY").unwrap_or_default();
    let client = Client::new();

    // Lista de Chain IDs para probar: 
    // 421614: Arbitrum Sepolia
    // 11155111: Ethereum Sepolia
    let chain_ids = ["421614", "11155111"];

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

        info!("📤 Intentando obtener ABI en {} (Chain ID: {})", chain_name, chain_id);
        
        match client.get(&url).send().await {
            Ok(response) => {
                if let Ok(json) = response.json::<Value>().await {
                    if json["status"] == "1" {
                        info!("✅ ABI encontrado exitosamente en {}", chain_name);
                        let abi_string = json["result"].as_str().unwrap();
                        let abi: Value = serde_json::from_str(abi_string)?;
                        return Ok(abi);
                    } else {
                        let msg = json["message"].as_str().unwrap_or("Desconocido");
                        info!("⚠️ No encontrado en {}: {}", chain_name, msg);
                    }
                }
            }
            Err(e) => {
                error!("❌ Error de conexión con {}: {}", chain_name, e);
            }
        }
    }

    Err("No se pudo obtener el ABI en ninguna de las redes configuradas (Arbitrum Sepolia, Ethereum Sepolia). Asegúrate de que el contrato esté verificado.".into())
}

pub async fn get_or_fetch_abi(
    contract_address: &Address,
) -> Result<(Contract, Value), Box<dyn std::error::Error>> {
    let abi_dir = "ABI";
    let abi_filename = format!("{}.json", contract_address);
    let abi_path = Path::new(abi_dir).join(&abi_filename);

    if !Path::new(abi_dir).exists() {
        info!("📁 Creando directorio ABI: {}", abi_dir);
        fs::create_dir_all(abi_dir)?;
    }

    if abi_path.exists() {
        info!("📖 Cargando ABI desde archivo local: {}", abi_filename);
        let abi_string = fs::read_to_string(&abi_path)?;
        let abi: Value = serde_json::from_str(&abi_string)?;
        let contract = Contract::load(abi.to_string().as_bytes())?;
        info!("✅ ABI cargado exitosamente desde archivo local");
        return Ok((contract, abi));
    }

    let address_string = format!("{:?}", contract_address);
    info!(
        "🌐 ABI no encontrado localmente, buscando en Arbiscan: {}",
        address_string
    );

    match fetch_abi_from_arbiscan(&address_string).await {
        Ok(abi) => {
            info!("✅ ABI obtenido exitosamente de Arbiscan");
            let abi_string = serde_json::to_string_pretty(&abi)?;
            fs::write(&abi_path, &abi_string)?;
            info!("💾 ABI guardado en archivo local: {}", abi_filename);
            let contract = Contract::load(abi_string.as_bytes())?;
            Ok((contract, abi))
        }
        Err(e) => {
            error!("❌ Error al obtener ABI de Arbiscan: {}", e);
            Err(format!("No se pudo obtener el ABI: {}. Asegúrate de que el contrato esté verificado en Arbiscan Sepolia.", e).into())
        }
    }
}
