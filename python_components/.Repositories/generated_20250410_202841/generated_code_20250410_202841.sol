 Here's a simple Solidity contract in version 0.8.19:
```solidity
// Welcome to Solidity!
// This is a simple contract to demonstrate some of the language features.

pragma solidity >=0.0.0;  

// This is a using directive to bring symbols into scope from other libraries
using X;

// This is a library that we are using, and it is part of the compiler's standard library.
// There are many other libraries that you can use as well!

contract SimpleStorage {

    // This is a constructor, it runs when a new instance of the contract is created
    // It takes an argument, which is of type int, and assigns it to an instance variable `storedData'

    constructor(int initialValue) public {
        storedData = initialValue;
    }

    // This is a function, a piece of code that can be called from elsewhere
    // It returns a value of type int, and takes no arguments
    function get() public view returns (int) {
        return storedData;
    }

    // This is the modifier 'onlyOwner', it is meant to ensure that a function can only
    // be called by a particular address, referred to as the 'owner' of the contract instance.
    // In this case, the owner is the address that deployed the contract (i.e. msg.sender)

    modifier onlyOwner {
        require(msg.sender == ownerAddress);
        _;
    }

    // This is a variable, 'ownerAddress', that is meant to represent the address that created
    // this instance of the contract.  It is of type address, an uncommon type in Solidity that
    // represents a 20-byte address.

    address ownerAddress;

    // Here is a function that uses the 'onlyOwner' modifier to ensure that only the owner
    // can call it.  It changes the value stored in the contract, which is a common operation
    // in smart contracts that implement some kind of bank.  The function takes an 'amount'
    // of type int, which is the amount to add to the stored value.

    function changeStoredData(int amount) onlyOwner {
        storedData += amount;
    }
}

```
This is a straightforward example of a Solidity contract that creates a simple storage contract with a constructor that takes an initial value and a function to get