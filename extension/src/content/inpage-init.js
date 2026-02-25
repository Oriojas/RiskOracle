// Intercept window.ethereum
console.log("[RiskOracle Guardian] Inpage script loaded.");

function proxyProvider(provider, providerName = "Unknown") {
    if (!provider || provider.__isRiskOracleProxied) return provider;

    console.log(`[RiskOracle] Attaching proxy to provider: ${providerName}`);

    const handler = {
        get(target, prop, receiver) {
            if (prop === '__isRiskOracleProxied') return true;

            const value = Reflect.get(target, prop, receiver);

            if (prop === 'request' && typeof value === 'function') {
                return async (args) => {
                    if (args.method === 'eth_sendTransaction') {
                        console.log(`[RiskOracle] Intercepted eth_sendTransaction on ${providerName} (Parallel Mode):`, args);

                        const transactionId = Math.random().toString(36).substring(7);

                        // Trigger RiskOracle popup in parallel
                        window.postMessage({
                            type: 'RISK_ORACLE_INTERCEPT',
                            transactionId,
                            params: args.params
                        }, '*');

                        // Forward the transaction to the real wallet immediately (Do not block)
                        return value.bind(target)(args);
                    }
                    return value.bind(target)(args);
                };
            }
            return value;
        }
    };

    return new Proxy(provider, handler);
}

// 1. Intercept EIP-6963 (Multi Injected Provider Discovery)
window.addEventListener('eip6963:announceProvider', (event) => {
    if (event.detail && event.detail.provider && !event.detail.provider.__isRiskOracleProxied) {
        console.log("[RiskOracle] Intercepting EIP-6963 announceProvider for", event.detail.info?.name);

        event.stopImmediatePropagation();

        const proxiedProvider = proxyProvider(event.detail.provider, event.detail.info?.name);

        const clonedEvent = new CustomEvent('eip6963:announceProvider', {
            detail: {
                info: event.detail.info,
                provider: proxiedProvider
            }
        });

        setTimeout(() => {
            window.dispatchEvent(clonedEvent);
        }, 0);
    }
}, true); // capture phase

// 2. Intercept legacy window.ethereum
let _ethereum = window.ethereum;

if (_ethereum) {
    _ethereum = proxyProvider(_ethereum, "window.ethereum");
}

Object.defineProperty(window, 'ethereum', {
    get() {
        return _ethereum;
    },
    set(val) {
        console.log("[RiskOracle] Wallet detected via setter, attaching Proxy.");
        _ethereum = proxyProvider(val, "window.ethereum (setter)");
    },
    configurable: true,
    enumerable: true
});

// 3. Fallback for Wagmi/Viem which sometimes cache the raw provider early on window
const _sendAsync = window.ethereum?.sendAsync;
if (window.ethereum && _sendAsync) {
    const originalSendAsync = window.ethereum.sendAsync;
    window.ethereum.sendAsync = function (payload, callback) {
        if (payload.method === 'eth_sendTransaction') {
            console.log("[RiskOracle] Intercepted via sendAsync:", payload);
            // Similar logic could go here for older wallets, but EIP-6963 covers modern ones.
        }
        return originalSendAsync.call(this, payload, callback);
    }
}
