// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IUSDC {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

/// @title ArcHoldEscrow
/// @notice A deadline-aware, two-party USDC milestone escrow for Arc Testnet.
contract ArcHoldEscrow {
    enum Status { Funded, Delivered, Released, Refunded }

    struct Delivery {
        uint64 submittedAt;
        uint64 claimableAt;
        string proofUri;
    }

    struct Escrow {
        address payer;
        address payee;
        uint256 amount;
        uint64 deadline;
        Status status;
        string description;
    }

    uint256 public constant MAX_DESCRIPTION_BYTES = 160;
    uint256 public constant MAX_PROOF_URI_BYTES = 240;
    uint256 public constant MAX_PAGE_SIZE = 50;
    uint256 public constant CONTRACT_VERSION = 3;
    uint64 public constant REVIEW_PERIOD = 2 days;

    IUSDC public immutable usdc;
    uint256 public nextEscrowId;
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Delivery) public deliveries;
    mapping(address => uint256[]) private partyEscrowIds;
    mapping(address => uint256) public activeValueByParty;

    uint256 private locked = 1;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint64 deadline,
        string description
    );
    event EscrowReleased(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event DeliverySubmitted(uint256 indexed escrowId, address indexed payee, string proofUri);

    error InvalidToken();
    error InvalidPayee();
    error InvalidAmount();
    error InvalidDeadline();
    error DescriptionTooLong();
    error InvalidProofUri();
    error DeliveryLate();
    error DeliveryAlreadySubmitted();
    error NotPayer();
    error NotPayee();
    error DeliveryRequired();
    error ReviewPending();
    error InvalidPageSize();
    error RefundNotAllowed();
    error NotActive();
    error TransferFailed();
    error ReentrantCall();

    modifier nonReentrant() {
        if (locked != 1) revert ReentrantCall();
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address usdcAddress) {
        if (usdcAddress == address(0) || usdcAddress.code.length == 0) revert InvalidToken();
        usdc = IUSDC(usdcAddress);
    }

    function createEscrow(
        address payee,
        uint256 amount,
        uint64 deadline,
        string calldata description
    ) external nonReentrant returns (uint256 escrowId) {
        if (payee == address(0) || payee == msg.sender) revert InvalidPayee();
        if (amount == 0) revert InvalidAmount();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (bytes(description).length == 0 || bytes(description).length > MAX_DESCRIPTION_BYTES) {
            revert DescriptionTooLong();
        }

        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            deadline: deadline,
            status: Status.Funded,
            description: description
        });
        partyEscrowIds[msg.sender].push(escrowId);
        partyEscrowIds[payee].push(escrowId);
        activeValueByParty[msg.sender] += amount;
        activeValueByParty[payee] += amount;

        if (!usdc.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        emit EscrowCreated(escrowId, msg.sender, payee, amount, deadline, description);
    }

    function release(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payer) revert NotPayer();
        if (escrow.status != Status.Delivered) revert DeliveryRequired();
        if (deliveries[escrowId].submittedAt == 0) revert DeliveryRequired();

        _release(escrowId, escrow);
    }

    /// @notice The contractor records a public proof link before the payer can release payment.
    function submitDelivery(uint256 escrowId, string calldata proofUri) external {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payee) revert NotPayee();
        if (escrow.status != Status.Funded) {
            if (deliveries[escrowId].submittedAt != 0) revert DeliveryAlreadySubmitted();
            revert NotActive();
        }
        if (block.timestamp > escrow.deadline) revert DeliveryLate();
        if (bytes(proofUri).length == 0 || bytes(proofUri).length > MAX_PROOF_URI_BYTES) {
            revert InvalidProofUri();
        }

        uint64 submittedAt = uint64(block.timestamp);
        deliveries[escrowId] = Delivery({
            submittedAt: submittedAt,
            claimableAt: submittedAt + REVIEW_PERIOD,
            proofUri: proofUri
        });
        escrow.status = Status.Delivered;
        emit DeliverySubmitted(escrowId, msg.sender, proofUri);
    }

    /// @notice The contractor may claim payment if the payer does not release it during review.
    function claim(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payee) revert NotPayee();
        if (escrow.status != Status.Delivered) revert DeliveryRequired();
        if (block.timestamp < deliveries[escrowId].claimableAt) revert ReviewPending();

        _release(escrowId, escrow);
    }

    /// @notice The payee may return funds at any time; the payer may reclaim only after the deadline.
    function refund(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        bool payeeReturnsFunds = msg.sender == escrow.payee;
        bool payerAfterDeadline = msg.sender == escrow.payer
            && escrow.status == Status.Funded
            && block.timestamp > escrow.deadline;
        if (!payeeReturnsFunds && !payerAfterDeadline) revert RefundNotAllowed();
        if (escrow.status != Status.Funded && escrow.status != Status.Delivered) revert NotActive();

        escrow.status = Status.Refunded;
        _deactivate(escrow);
        if (!usdc.transfer(escrow.payer, escrow.amount)) revert TransferFailed();
        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    function getEscrowIds(address party) external view returns (uint256[] memory) {
        return partyEscrowIds[party];
    }

    function getEscrowCount(address party) external view returns (uint256) {
        return partyEscrowIds[party].length;
    }

    function getEscrowIdsPage(
        address party,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory page) {
        if (limit == 0 || limit > MAX_PAGE_SIZE) revert InvalidPageSize();
        uint256 length = partyEscrowIds[party].length;
        if (offset >= length) return new uint256[](0);

        uint256 end = offset + limit;
        if (end > length) end = length;
        page = new uint256[](end - offset);
        for (uint256 i; i < page.length; ++i) {
            page[i] = partyEscrowIds[party][offset + i];
        }
    }

    function contractVersion() external pure returns (uint256) {
        return CONTRACT_VERSION;
    }

    function _release(uint256 escrowId, Escrow storage escrow) private {
        escrow.status = Status.Released;
        _deactivate(escrow);
        if (!usdc.transfer(escrow.payee, escrow.amount)) revert TransferFailed();
        emit EscrowReleased(escrowId, escrow.payee, escrow.amount);
    }

    function _deactivate(Escrow storage escrow) private {
        activeValueByParty[escrow.payer] -= escrow.amount;
        activeValueByParty[escrow.payee] -= escrow.amount;
    }
}
