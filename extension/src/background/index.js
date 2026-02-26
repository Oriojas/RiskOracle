console.log('🛡️ [RiskOracle Guardian] Background Service Worker initialized.');

// Variables para rastrear las ventanas activas temporalmente en memoria
let activePopups = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_POPUP') {
        console.log('⚡ [RiskOracle Guardian Background] OPEN_POPUP request received for Tx:', message.transactionId);
        handleOpenPopup(message);
        // Respuesta rápida no bloqueante
        sendResponse({ status: 'popup_requested' });
    }
});

function handleOpenPopup(message) {
    const transactionId = message.transactionId;
    const payloadStr = encodeURIComponent(JSON.stringify(message.payload || {}));

    // Impedir abrir varios popups por la misma transacción
    if (activePopups[transactionId]) {
        console.log('⚠️ [RiskOracle] Popup already exists for this transaction:', transactionId);
        // Si la ventana ya existe, la podemos enfocar.
        chrome.windows.update(activePopups[transactionId], { focused: true }).catch(err => {
            console.error('Error focusing window', err);
        });
        return;
    }

    // Dimensiones del modal de riesgo
    const popupWidth = 430;
    const popupHeight = 700;

    console.log(`🪟 [RiskOracle] Creating new window popup for Tx ${transactionId}...`);
    chrome.windows.create({
        url: chrome.runtime.getURL(`index.html?type=risk_modal&payload=${payloadStr}&txId=${transactionId}`),
        type: 'popup',
        width: popupWidth,
        height: popupHeight,
        focused: true
    }, (windowInstance) => {
        if (chrome.runtime.lastError) {
            console.error('❌ [RiskOracle] Failed opening popup window:', chrome.runtime.lastError.message);
            return;
        }

        // Registrar la ventana creada
        activePopups[transactionId] = windowInstance.id;
        console.log(`✅ [RiskOracle] Window opened with ID: ${windowInstance.id}`);
    });
}

// Limpiar estados cuando una ventana (popup) se cierre para no colgar estado en memoria
chrome.windows.onRemoved.addListener((windowId) => {
    for (const [txId, id] of Object.entries(activePopups)) {
        if (id === windowId) {
            console.log('🧹 [RiskOracle] Popup for Tx', txId, 'was closed. Cleaning up.');
            delete activePopups[txId];
            break;
        }
    }
});
