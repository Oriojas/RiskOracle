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

// Base64 encoder compatible con el entorno WASM de CRE (btoa no disponible)
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
// Este workflow se ejecuta periódicamente (cron) y audita contratos
// inteligentes de forma descentralizada usando la red Chainlink DON.
//
// Flujo:
// 1. Trigger Cron dispara la auditoría
// 2. HTTP Fetch del ABI desde Etherscan V2 API (consenso entre nodos)
// 3. HTTP Fetch a DeepSeek para análisis de riesgo (temp=0, determinístico)
// 4. Retorna resultado verificado por consenso BFT
// ============================================================================

type Config = {
  schedule: string;
  contractAddress: string;
  etherscanChainId: string;
};

/**
 * Callback principal del auditor de riesgo.
 * Se ejecuta en cada nodo del DON independientemente.
 * Los resultados son verificados por consenso BFT.
 */
const onAuditTrigger = (runtime: Runtime<Config>): Record<string, string> => {
  const config = runtime.config;
  const httpCapability = new HTTPClient();

  runtime.log(`🔍 RiskOracle Audit - Contrato: ${config.contractAddress}`);
  runtime.log(`🌐 Chain ID: ${config.etherscanChainId}`);

  // ========================================================================
  // PASO 1: Obtener ABI del contrato desde Etherscan V2 API
  // ========================================================================
  // Se usa runInNodeMode para que cada nodo haga la llamada HTTP
  // independientemente y luego se alcance consenso sobre el resultado.

  // Obtener Etherscan API Key desde secrets (en modo DON)
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
  runtime.log(`✅ ABI Response recibido (${abiResponseText.length} chars)`);

  // Parsear la respuesta de Etherscan
  let abiData: string;
  try {
    const etherscanResponse = JSON.parse(abiResponseText);
    if (etherscanResponse.status !== "1") {
      runtime.log(`❌ Etherscan error: ${etherscanResponse.message}`);
      return {
        risk_level: "ERROR",
        explanation: `No se pudo obtener el ABI del contrato ${config.contractAddress}. Etherscan respondió: ${etherscanResponse.message}`,
        auditor: "Chainlink Decentralized Network",
        contract_address: config.contractAddress,
        chain_id: config.etherscanChainId,
        timestamp: runtime.now().toISOString(),
      };
    }
    abiData = etherscanResponse.result;
    runtime.log(`✅ ABI parseado correctamente`);
  } catch (e) {
    runtime.log(`❌ Error parseando respuesta de Etherscan`);
    return {
      risk_level: "ERROR",
      explanation: "Error parseando la respuesta de Etherscan API",
      auditor: "Chainlink Decentralized Network",
      contract_address: config.contractAddress,
      chain_id: config.etherscanChainId,
      timestamp: runtime.now().toISOString(),
    };
  }

  // ========================================================================
  // PASO 2: Análisis de riesgo con DeepSeek (Determinístico)
  // ========================================================================
  // CRITICO: temperature=0 y seed=42 para que todos los nodos obtengan
  // la misma respuesta, permitiendo consenso BFT entre los nodos del DON.

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

  // Obtener DeepSeek API Key desde secrets
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
  runtime.log(`✅ Respuesta de DeepSeek recibida`);

  // Parsear respuesta de DeepSeek
  let riskLevel = "Desconocido";
  let explanation = "No se pudo procesar la respuesta del análisis";
  let dangerousFunctions = "";

  try {
    const deepseekResponse = JSON.parse(analysisResponseText);

    if (deepseekResponse.error) {
      runtime.log(`❌ Error de DeepSeek: ${deepseekResponse.message}`);
      explanation = deepseekResponse.message || "Error en la API de DeepSeek";
    } else {
      const content = deepseekResponse.choices[0].message.content;

      // Intentar parsear como JSON
      const analysis = JSON.parse(content);
      riskLevel = analysis.risk_level || "Desconocido";
      explanation = analysis.explanation || "Sin explicación disponible";
      dangerousFunctions = (analysis.dangerous_functions || []).join(", ");

      runtime.log(`🎯 Nivel de Riesgo: ${riskLevel}`);
      runtime.log(`⚠️ Funciones Peligrosas: ${dangerousFunctions || "Ninguna"}`);
    }
  } catch (e) {
    runtime.log(`⚠️ Error parseando respuesta de DeepSeek, usando respuesta raw`);
    try {
      const deepseekResponse = JSON.parse(analysisResponseText);
      explanation = deepseekResponse.choices?.[0]?.message?.content || "Error de formato en respuesta del LLM";
    } catch {
      explanation = "Error de formato en respuesta del LLM";
    }
  }

  // ========================================================================
  // RESULTADO FINAL
  // ========================================================================
  // Este resultado pasa por consenso BFT antes de ser entregado.
  // Gracias a temperature=0 y seed=42, todos los nodos deberían obtener
  // el mismo resultado, permitiendo el consenso.
  const result = {
    risk_level: riskLevel,
    explanation: explanation,
    dangerous_functions: dangerousFunctions,
    auditor: "Chainlink Decentralized Network",
    contract_address: config.contractAddress,
    chain_id: config.etherscanChainId,
    timestamp: runtime.now().toISOString(),
  };

  runtime.log(`✅ Auditoría completada: ${JSON.stringify(result)}`);

  return result;
};

// ============================================================================
// Inicialización del Workflow
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
