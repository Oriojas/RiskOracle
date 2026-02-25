console.log("[RiskOracle Guardian] Content script loaded (Relay Mode).");

// Listen for messages from the isolated inpage script
window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.type !== 'RISK_ORACLE_INTERCEPT') return;

    chrome.storage.local.get(['guardianEnabled'], (result) => {
        if (result.guardianEnabled === false) {
            // Disabled: Auto-approve without popup
            window.postMessage({
                type: 'RISK_ORACLE_RESPONSE',
                transactionId: event.data.transactionId,
                approved: true
            }, '*');
            return;
        }

        console.log("[RiskOracle Content] Forwarding intercept request to background:", event.data);

        chrome.runtime.sendMessage({
            type: 'OPEN_POPUP',
            transactionId: event.data.transactionId,
            params: event.data.params
        });
    });
});

// Listen for the decision from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TX_DECISION_FORWARD') {
        console.log("[RiskOracle Content] Received decision from background, forwarding to inpage:", message);
        window.postMessage({
            type: 'RISK_ORACLE_RESPONSE',
            transactionId: message.transactionId,
            approved: message.approved
        }, '*');
    }
});
