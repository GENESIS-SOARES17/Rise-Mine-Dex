// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IERC20.sol";
import "./FeePool.sol";

/**
 * @title PredictionMarket
 * @dev Prediction market for token price movements
 * Users bet on whether price will go up or down within a time period
 */
contract PredictionMarket {
    address public owner;
    FeePool public feePool;
    address public priceOracle; // Address authorized to submit prices
    
    // Bet structure
    struct Bet {
        address user;
        address token;
        uint256 amount;
        uint256 initialPrice;
        uint256 finalPrice;
        uint256 startTime;
        uint256 endTime;
        bool predictUp; // true = price goes up, false = price goes down
        BetStatus status;
    }
    
    enum BetStatus {
        Active,
        Won,
        Lost,
        Cancelled
    }
    
    // Allowed tokens for betting
    mapping(address => bool) public allowedTokens;
    address[] public tokenList;
    
    // Current prices (updated by oracle)
    mapping(address => uint256) public currentPrices;
    mapping(address => uint256) public lastPriceUpdate;
    
    // Bets
    mapping(uint256 => Bet) public bets;
    uint256 public betCounter;
    
    // User bets
    mapping(address => uint256[]) public userBets;
    
    // Limits
    uint256 public minBetAmount = 1e15; // 0.001 tokens
    uint256 public maxBetAmount = 1000e18; // 1000 tokens
    uint256 public minDuration = 60; // 1 minute
    uint256 public maxDuration = 86400; // 24 hours
    
    // Statistics
    uint256 public totalBets;
    uint256 public totalVolume;
    uint256 public activeBets;
    
    // Events
    event BetPlaced(uint256 indexed betId, address indexed user, address token, uint256 amount, bool predictUp, uint256 duration);
    event BetResolved(uint256 indexed betId, address indexed user, bool won, uint256 reward);
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event TokenAdded(address indexed token);
    
    // Reentrancy guard
    bool private locked;
    modifier nonReentrant() {
        require(!locked, "Reentrancy");
        locked = true;
        _;
        locked = false;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == priceOracle || msg.sender == owner, "Only oracle");
        _;
    }
    
    constructor(address _feePool) {
        owner = msg.sender;
        priceOracle = msg.sender;
        feePool = FeePool(_feePool);
    }
    
    /**
     * @dev Add allowed token for betting
     */
    function addAllowedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!allowedTokens[token], "Token already added");
        
        allowedTokens[token] = true;
        tokenList.push(token);
        
        emit TokenAdded(token);
    }
    
    /**
     * @dev Set price oracle address
     */
    function setPriceOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid address");
        priceOracle = _oracle;
    }
    
    /**
     * @dev Update token price (called by oracle)
     */
    function updatePrice(address token, uint256 price) external onlyOracle {
        require(allowedTokens[token], "Token not allowed");
        require(price > 0, "Invalid price");
        
        currentPrices[token] = price;
        lastPriceUpdate[token] = block.timestamp;
        
        emit PriceUpdated(token, price, block.timestamp);
    }
    
    /**
     * @dev Batch update prices
     */
    function updatePrices(address[] calldata tokens, uint256[] calldata prices) external onlyOracle {
        require(tokens.length == prices.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (allowedTokens[tokens[i]] && prices[i] > 0) {
                currentPrices[tokens[i]] = prices[i];
                lastPriceUpdate[tokens[i]] = block.timestamp;
                emit PriceUpdated(tokens[i], prices[i], block.timestamp);
            }
        }
    }
    
    /**
     * @dev Place a prediction bet
     */
    function placeBet(
        address token,
        uint256 amount,
        bool predictUp,
        uint256 duration
    ) external nonReentrant returns (uint256 betId) {
        require(allowedTokens[token], "Token not allowed");
        require(amount >= minBetAmount && amount <= maxBetAmount, "Invalid amount");
        require(duration >= minDuration && duration <= maxDuration, "Invalid duration");
        require(currentPrices[token] > 0, "Price not available");
        require(block.timestamp - lastPriceUpdate[token] < 3600, "Price too old");
        
        // Transfer bet amount
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        betId = betCounter++;
        
        bets[betId] = Bet({
            user: msg.sender,
            token: token,
            amount: amount,
            initialPrice: currentPrices[token],
            finalPrice: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            predictUp: predictUp,
            status: BetStatus.Active
        });
        
        userBets[msg.sender].push(betId);
        totalBets++;
        totalVolume += amount;
        activeBets++;
        
        emit BetPlaced(betId, msg.sender, token, amount, predictUp, duration);
        
        return betId;
    }
    
    /**
     * @dev Resolve a bet after duration ends
     */
    function resolveBet(uint256 betId) external nonReentrant {
        Bet storage bet = bets[betId];
        require(bet.status == BetStatus.Active, "Bet not active");
        require(block.timestamp >= bet.endTime, "Bet not ended");
        require(currentPrices[bet.token] > 0, "Price not available");
        
        bet.finalPrice = currentPrices[bet.token];
        
        bool priceWentUp = bet.finalPrice > bet.initialPrice;
        bool won = (bet.predictUp && priceWentUp) || (!bet.predictUp && !priceWentUp);
        
        uint256 reward = 0;
        
        if (won) {
            bet.status = BetStatus.Won;
            
            // Return bet amount
            require(IERC20(bet.token).transfer(bet.user, bet.amount), "Transfer failed");
            
            // Get 10% from fee pool
            reward = feePool.distributeReward(bet.user, bet.token);
        } else {
            bet.status = BetStatus.Lost;
            
            // Send bet amount to fee pool
            IERC20(bet.token).approve(address(feePool), bet.amount);
            feePool.depositFee(bet.token, bet.amount);
        }
        
        activeBets--;
        
        emit BetResolved(betId, bet.user, won, reward);
    }
    
    /**
     * @dev Cancel bet (only before it ends, with penalty)
     */
    function cancelBet(uint256 betId) external nonReentrant {
        Bet storage bet = bets[betId];
        require(bet.user == msg.sender, "Not your bet");
        require(bet.status == BetStatus.Active, "Bet not active");
        require(block.timestamp < bet.endTime, "Bet already ended");
        
        bet.status = BetStatus.Cancelled;
        
        // Return 90% (10% penalty goes to fee pool)
        uint256 penalty = bet.amount / 10;
        uint256 refund = bet.amount - penalty;
        
        if (penalty > 0) {
            IERC20(bet.token).approve(address(feePool), penalty);
            feePool.depositFee(bet.token, penalty);
        }
        
        require(IERC20(bet.token).transfer(msg.sender, refund), "Transfer failed");
        
        activeBets--;
        
        emit BetResolved(betId, msg.sender, false, 0);
    }
    
    /**
     * @dev Get bet info
     */
    function getBet(uint256 betId) external view returns (
        address user,
        address token,
        uint256 amount,
        uint256 initialPrice,
        uint256 finalPrice,
        uint256 startTime,
        uint256 endTime,
        bool predictUp,
        BetStatus status
    ) {
        Bet storage bet = bets[betId];
        return (
            bet.user,
            bet.token,
            bet.amount,
            bet.initialPrice,
            bet.finalPrice,
            bet.startTime,
            bet.endTime,
            bet.predictUp,
            bet.status
        );
    }
    
    /**
     * @dev Get user's bets
     */
    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }
    
    /**
     * @dev Get active bets count
     */
    function getActiveBetsCount() external view returns (uint256) {
        return activeBets;
    }
    
    /**
     * @dev Get token price
     */
    function getPrice(address token) external view returns (uint256 price, uint256 lastUpdate) {
        return (currentPrices[token], lastPriceUpdate[token]);
    }
    
    /**
     * @dev Get all allowed tokens
     */
    function getAllowedTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Update bet limits
     */
    function updateLimits(
        uint256 _minBet,
        uint256 _maxBet,
        uint256 _minDuration,
        uint256 _maxDuration
    ) external onlyOwner {
        minBetAmount = _minBet;
        maxBetAmount = _maxBet;
        minDuration = _minDuration;
        maxDuration = _maxDuration;
    }
    
    /**
     * @dev Set fee pool
     */
    function setFeePool(address _feePool) external onlyOwner {
        require(_feePool != address(0), "Invalid address");
        feePool = FeePool(_feePool);
    }
}
