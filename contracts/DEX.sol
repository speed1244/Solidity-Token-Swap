pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DEX Contract
 * @notice A basic decentralized exchange for trading ERC20 tokens with ETH
 * @dev This contract allows owner to list tokens for sale at fixed prices
 */
contract DEX {
    IERC20 public associatedToken;

    uint256 price;
    address owner;

    mapping(address => uint256) public tokenPrices;
    address[] public supportedTokens;

    constructor(IERC20 _token, uint256 _price) {
        associatedToken = _token;
        owner = msg.sender;
        price = _price;

        tokenPrices[address(_token)] = _price;
        supportedTokens.push(address(_token));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you are not the owner");
        _;
    }

    function addToken(address _token, uint256 _price) external onlyOwner {
        require(_token != address(0), "invalid token address");
        require(_price > 0, "price must be greater than zero");
        require(tokenPrices[_token] == 0, "token already exists");

        tokenPrices[_token] = _price;
        supportedTokens.push(_token);
    }
    /**
     * @dev Transfers pre-approved tokens from owner to DEX contract for trading inventory
     * @notice Owner must first approve tokens to this contract before calling this function
     *
     * Requirements:
     * - Only contract owner can call this function
     * - Owner must have approved tokens to this contract (allowance > 0)
     *
     * Effects:
     * - Transfers all approved tokens from owner to DEX contract
     * - Increases DEX token inventory for purchases
     *
     * @custom:security Requires prior ERC20 approval transaction
     */
    function sell() external onlyOwner {
        uint256 allowance = associatedToken.allowance(
            msg.sender,
            address(this)
        );
        require(
            allowance > 0,
            "you must allow this contract access to at least one token"
        );
        bool sent = associatedToken.transferFrom(
            msg.sender,
            address(this),
            allowance
        );
        require(sent, "failed to send");
    }

    /**
     * @dev Allows owner to withdraw all tokens from DEX contract
     * @notice Removes all token inventory from the DEX
     *
     * Requirements:
     * - Only owner can call this function
     *
     * Effects:
     * - Transfers all tokens to owner
     * - Reduces DEX inventory to zero
     */
    function withdrawTokens() external onlyOwner {
        uint256 balance = associatedToken.balanceOf(address(this));
        associatedToken.transfer(msg.sender, balance);
    }

    /**
     * @dev Allows owner to withdraw all ETH revenue from the contract
     * @notice Withdraws all accumulated ETH from token sales
     *
     * Requirements:
     * - Only owner can call this function
     *
     * Effects:
     * - Transfers all ETH to owner
     * - Resets contract ETH balance to zero
     *
     * @custom:security Uses low-level call for ETH transfer
     */
    function withdrawFunds() external onlyOwner {
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent);
    }

    function getPrice(uint256 numTokens) public view returns (uint256) {
        return numTokens * price;
    }

    /**
     * @dev Allows users to purchase tokens with ETH at fixed price
     * @notice Send exact ETH amount to buy specified number of tokens
     * @param numTokens Number of tokens to purchase
     *
     * Requirements:
     * - DEX must have sufficient token inventory
     * - Sent ETH must exactly match required payment
     *
     * Effects:
     * - Transfers tokens to buyer
     * - Accepts ETH payment to contract
     */
    function buy(uint256 numTokens) external payable {
        require(numTokens <= getTokenBalance(), "not enough tokens");
        uint256 priceForTokens = getPrice(numTokens);
        require(msg.value == priceForTokens, "invalid value sent");

        associatedToken.transfer(msg.sender, numTokens);
    }

    function getTokenBalance() public view returns (uint256) {
        return associatedToken.balanceOf(address(this));
    }
}
