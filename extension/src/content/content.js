console.log('🛡️ [RiskOracle Guardian] Content script loaded. Listening for intercepts in ISOLATED world.');

window.addEventListener('message', (event) => {
    // Validar mensaje entrante desde el window.postMessage de inpage-init.js
    if (event.source !== window || !event.data || event.data.type !== 'RISK_ORACLE_INTERCEPT') {
        return;
    }

    console.log('📢 [RiskOracle Guardian] Intercept received in content script:', event.data.transactionId);

    // Consultar estado de la aplicación
    chrome.storage.local.get(['guardianEnabled'], (result) => {
        const isEnabled = result.guardianEnabled !== false; // Activo por defecto

        if (isEnabled) {
            console.log('⚡ [RiskOracle Guardian] Sending request to Background to open RiskModal');
            chrome.runtime.sendMessage({
                type: 'OPEN_POPUP',
                payload: event.data.payload,
                transactionId: event.data.transactionId
            }, (response) => {
                // Verificar si hubo error enviando el mensaje al Service Worker
                if (chrome.runtime.lastError) {
                    console.error('❌ [RiskOracle Guardian] Error sending message to background:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ [RiskOracle Guardian] Background acknowledged:', response);
                }
            });
        } else {
            console.log('⏸️ [RiskOracle Guardian] Intercept ignored. Guardian is disabled by user.');
        }
    });
});
