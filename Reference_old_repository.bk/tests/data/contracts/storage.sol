// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private value;
    
    function store(uint256 newValue) public {
        value = newValue;
    }
    
    function retrieve() public view returns (uint256) {
        return value;
    }
}