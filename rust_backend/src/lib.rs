use serde::{Deserialize, Serialize};
use serde_json::Value;

// Struct for the prompt configuration
#[derive(Deserialize)]
pub struct PromptConfig {
    pub system_message: String,
    pub user_prompt_template: String,
    pub response_format: ResponseFormat,
    pub model_settings: ModelSettings,
}

#[derive(Deserialize)]
pub struct ResponseFormat {
    pub risk_level_prefix: String,
    pub explanation_prefix: String,
}

#[derive(Deserialize)]
pub struct ModelSettings {
    pub model: String,
    pub stream: bool,
}

// Struct for the incoming JSON request of the /decode endpoint
#[derive(Deserialize)]
pub struct DecodeRequest {
    pub contract_address: String,
    pub call_data: String,
}

// Struct for the outgoing JSON response of the /decode endpoint
#[derive(Serialize)]
pub struct DecodeResponse {
    pub status: String, // "success" or "error"
    pub function_name: Option<String>,
    pub arguments: Option<Vec<String>>, // Represent arguments as strings for simplicity
    pub message: Option<String>,
    pub details: Option<String>, // For additional error info
    pub abi: Option<Value>,      // Include ABI in successful response for analysis endpoint
}

// Struct for the incoming JSON request of the /analysis endpoint
#[derive(Deserialize)]
pub struct AnalysisRequest {
    pub contract_address: String,
    pub call_data: String,
}

// Struct for the outgoing JSON response of the /analysis endpoint
#[derive(Serialize)]
pub struct AnalysisResponse {
    pub status: String,                 // "success" or "error"
    pub function_name: Option<String>,  // Include decoded function name
    pub arguments: Option<Vec<String>>, // Include decoded arguments
    pub risk_level: Option<String>,     // e.g., "Low", "Medium", "High", "Caution", "Unknown"
    pub explanation: Option<String>,    // Explanation from the LLM
    pub message: Option<String>,
    pub details: Option<String>, // For additional error info
}

// Struct for the incoming JSON request of the /chainlink-audit endpoint
#[derive(Deserialize)]
pub struct ChainlinkAuditRequest {
    pub contract_address: String,
    pub call_data: String,
}

// Struct for the outgoing JSON response of the /chainlink-audit endpoint
#[derive(Serialize)]
pub struct ChainlinkAuditResponse {
    pub status: String,
    pub risk_level: Option<String>,
    pub explanation: Option<String>,
    pub dangerous_functions: Option<String>,
    pub auditor: Option<String>,
    pub verified_timestamp: Option<String>,
    pub verification_hash: Option<String>,
    pub message: Option<String>,
}

// Module declarations
pub mod abi;
pub mod config;
pub mod decode;
pub mod handlers;
