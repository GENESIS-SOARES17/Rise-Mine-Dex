// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IERC20.sol";

/**
 * @title FeePool
 * @dev Public fee pool that collects swap fees and distributes rewards to prediction winners
 */
contract FeePool {
    address public owner;
    address public ammContract;
    address public predictionContract;
    
    // Token balances in the pool
    mapping(address => uint256) public poolBalances;
    
    // Allowed tokens
    mapping(address => bool) public allowedTokens;
    address[] public tokenList;
    
    // Events
    event FeeDeposited(address indexed token, uint256 amount, address indexed from);
    event RewardDistributed(address indexed winner, address indexed token, uint256 amount);
    event TokenAdded(address indexed token);
    event ContractUpdated(string contractType, address newAddress);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == ammContract || 
            msg.sender == predictionContract || 
            msg.sender == owner,
            "Not authorized"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add a token to the allowed list
     */
    function addAllowedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!allowedTokens[token], "Token already added");
        
        allowedTokens[token] = true;
        tokenList.push(token);
        
        emit TokenAdded(token);
    }
    
    /**
     * @dev Set the AMM contract address
     */
    function setAMMContract(address _amm) external onlyOwner {
        require(_amm != address(0), "Invalid address");
        ammContract = _amm;
        emit ContractUpdated("AMM", _amm);
    }
    
    /**
     * @dev Set the Prediction contract address
     */
    function setPredictionContract(address _prediction) external onlyOwner {
        require(_prediction != address(0), "Invalid address");
        predictionContract = _prediction;
        emit ContractUpdated("Prediction", _prediction);
    }
    
    /**
     * @dev Deposit fees into the pool (called by AMM on swaps)
     */
    function depositFee(address token, uint256 amount) external onlyAuthorized {
        require(allowedTokens[token], "Token not allowed");
        require(amount > 0, "Amount must be > 0");
        
        // Transfer tokens from sender
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        poolBalances[token] += amount;
        
        emit FeeDeposited(token, amount, msg.sender);
    }
    
    /**
     * @dev Direct deposit (for manual deposits)
     */
    function deposit(address token, uint256 amount) external {
        require(allowedTokens[token], "Token not allowed");
        require(amount > 0, "Amount must be > 0");
        
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        poolBalances[token] += amount;
        
        emit FeeDeposited(token, amount, msg.sender);
    }
    
    /**
     * @dev Get pool balance for a token
     */
    function getPoolBalance(address token) external view returns (uint256) {
        return poolBalances[token];
    }
    
    /**
     * @dev Distribute 10% of pool balance to prediction winner
     */
    function distributeReward(address winner, address token) external onlyAuthorized returns (uint256) {
        require(winner != address(0), "Invalid winner");
        require(allowedTokens[token], "Token not allowed");
        
        uint256 poolBalance = poolBalances[token];
        if (poolBalance == 0) return 0;
        
        // Calculate 10% reward
        uint256 reward = poolBalance / 10;
        
        if (reward > 0) {
            poolBalances[token] -= reward;
            require(IERC20(token).transfer(winner, reward), "Transfer failed");
            
            emit RewardDistributed(winner, token, reward);
        }
        
        return reward;
    }
    
    /**
     * @dev Get all pool balances
     */
    function getAllPoolBalances() external view returns (address[] memory tokens, uint256[] memory balances) {
        uint256 length = tokenList.length;
        tokens = new address[](length);
        balances = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            tokens[i] = tokenList[i];
            balances[i] = poolBalances[tokenList[i]];
        }
        
        return (tokens, balances);
    }
    
    /**
     * @dev Get token list
     */
    function getTokenList() external view returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(poolBalances[token] >= amount, "Insufficient balance");
        poolBalances[token] -= amount;
        require(IERC20(token).transfer(owner, amount), "Transfer failed");
    }
}
