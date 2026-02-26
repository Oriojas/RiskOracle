console.log('[RiskOracle] INPAGE SCRIPT INITIALIZED in MAIN world. Injecting Provider Proxy...');

function injectProxy() {
    function createNoBlockingProxy(provider) {
        if (!provider || provider.__riskOracleProxied) return provider;

        try {
            const proxy = new Proxy(provider, {
                get(target, prop, receiver) {
                    if (prop === '__riskOracleProxied') return true;

                    const originalValue = Reflect.get(target, prop, receiver);

                    // Interceptar los tres métodos clásicos
                    if (['request', 'send', 'sendAsync'].includes(prop) && typeof originalValue === 'function') {
                        return function (...args) {
                            try {
                                const payload = args[0];
                                // Validar si es una transacción
                                if (payload && typeof payload === 'object' && payload.method === 'eth_sendTransaction') {
                                    const transactionId = crypto.randomUUID();
                                    console.log('🚀 [RiskOracle Guardian] eth_sendTransaction interceptada en paralelo:', transactionId);

                                    // Enviar el mensaje para nuestra extensión de forma asíncrona
                                    window.postMessage({
                                        type: 'RISK_ORACLE_INTERCEPT',
                                        payload: payload,
                                        transactionId
                                    }, '*');
                                }
                            } catch (e) {
                                console.error('[RiskOracle Guardian] Error intercepting request', e);
                            }

                            // === DEVOLVER LA PROMESA ORIGINAL SIN ESPERAR (NO-BLOQUEANTE) ===
                            return originalValue.apply(target, args);
                        };
                    }
                    // Bindear el 'this' para que las llamadas internas no fallen (ej: provider.on)
                    return typeof originalValue === 'function' ? originalValue.bind(target) : originalValue;
                }
            });
            return proxy;
        } catch (e) {
            console.error('[RiskOracle Guardian] failed to create proxy', e);
            return provider;
        }
    }

    // Estrategia 1: Interceptar EIP-6963 (Announce Provider)
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function (eventName, handler, options) {
        if (eventName === 'eip6963:announceProvider') {
            const proxiedHandler = function (event) {
                if (event.detail && event.detail.provider && !event.detail.provider.__riskOracleProxied) {
                    console.log('🛡️ [RiskOracle Guardian] Wrapping EIP-6963 Provider:', event.detail.info?.name);
                    const originalDetail = event.detail;
                    const proxiedProvider = createNoBlockingProxy(originalDetail.provider);

                    // Sobrescribir el detalle para los listeners que lo reciban
                    Object.defineProperty(event, 'detail', {
                        get() {
                            return { ...originalDetail, provider: proxiedProvider };
                        }
                    });
                }
                return handler(event);
            };
            return originalAddEventListener.call(this, eventName, proxiedHandler, options);
        }
        return originalAddEventListener.call(this, eventName, handler, options);
    };

    // Estrategia 2: Proveedor Legacy de window.ethereum
    let _ethereum = window.ethereum;
    if (_ethereum) {
        console.log('🛡️ [RiskOracle Guardian] Wrapping legacy window.ethereum (already present)');
        window.ethereum = createNoBlockingProxy(_ethereum);
    }

    // Atrapar la inyección tardía de window.ethereum
    let desc = Object.getOwnPropertyDescriptor(window, 'ethereum');
    if (!desc || desc.configurable) {
        Object.defineProperty(window, 'ethereum', {
            get() {
                return _ethereum;
            },
            set(val) {
                if (val && !val.__riskOracleProxied) {
                    console.log('🛡️ [RiskOracle Guardian] Wrapping legacy window.ethereum (late injection)');
                    _ethereum = createNoBlockingProxy(val);
                } else {
                    _ethereum = val;
                }
            },
            configurable: true
        });
    }
}

// Inicializar el Proxy inmediatamente al cargar el MAIN world script
injectProxy();
