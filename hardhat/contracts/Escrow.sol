// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Escrow is Initializable {
    using SafeERC20 for IERC20;
    bool private initialized;

    address public client;
    address public talent;
    address public resolver;

    uint256 public fee = 1500;

    // Used to manage voting state
    uint8 private constant RELEASE = 1;
    uint8 private constant REFUND = 2;

    mapping(uint8 => mapping(bytes => uint8)) public votes;
    mapping(uint8 => mapping(bytes => mapping(address => bool)))
        public isConfirmed;

    event Confirmed(address from, address token, uint256 amount, uint8 vote);
    event Released(
        address from,
        address to,
        address token,
        uint256 amount,
        string note
    );
    event Refunded(
        address from,
        address to,
        address token,
        uint256 amount,
        string note
    );
    event Deposit(
        address from,
        address to,
        address token,
        uint256 amount,
        string note
    );

    function init(
        address _client,
        address _provider,
        address _resolver,
        uint256 _fee
    ) external payable initializer {
        require(_client != address(0), "Client address required");
        require(_provider != address(0), "Provider address required");
        require(_resolver != address(0), "Resolver address required");
        require(_fee < 10000, "Fee must be a value of 0 - 99999");
        client = _client;
        talent = _provider;
        resolver = _resolver;

        fee = _fee;

        initialized = true;
    }

    modifier onlyParty() {
        require(
            msg.sender == client ||
                msg.sender == talent ||
                msg.sender == resolver,
            "Sender not part of party"
        );
        _;
    }

    modifier onlyInitialized() {
        require(initialized, "Escrow must be initialized");
        _;
    }

    /// @notice Deposit ERC20 tokens
    /// @param _token ERC20 address to token to be transferred
    /// @param _amount Amount of tokens to transfer
    /// @param _releaseAmount Amount to release
    /// @param _note Note about the deposit
    function deposit(
        address _token,
        uint256 _amount,
        uint256 _releaseAmount,
        string memory _note
    ) external onlyInitialized {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        emit Deposit(msg.sender, talent, _token, _amount, _note);

        if (_releaseAmount > 0) {
            _release(_token, _releaseAmount, _note);
        }
    }

    /// @notice Refunds tokens to client
    function refund(
        address _token,
        uint256 _amount,
        string memory _note
    ) external onlyParty onlyInitialized {
        if (_countVotes(REFUND, _token, _amount)) {
            IERC20(_token).safeTransfer(client, _amount);

            _resetVotes(REFUND, _token, _amount);
            emit Refunded(msg.sender, client, _token, _amount, _note);
        }
    }

    /// @notice Releases tokens to talent and 15% to resolver
    function release(
        address _token,
        uint256 _amount,
        string memory _note
    ) public onlyParty onlyInitialized {
        bool isClient = msg.sender == client;
        if (isClient || _countVotes(RELEASE, _token, _amount)) {
            _release(_token, _amount, _note);
        }
    }

    function _release(
        address _token,
        uint256 _amount,
        string memory _note
    ) internal {
        uint256 resolverShare = _calcShare(_amount);
        IERC20(_token).safeTransfer(resolver, resolverShare); // 15% to resolver
        IERC20(_token).safeTransfer(talent, _amount - resolverShare); // 85% to talent

        _resetVotes(RELEASE, _token, _amount);
        emit Released(msg.sender, talent, _token, _amount, _note);
    }

    /// @notice Counts votes for release or refunds. Each set of token and amount is unique.
    /// @param _type Either REFUND or RELEASE
    /// @param _token ERC20 address to token to be transferred
    /// @param _amount Amount of tokens to transfer
    /// @return True if vote count is a majority (2)
    function _countVotes(
        uint8 _type,
        address _token,
        uint256 _amount
    ) internal returns (bool) {
        bytes memory hash = abi.encodePacked(_token, _amount);
        require(!isConfirmed[_type][hash][msg.sender], "Already confirmed");
        isConfirmed[_type][hash][msg.sender] = true;

        votes[_type][hash] += 1;

        emit Confirmed(msg.sender, _token, _amount, _type);

        return votes[_type][hash] == 2;
    }

    /// @notice Resets the votes for release or refunds. Called after successful transfer of tokens.
    /// @param _type Either REFUND or RELEASE
    /// @param _token ERC20 address to token to be transferred
    /// @param _amount Amount of tokens to transfer
    function _resetVotes(
        uint8 _type,
        address _token,
        uint256 _amount
    ) internal {
        bytes memory hash = abi.encodePacked(_token, _amount);
        votes[_type][hash] = 0;
        isConfirmed[_type][hash][client] = false;
        isConfirmed[_type][hash][talent] = false;
        isConfirmed[_type][hash][resolver] = false;
    }

    function _calcShare(uint256 _amount) internal view returns (uint256) {
        return (_amount / 10_000) * fee;
    }
}
