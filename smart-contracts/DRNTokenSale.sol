pragma solidity ^0.8.20;
import "./DRNToken.sol";

contract DRNTokenSale {
    address public admin;
    DRNToken public token;
    uint public pricePerToken;
    mapping(address => bool) public kycPassed;

    event TokenPurchased(address buyer, uint amount);

    constructor(address tokenAddress, uint price) {
        admin = msg.sender;
        token = DRNToken(tokenAddress);
        pricePerToken = price;
    }

    function setKYC(address user, bool passed) external {
        require(msg.sender == admin, "Only admin");
        kycPassed[user] = passed;
    }

    function buyTokens() external payable {
        require(kycPassed[msg.sender], "KYC not passed");
        uint tokenAmount = msg.value / pricePerToken;
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens");
        token.transfer(msg.sender, tokenAmount);
        emit TokenPurchased(msg.sender, tokenAmount);
    }
}
