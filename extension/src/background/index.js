console.log("[RiskOracle Guardian] Background script loaded.");

const pendingTransactions = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_POPUP') {
        const { transactionId, params } = message;
        // Store the transaction details and the tabId that requested it
        pendingTransactions.set(transactionId, { params, senderTabId: sender.tab.id });

        // Calculate standard size to trigger IDKit desktop mode (QR Code)
        const width = 850;
        const height = 750;

        // Open a new popup window
        chrome.windows.create({
            url: chrome.runtime.getURL(`index.html?txId=${transactionId}`),
            type: "popup",
            width,
            height,
            focused: true
        });
        sendResponse({ success: true });
    } else if (message.type === 'GET_PENDING_TX') {
        const txData = pendingTransactions.get(message.txId);
        sendResponse(txData || null);
    } else if (message.type === 'TX_DECISION') {
        const txData = pendingTransactions.get(message.txId);
        if (txData) {
            // Forward decision back to content script
            chrome.tabs.sendMessage(txData.senderTabId, {
                type: 'TX_DECISION_FORWARD',
                transactionId: message.txId,
                approved: message.approved
            });
            pendingTransactions.delete(message.txId);
        }
        sendResponse({ success: true });

        // Close the popup window
        if (sender.tab && sender.tab.windowId) {
            chrome.windows.remove(sender.tab.windowId);
        }
    }
    return true; // Keep message channel open for async response if needed
});
