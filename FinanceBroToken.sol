// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FinanceBroToken is ERC20, Ownable {
    uint256 public constant TOKENS_PER_ETH = 1000;
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens

    constructor() ERC20("FinanceBro", "FBT") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function buyTokens() public payable {
        require(msg.value > 0, "ETH amount must be greater than 0");
        uint256 tokenAmount = msg.value * TOKENS_PER_ETH;
        require(balanceOf(owner()) >= tokenAmount, "Insufficient token balance");
        _transfer(owner(), msg.sender, tokenAmount);
    }

    function sellTokens(uint256 tokenAmount) public {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        uint256 ethAmount = tokenAmount / TOKENS_PER_ETH;
        require(address(this).balance >= ethAmount, "Insufficient ETH balance in contract");
        
        _transfer(msg.sender, owner(), tokenAmount);
        payable(msg.sender).transfer(ethAmount);
    }

    // Allow contract to receive ETH
    receive() external payable {}
} 