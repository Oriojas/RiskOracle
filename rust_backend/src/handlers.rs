use actix_web::{web, HttpResponse, Responder};
use ethers::types::Address;
use log::{error, info, warn};
use reqwest::{
    header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE},
    Client,
};
use serde_json::{json, Value};
use std::env;
use url::Url;

use crate::abi::get_or_fetch_abi;
use crate::config::load_prompt_config;
use crate::decode::decode_function_call;
use crate::{AnalysisRequest, AnalysisResponse, ChainlinkAuditRequest, ChainlinkAuditResponse, DecodeRequest, DecodeResponse};

pub async fn decode_handler(req: web::Json<DecodeRequest>) -> impl Responder {
    info!(
        "📥 Decode request received - Contract: {}",
        req.contract_address
    );

    let contract_address_result = req.contract_address.parse::<Address>();
    let contract_address = match contract_address_result {
        Ok(addr) => addr,
        Err(e) => {
            warn!(
                "❌ Invalid contract address: {} - Error: {}",
                req.contract_address, e
            );
            return HttpResponse::BadRequest().json(DecodeResponse {
                status: "error".to_string(),
                function_name: None,
                arguments: None,
                message: Some(format!("Invalid contract address: {}", e)),
                details: None,
                abi: None,
            });
        }
    };

    let contracts_and_abis = match get_or_fetch_abi(&contract_address).await {
        Ok(list) => list,
        Err(e) => {
            error!("❌ Failed to fetch ABI for {}: {}", contract_address, e);
            return HttpResponse::InternalServerError().json(DecodeResponse {
                status: "error".to_string(),
                function_name: None,
                arguments: None,
                message: Some("Failed to fetch or load the ABI".to_string()),
                details: Some(e.to_string()),
                abi: None,
            });
        }
    };

    let mut last_error = "No ABI found".to_string();

    for (contract, abi) in contracts_and_abis {
        match decode_function_call(&contract, &req.call_data) {
            Ok((name, args)) => {
                let args_str: Vec<String> = args.into_iter().map(|arg| format!("{:?}", arg)).collect();
                info!(
                    "✅ Decode successful - Function: {}, Arguments: {:?}",
                    name, args_str
                );
                return HttpResponse::Ok().json(DecodeResponse {
                    status: "success".to_string(),
                    function_name: Some(name),
                    arguments: Some(args_str),
                    message: None,
                    details: None,
                    abi: Some(abi),
                });
            }
            Err(e) => {
                last_error = e.to_string();
                // Continue to next ABI in list
            }
        }
    }

    // If we reach here, no ABI worked
    error!("❌ Failed to decode call data with any ABI: {}", last_error);
    HttpResponse::InternalServerError().json(DecodeResponse {
        status: "error".to_string(),
        function_name: None,
        arguments: None,
        message: Some("Failed to decode call data".to_string()),
        details: Some(format!("Last error: {}", last_error)),
        abi: None,
    })
}

pub async fn analysis_handler(req: web::Json<AnalysisRequest>) -> impl Responder {
    info!(
        "📥 Analysis request received - Contract: {}",
        req.contract_address
    );

    let deepseek_api_key = match env::var("DEEPSEEK_API_KEY") {
        Ok(key) => key,
        Err(_) => {
            error!(
                "❌ DEEPSEEK_API_KEY not configured for contract analysis: {}",
                req.contract_address
            );
            return HttpResponse::InternalServerError().json(AnalysisResponse {
                status: "error".to_string(),
                function_name: None,
                arguments: None,
                risk_level: None,
                explanation: None,
                message: Some("DEEPSEEK_API_KEY not configured".to_string()),
                details: Some("Make sure to set the DEEPSEEK_API_KEY environment variable in your .env file".to_string()),
            });
        }
    };

    // Parse contract address
    let contract_address = match req.contract_address.parse::<Address>() {
        Ok(addr) => addr,
        Err(e) => {
            warn!(
                "❌ Invalid contract address in analysis: {} - Error: {}",
                req.contract_address, e
            );
            return HttpResponse::BadRequest().json(AnalysisResponse {
                status: "error".to_string(),
                function_name: None,
                arguments: None,
                risk_level: None,
                explanation: None,
                message: Some(format!("Invalid contract address: {}", e)),
                details: None,
            });
        }
    };

    // Get or fetch ABI (returns a list of potential contracts)
    let contracts_and_abis = match get_or_fetch_abi(&contract_address).await {
        Ok(list) => list,
        Err(e) => {
            error!(
                "❌ Failed to fetch ABI for analysis of {}: {}",
                contract_address, e
            );
            return HttpResponse::InternalServerError().json(AnalysisResponse {
                status: "error".to_string(),
                function_name: None,
                arguments: None,
                risk_level: None,
                explanation: None,
                message: Some("Failed to fetch or load the ABI".to_string()),
                details: Some(e.to_string()),
            });
        }
    };

    // Decode function call - Loop until one works
    let mut function_name: String = "".to_string();
    let mut arguments: Vec<String> = Vec::new();
    let mut decode_success = false;
    let mut last_decode_error = String::new();

    for (contract, _) in contracts_and_abis {
        match decode_function_call(&contract, &req.call_data) {
            Ok((name, args)) => {
                let args_str: Vec<String> = args.into_iter().map(|arg| format!("{:?}", arg)).collect();
                function_name = name;
                arguments = args_str;
                decode_success = true;
                break; // Found matching ABI
            }
            Err(e) => {
                last_decode_error = e.to_string();
            }
        }
    }

    if !decode_success {
        error!("❌ Failed to decode call data in analysis: {}", last_decode_error);
        return HttpResponse::InternalServerError().json(AnalysisResponse {
            status: "error".to_string(),
            function_name: None,
            arguments: None,
            risk_level: None,
            explanation: None,
            message: Some("Failed to decode call data".to_string()),
            details: Some(last_decode_error),
        });
    }

    // Load prompt configuration
    let prompt_config = match load_prompt_config() {
        Ok(config) => config,
        Err(e) => {
            error!("❌ Failed to load prompt configuration: {}", e);
            return HttpResponse::InternalServerError().json(AnalysisResponse {
                status: "error".to_string(),
                function_name: Some(function_name),
                arguments: Some(arguments),
                risk_level: None,
                explanation: None,
                message: Some("Failed to load prompt configuration".to_string()),
                details: Some(e.to_string()),
            });
        }
    };

    let api_url = match Url::parse("https://api.deepseek.com/chat/completions") {
        Ok(url) => url,
        Err(e) => {
            error!("❌ Failed to build DeepSeek API URL: {}", e);
            return HttpResponse::InternalServerError().json(AnalysisResponse {
                status: "error".to_string(),
                function_name: Some(function_name),
                arguments: Some(arguments),
                risk_level: None,
                explanation: None,
                message: Some("Internal error building API URL".to_string()),
                details: Some(e.to_string()),
            });
        }
    };

    let client = Client::new();

    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", deepseek_api_key)).unwrap(),
    );
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    // Construct the prompt for the LLM using the config
    let prompt = prompt_config
        .user_prompt_template
        .replace("{contract_address}", &req.contract_address)
        .replace("{function_name}", &function_name)
        .replace("{arguments}", &format!("{:?}", arguments));

    let body = json!({
        "model": prompt_config.model_settings.model,
        "messages": [
            {"role": "system", "content": prompt_config.system_message},
            {"role": "user", "content": prompt}
        ],
        "stream": prompt_config.model_settings.stream
    });

    info!(
        "📤 Sending request to DeepSeek API - Function: {}",
        function_name
    );

    let response = client
        .post(api_url)
        .headers(headers)
        .json(&body)
        .send()
        .await;

    match response {
        Ok(res) => {
            let status = res.status();
            info!("📥 DeepSeek response - Status: {}", status);
            let full_response: Result<Value, _> = res.json().await;

            match full_response {
                Ok(json_response) => {
                    let content = json_response["choices"][0]["message"]["content"]
                        .as_str()
                        .unwrap_or("");

                    // Log full content for debugging
                    info!("📄 Full LLM response content: {}", content);

                    let risk_level = content
                        .lines()
                        .find(|line| {
                            line.starts_with(&prompt_config.response_format.risk_level_prefix)
                        })
                        .and_then(|line| line.split(":").nth(1))
                        .map(|s| s.trim().to_string());

                    let explanation = if let Some(start) =
                        content.find(&prompt_config.response_format.explanation_prefix)
                    {
                        let after_prefix =
                            start + prompt_config.response_format.explanation_prefix.len();
                        if content[after_prefix..].starts_with(':') {
                            Some(content[(after_prefix + 1)..].trim().to_string())
                        } else {
                            Some(content[after_prefix..].trim().to_string())
                        }
                    } else {
                        None
                    };

                    if status.is_success() {
                        info!("✅ Analysis completed successfully - Function: {}, Risk level: {:?}", function_name, risk_level);
                        HttpResponse::Ok().json(AnalysisResponse {
                            status: "success".to_string(),
                            function_name: Some(function_name),
                            arguments: Some(arguments),
                            risk_level,
                            explanation,
                            message: Some("Risk analysis completed".to_string()),
                            details: None,
                        })
                    } else {
                        error!(
                            "❌ DeepSeek API error - Status: {}, Response: {}",
                            status, json_response
                        );
                        HttpResponse::InternalServerError().json(AnalysisResponse {
                            status: "error".to_string(),
                            function_name: Some(function_name),
                            arguments: Some(arguments),
                            risk_level: None,
                            explanation: None,
                            message: Some(format!(
                                "DeepSeek API error (HTTP status: {})",
                                status
                            )),
                            details: Some(json_response.to_string()),
                        })
                    }
                }
                Err(e) => {
                    error!("❌ Failed to parse DeepSeek JSON: {}", e);
                    HttpResponse::InternalServerError().json(AnalysisResponse {
                        status: "error".to_string(),
                        function_name: Some(function_name),
                        arguments: Some(arguments),
                        risk_level: None,
                        explanation: None,
                        message: Some("Failed to parse DeepSeek JSON response".to_string()),
                        details: Some(e.to_string()),
                    })
                }
            }
        }
        Err(e) => {
            error!("❌ Failed to call DeepSeek API: {}", e);
            HttpResponse::InternalServerError().json(AnalysisResponse {
                status: "error".to_string(),
                function_name: Some(function_name),
                arguments: Some(arguments),
                risk_level: None,
                explanation: None,
                message: Some("Failed to call DeepSeek API".to_string()),
                details: Some(e.to_string()),
            })
        }
    }
}

/// Handler for the /chainlink-audit endpoint.
/// Executes the CRE workflow simulation and returns the verified result.
pub async fn chainlink_audit_handler(
    req: web::Json<ChainlinkAuditRequest>,
) -> impl Responder {
    info!(
        "🔗 Chainlink Audit request - Contract: {}",
        req.contract_address
    );

    // Path to the CRE project
    let cre_project_path = match env::var("CRE_PROJECT_PATH") {
        Ok(path) => path,
        Err(_) => {
            let default_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                .parent()
                .unwrap_or(std::path::Path::new("."))
                .join("cre")
                .join("risk_oracle");
            default_path.to_string_lossy().to_string()
        }
    };

    info!("📁 CRE project path: {}", cre_project_path);

    // Update config.staging.json with the requested contract address
    let config_path = format!(
        "{}/risk_oracle_wf1/config.staging.json",
        cre_project_path
    );

    let config_content = json!({
        "schedule": "0 */5 * * * *",
        "contractAddress": req.contract_address,
        "etherscanChainId": "11155111"
    });

    if let Err(e) = std::fs::write(&config_path, serde_json::to_string_pretty(&config_content).unwrap()) {
        error!("Failed to write CRE config: {}", e);
        return HttpResponse::InternalServerError().json(ChainlinkAuditResponse {
            status: "error".to_string(),
            risk_level: None,
            explanation: None,
            dangerous_functions: None,
            auditor: None,
            verified_timestamp: None,
            verification_hash: None,
            message: Some(format!("Failed to write CRE config: {}", e)),
        });
    }

    // Execute the CRE workflow simulation with detailed terminal logging
    info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    info!("🔗 CHAINLINK CRE WORKFLOW EXECUTION START");
    info!("   📋 Contract: {}", req.contract_address);
    info!("   📋 Call Data: {}", req.call_data);
    info!("   🕐 Timestamp: {}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"));
    info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    info!("🚀 Launching CRE CLI: cre workflow simulate risk_oracle_wf1");

    let simulate_result = tokio::process::Command::new("cre")
        .args(&[
            "workflow",
            "simulate",
            "risk_oracle_wf1",
            "--non-interactive",
            "--trigger-index",
            "0",
        ])
        .current_dir(&cre_project_path)
        .output()
        .await;

    match simulate_result {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            let combined = format!("{}{}", stdout, stderr);

            info!("📊 CRE simulation exit code: {:?}", output.status.code());

            // Log full CRE output for real-time demo
            info!("┌─────────────── CRE STDOUT ───────────────┐");
            for line in stdout.lines() {
                info!("│ {}", line);
            }
            info!("└───────────────────────────────────────────┘");
            if !stderr.is_empty() {
                info!("┌─────────────── CRE STDERR ───────────────┐");
                for line in stderr.lines() {
                    warn!("│ {}", line);
                }
                info!("└───────────────────────────────────────────┘");
            }

            // Extract the JSON result from the simulation output
            if let Some(json_start) = combined.find("Workflow Simulation Result:") {
                let after_marker = &combined[json_start + "Workflow Simulation Result:".len()..];

                if let Some(brace_start) = after_marker.find('{') {
                    let json_str = &after_marker[brace_start..];

                    let mut depth = 0;
                    let mut end_idx = 0;
                    for (i, ch) in json_str.char_indices() {
                        match ch {
                            '{' => depth += 1,
                            '}' => {
                                depth -= 1;
                                if depth == 0 {
                                    end_idx = i + 1;
                                    break;
                                }
                            }
                            _ => {}
                        }
                    }

                    if end_idx > 0 {
                        let json_result = &json_str[..end_idx];
                        match serde_json::from_str::<Value>(json_result) {
                            Ok(parsed) => {
                                // Generate SHA-256 verification hash server-side
                                use sha2::{Sha256, Digest};
                                let hash_input = format!(
                                    "chainlink-don-v1|{}|{}|{}|{}|{}|{}",
                                    req.contract_address,
                                    parsed["risk_level"].as_str().unwrap_or(""),
                                    parsed["explanation"].as_str().unwrap_or(""),
                                    parsed["dangerous_functions"].as_str().unwrap_or(""),
                                    parsed["auditor"].as_str().unwrap_or(""),
                                    parsed["timestamp"].as_str().unwrap_or(""),
                                );
                                let mut hasher = Sha256::new();
                                hasher.update(hash_input.as_bytes());
                                let hash_result = hasher.finalize();
                                let verification_hash = format!("0x{}", hex::encode(hash_result));

                                info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                                info!("✅ CHAINLINK CRE WORKFLOW COMPLETE");
                                info!("   🎯 Risk Level: {}", parsed["risk_level"].as_str().unwrap_or("N/A"));
                                info!("   🔐 Verification Hash: {}", verification_hash);
                                info!("   ⚠️  Dangerous Functions: {}", parsed["dangerous_functions"].as_str().unwrap_or("None"));
                                info!("   👤 Auditor: {}", parsed["auditor"].as_str().unwrap_or("N/A"));
                                info!("   🕐 Timestamp: {}", parsed["timestamp"].as_str().unwrap_or("N/A"));
                                info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                                return HttpResponse::Ok().json(ChainlinkAuditResponse {
                                    status: "success".to_string(),
                                    risk_level: parsed["risk_level"].as_str().map(|s| s.to_string()),
                                    explanation: parsed["explanation"].as_str().map(|s| s.to_string()),
                                    dangerous_functions: parsed["dangerous_functions"].as_str().map(|s| s.to_string()),
                                    auditor: parsed["auditor"].as_str().map(|s| s.to_string()),
                                    verified_timestamp: parsed["timestamp"].as_str().map(|s| s.to_string()),
                                    verification_hash: Some(verification_hash),
                                    message: None,
                                });
                            }
                            Err(e) => {
                                error!("Failed to parse CRE JSON result: {}", e);
                            }
                        }
                    }
                }
            }

            // Check for execution error
            if combined.contains("Workflow execution failed") {
                let error_msg = combined
                    .lines()
                    .find(|l| l.contains("Error"))
                    .unwrap_or("Unknown CRE execution error")
                    .to_string();

                error!("❌ CRE workflow failed: {}", error_msg);
                return HttpResponse::InternalServerError().json(ChainlinkAuditResponse {
                    status: "error".to_string(),
                    risk_level: None,
                    explanation: None,
                    dangerous_functions: None,
                    auditor: Some("Chainlink Decentralized Network".to_string()),
                    verified_timestamp: None,
                    verification_hash: None,
                    message: Some(error_msg),
                });
            }

            // Fallback: couldn't parse result
            error!("Could not extract CRE result from output");
            HttpResponse::InternalServerError().json(ChainlinkAuditResponse {
                status: "error".to_string(),
                risk_level: None,
                explanation: None,
                dangerous_functions: None,
                auditor: None,
                verified_timestamp: None,
                verification_hash: None,
                message: Some("Could not parse CRE workflow output".to_string()),
            })
        }
        Err(e) => {
            error!("❌ Failed to execute CRE CLI: {}", e);
            HttpResponse::InternalServerError().json(ChainlinkAuditResponse {
                status: "error".to_string(),
                risk_level: None,
                explanation: None,
                dangerous_functions: None,
                auditor: None,
                verified_timestamp: None,
                verification_hash: None,
                message: Some(format!("Failed to execute CRE CLI: {}. Make sure 'cre' is installed and in PATH.", e)),
            })
        }
    }
}

