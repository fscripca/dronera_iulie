// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract DRNToken is ERC20 {
    address public admin;
    constructor() ERC20("DRONE", "DRN") {
        admin = msg.sender;
        _mint(msg.sender, 100_000_000 * 1e18);
    }
}
