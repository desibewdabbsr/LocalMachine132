 Here's an example of a simple Solidity contract written in version 0.8.0:
```solidity
pragma solidity >=0.0.0;

contract SimpleStorage {

    // We declare state variables as `public` to make them accessible outside this contract.
    // State variables are persistent and stored in the blockchain.
    public uint storedData;

    // Event to emit when the stored data is updated
    event Updated(uint newData);

    // Constructor to set the initial value of storedData
    constructor(uint initVal) public {
        storedData = initVal;
        emit Updated(storedData);
    }

    // Function to update the stored data
    function set(uint newData) public {
        storedData = newData;
        emit Updated(newData);
    }

    // Function to get the current value of storedData
    function get() public view returns (uint) {
        return storedData;
    }

}
```

This contract behaves as a simple key-value store, where 'storedData' is the key and the value it holds represents some piece of data you want to store. The 'Updated' event is fired whenever a new value is saved into the contract, and 'set' is the method used to change the stored data, while 'get' is used to retrieve it.

This is a minimalist example, but it should give you a good starting point for developing your own smart contracts with Solidity version 0.8.0. Feel free to modify and expand upon it according to your specific needs. 

Please note that this example does not implement any functions to safeguard against unexpected crashes or malicious behavior. In practice, smart contract development should include robust security features to protect against economic losses. 