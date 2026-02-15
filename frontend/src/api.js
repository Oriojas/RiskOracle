const API_BASE = 'http://127.0.0.1:8080';

export async function analyzeRisk(contractAddress, callData) {
  try {
    const response = await fetch(`${API_BASE}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_address: contractAddress, call_data: callData }),
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { status: "error", message: "Connection error", details: error.message };
  }
}

export async function requestChainlinkAudit(contractAddress, callData) {
  try {
    const response = await fetch(`${API_BASE}/chainlink-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_address: contractAddress, call_data: callData }),
    });
    return await response.json();
  } catch (error) {
    console.error("Chainlink Audit API Error:", error);
    return { status: "error", message: "Connection error", details: error.message };
  }
}
