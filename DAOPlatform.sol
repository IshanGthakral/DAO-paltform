// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DAOPlatform {
    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool executed;
        address creator;
    }

    mapping(address => uint256) public governanceTokens;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => address) public voteDelegation;
    uint256 public proposalCounter;
    uint256 public quorumPercentage = 20; // Minimum 20% votes required
    address public owner;

    event ProposalCreated(uint256 indexed proposalId, string description, address indexed creator);
    event VoteCast(address indexed voter, uint256 indexed proposalId, uint256 voteWeight);
    event ProposalClosed(uint256 indexed proposalId, bool passed);
    event ProposalExecuted(uint256 indexed proposalId);
    event TokensAllocated(address indexed recipient, uint256 amount);
    event VoteDelegated(address indexed delegator, address indexed delegatee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProposal(string memory description, uint256 duration) public {
    require(bytes(description).length > 0, "Proposal description cannot be empty");
    require(duration > 0, "Duration must be greater than zero");

    proposalCounter++;
    proposals[proposalCounter] = Proposal({
        id: proposalCounter,
        description: description,
        voteCount: 0,
        startTime: block.timestamp,
        endTime: block.timestamp + duration,
        isActive: true,
        executed: false,
        creator: msg.sender
    });

    emit ProposalCreated(proposalCounter, description, msg.sender);
}


    function vote(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Invalid proposal ID");
        require(proposal.isActive, "Proposal is no longer active");
        require(block.timestamp <= proposal.endTime, "Voting period has ended");
        require(!hasVoted[msg.sender][proposalId], "You have already voted");

        address voter = voteDelegation[msg.sender] == address(0) ? msg.sender : voteDelegation[msg.sender];
        uint256 voteWeight = governanceTokens[voter];
        proposal.voteCount += voteWeight;
        hasVoted[msg.sender][proposalId] = true;

        emit VoteCast(voter, proposalId, voteWeight);
    }

    function delegateVote(address delegatee) public {
        require(delegatee != msg.sender, "Cannot delegate to yourself");
        require(governanceTokens[delegatee] > 0, "Delegatee must hold tokens");
        voteDelegation[msg.sender] = delegatee;

        emit VoteDelegated(msg.sender, delegatee);
    }

    function closeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Invalid proposal ID");
        require(proposal.isActive, "Proposal is already closed");
        require(block.timestamp > proposal.endTime, "Voting period not yet ended");
        require(msg.sender == proposal.creator, "Only the creator can close");

        proposal.isActive = false;
        uint256 totalSupply = getTotalSupply();
        uint256 quorum = (totalSupply * quorumPercentage) / 100;
        bool passed = proposal.voteCount >= quorum;

        emit ProposalClosed(proposalId, passed);
    }

    function executeProposal(uint256 proposalId) public onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Invalid proposal ID");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.isActive, "Proposal must be closed first");

        proposal.executed = true;
        // Add execution logic (e.g., treasury fund transfers, smart contract calls)

        emit ProposalExecuted(proposalId);
    }

    function allocateGovernanceTokens(address recipient, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        governanceTokens[recipient] += amount;
        emit TokensAllocated(recipient, amount);
    }

    function getTokenBalance(address user) public view returns (uint256) {
        return governanceTokens[user];
    }

    function getTotalSupply() public view returns (uint256) {
        uint256 totalSupply;
        for (uint256 i = 1; i <= proposalCounter; i++) {
            totalSupply += governanceTokens[proposals[i].creator];
        }
        return totalSupply;
    }
}
