// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DAOPlatform {
    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount;
        bool isActive;
        address creator;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public governanceTokens; // Made public for external access
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    uint256 public proposalCounter;

    event ProposalCreated(uint256 indexed proposalId, string description, address indexed creator);
    event VoteCast(address indexed voter, uint256 indexed proposalId, uint256 voteWeight);
    event ProposalClosed(uint256 indexed proposalId, bool passed);

    modifier onlyTokenHolders() {
        require(governanceTokens[msg.sender] >= 0, "Access restricted to governance token holders");
        _;
    }

    function createProposal(string memory description) public onlyTokenHolders {
        require(bytes(description).length > 0, "Proposal description cannot be empty");

        proposalCounter++;
        proposals[proposalCounter] = Proposal(proposalCounter, description, 0, true, msg.sender);

        emit ProposalCreated(proposalCounter, description, msg.sender);
    }

    function vote(uint256 proposalId) public onlyTokenHolders {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Invalid proposal ID");
        require(proposal.isActive, "Proposal is no longer active");
        require(!hasVoted[msg.sender][proposalId], "You have already voted on this proposal");

        uint256 voteWeight = governanceTokens[msg.sender];
        proposal.voteCount += voteWeight;
        hasVoted[msg.sender][proposalId] = true;

        emit VoteCast(msg.sender, proposalId, voteWeight);
    }

    function closeProposal(uint256 proposalId) public onlyTokenHolders{
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Invalid proposal ID");
        require(proposal.isActive, "Proposal is already closed");
        require(msg.sender == proposal.creator, "Only the creator can close the proposal");

        proposal.isActive = false;
        bool passed = proposal.voteCount > 0; // Simple majority rule

        emit ProposalClosed(proposalId, passed);
    }

    function allocateGovernanceTokens(address recipient, uint256 amount) public onlyTokenHolders{
        require(amount >= 0, "Token allocation must be greater than zero");
        governanceTokens[recipient] += amount;
    }

    // Function to check token balance public
    function getTokenBalance(address user) public view returns (uint256) {
        return governanceTokens[user];
    }
}
