 Here's a simple Solidity contract in version 0.8.0:
```solidity
// Hello World Contract
contract HelloWorld {
    // Constructor that sets the name of the contract
    function HelloWorld(string name) {
        addr = this; 
        name = name;
    }
    
    // Function to return the address of the contract
    function getAddress() returns (address) {
        return addr;
    }
    
    // Function to return the name of the contract
    function getName() returns (string) {
        return name;
    }
}
```

This is a basic contract that has a constructor that takes in a string `name` and stores it. 
It also has two functions: `getAddress()` and `getName()`. The first one returns the address of the contract, and the second returns the name that was passed to the constructor.

This is a simple contract that can be used for learning purposes and can be modified to suit your needs. 

If you'd like to test this contract, you can compile it using the Solidity compiler and then deploy it on a test network like Rinkeby or Kovan to interact with it using a tool like Truffle. Remember to consult documentation and updates for the newest version of Solidity to ensure you are operating with the latest security and functionality enhancements. 