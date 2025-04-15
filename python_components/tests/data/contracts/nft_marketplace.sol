// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NFTMarketplace {
    struct NFT {
        uint256 id;
        address owner;
        uint256 price;
    }
    
    mapping(uint256 => NFT) public nfts;
    uint256 public nextId;
    
    function mint() external {
        nfts[nextId] = NFT(nextId, msg.sender, 0);
        nextId++;
    }
    
    function list(uint256 id, uint256 price) external {
        require(nfts[id].owner == msg.sender, "Not owner");
        nfts[id].price = price;
    }
    
    function buy(uint256 id) external payable {
        NFT storage nft = nfts[id];
        require(nft.price > 0, "Not for sale");
        require(msg.value >= nft.price, "Insufficient payment");
        
        address seller = nft.owner;
        nft.owner = msg.sender;
        nft.price = 0;
        
        payable(seller).transfer(msg.value);
    }
}