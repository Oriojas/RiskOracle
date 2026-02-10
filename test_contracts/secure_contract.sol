// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCounter {
    uint256 public count;

    // Function to increment the counter by 1
    function increment() public {
        count += 1;
    }
}
