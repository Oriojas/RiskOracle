import {
  CronCapability,
  handler,
  Runner,
  type Runtime,
  type NodeRuntime,
  json,
  ok,
  text,
  consensusIdenticalAggregation,
  HTTPClient,
} from "@chainlink/cre-sdk";

// Base64 encoder compatible with CRE WASM environment (btoa not available)
function toBase64(str: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < bytes.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : "=";
    result += i + 2 < bytes.length ? chars[b3 & 63] : "=";
  }
  return result;
}

// ============================================================================
// RiskOracle CRE Workflow: Risk Auditor
// ============================================================================
// This workflow runs periodically (cron) and audits smart contracts
// in a decentralized manner using the Chainlink DON network.
//
// Flow:
// 1. Cron Trigger starts the audit
// 2. HTTP Fetch of ABI from Etherscan V2 API (consensus among nodes)
// 3. HTTP Fetch to DeepSeek for risk analysis (temp=0, deterministic)
// 4. Returns verified result by BFT consensus
// ============================================================================

type Config = {
  schedule: string;
  contractAddress: string;
  etherscanChainId: string;
};

/**
 * Main callback for the risk auditor.
 * Executes on each DON node independently.
 * Results are verified by BFT consensus.
 */
const onAuditTrigger = (runtime: Runtime<Config>): Record<string, string> => {
  const config = runtime.config;
  const httpCapability = new HTTPClient();

  runtime.log(`🔍 RiskOracle Audit - Contract: ${config.contractAddress}`);
  runtime.log(`🌐 Chain ID: ${config.etherscanChainId}`);

  // ========================================================================
  // STEP 1: Get contract ABI from Etherscan V2 API
  // ========================================================================
  // runInNodeMode is used so each node makes the HTTP call
  // independently and then consensus is reached on the result.

  // Get Etherscan API Key from secrets (in DON mode)
  const etherscanSecret = runtime.getSecret({ id: "ETHERSCAN_API_KEY" }).result();
  const etherscanApiKey = etherscanSecret.value;

  const fetchAbi = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const abiUrl = `https://api.etherscan.io/v2/api?chainid=${nodeRuntime.config.etherscanChainId}&module=contract&action=getabi&address=${nodeRuntime.config.contractAddress}&apikey=${etherscanApiKey}`;

      nodeRuntime.log(`📤 Fetching ABI from Etherscan V2...`);

      const response = httpCapability.sendRequest(nodeRuntime, {
        url: abiUrl,
        method: "GET",
      });

      const result = response.result();

      if (!ok(result)) {
        return JSON.stringify({
          error: true,
          message: `Etherscan API returned status ${result.statusCode}`,
        });
      }

      return text(result);
    },
    consensusIdenticalAggregation<string>()
  );

  const abiResponseText = fetchAbi().result();
  runtime.log(`✅ ABI Response received (${abiResponseText.length} chars)`);

  // Parse the Etherscan response
  let abiData: string;
  try {
    const etherscanResponse = JSON.parse(abiResponseText);
    if (etherscanResponse.status !== "1") {
      runtime.log(`❌ Etherscan error: ${etherscanResponse.message}`);
      return {
        risk_level: "ERROR",
        explanation: `Could not fetch the contract ABI for ${config.contractAddress}. Etherscan responded: ${etherscanResponse.message}`,
        auditor: "Chainlink Decentralized Network",
        contract_address: config.contractAddress,
        chain_id: config.etherscanChainId,
        timestamp: runtime.now().toISOString(),
      };
    }
    abiData = etherscanResponse.result;
    runtime.log(`✅ ABI parsed successfully`);
  } catch (e) {
    runtime.log(`❌ Error parsing Etherscan response`);
    return {
      risk_level: "ERROR",
      explanation: "Error parsing the Etherscan API response",
      auditor: "Chainlink Decentralized Network",
      contract_address: config.contractAddress,
      chain_id: config.etherscanChainId,
      timestamp: runtime.now().toISOString(),
    };
  }

  // ========================================================================
  // STEP 2: Risk analysis with DeepSeek (Deterministic)
  // ========================================================================
  // CRITICAL: temperature=0 and seed=42 so all nodes obtain
  // the same response, allowing BFT consensus among DON nodes.

  const analysisPrompt = `Analyze the security risks of the following smart contract ABI.
Contract address: ${config.contractAddress}

Contract ABI:
${abiData}

STRICT INSTRUCTIONS:
1. Identify dangerous functions (transfers, approvals, owner changes)
2. Look for drainer, rug pull, or honey pot patterns
3. Evaluate the overall risk level

Respond ONLY with this JSON format (no markdown, no backticks, no additional text):
{"risk_level": "Low|Medium|High|Critical", "explanation": "your detailed analysis here", "dangerous_functions": ["func1", "func2"]}`;

  const analysisBody = JSON.stringify({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are a smart contract security auditor. Respond ONLY in valid JSON format, no backticks, no markdown.",
      },
      {
        role: "user",
        content: analysisPrompt,
      },
    ],
    temperature: 0,
    seed: 42,
    max_tokens: 1024,
  });

  // Get DeepSeek API Key from secrets
  const deepseekSecret = runtime.getSecret({ id: "DEEPSEEK_API_KEY" }).result();
  const deepseekApiKey = deepseekSecret.value;

  runtime.log(`Sending ABI to DeepSeek for risk analysis...`);

  const analyzeRisk = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      nodeRuntime.log(`Calling DeepSeek API...`);

      const response = httpCapability.sendRequest(nodeRuntime, {
        url: "https://api.deepseek.com/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekApiKey}`,
        },
        body: toBase64(analysisBody),
      });

      const result = response.result();

      if (!ok(result)) {
        return JSON.stringify({
          error: true,
          message: `DeepSeek API returned status ${result.statusCode}`,
        });
      }

      return text(result);
    },
    consensusIdenticalAggregation<string>()
  );

  const analysisResponseText = analyzeRisk().result();
  runtime.log(`✅ DeepSeek response received`);

  // Parse DeepSeek response
  let riskLevel = "Unknown";
  let explanation = "Could not process analysis response";
  let dangerousFunctions = "";

  try {
    const deepseekResponse = JSON.parse(analysisResponseText);

    if (deepseekResponse.error) {
      runtime.log(`❌ DeepSeek Error: ${deepseekResponse.message}`);
      explanation = deepseekResponse.message || "DeepSeek API Error";
    } else {
      const content = deepseekResponse.choices[0].message.content;

      // Try to parse as JSON
      const analysis = JSON.parse(content);
      riskLevel = analysis.risk_level || "Unknown";
      explanation = analysis.explanation || "No explanation available";
      dangerousFunctions = (analysis.dangerous_functions || []).join(", ");

      runtime.log(`🎯 Risk Level: ${riskLevel}`);
      runtime.log(`⚠️ Dangerous Functions: ${dangerousFunctions || "None"}`);
    }
  } catch (e) {
    runtime.log(`⚠️ Error parsing DeepSeek response, using raw response`);
    try {
      const deepseekResponse = JSON.parse(analysisResponseText);
      explanation = deepseekResponse.choices?.[0]?.message?.content || "Format error in LLM response";
    } catch {
      explanation = "Format error in LLM response";
    }
  }

  // ========================================================================
  // FINAL RESULT
  // ========================================================================
  // This result goes through BFT consensus before being delivered.
  // Thanks to temperature=0 and seed=42, all nodes should obtain
  // the same result, allowing consensus.
  const result = {
    risk_level: riskLevel,
    explanation: explanation,
    dangerous_functions: dangerousFunctions,
    auditor: "Chainlink Decentralized Network",
    contract_address: config.contractAddress,
    chain_id: config.etherscanChainId,
    timestamp: runtime.now().toISOString(),
  };

  runtime.log(`✅ Audit complete: ${JSON.stringify(result)}`);

  return result;
};

// ============================================================================
// Workflow Initialization
// ============================================================================
const initWorkflow = (config: Config) => {
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger({ schedule: config.schedule }),
      onAuditTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
