import { useState, useEffect } from "react";
import { ethers } from "ethers";
import DAOPlatformAbi from "../artifacts/contracts/DAOPlatform.sol/DAOPlatform.json";

export default function DAOPlatform({ provider }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalDuration, setProposalDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [proposals, setProposals] = useState([]);
  

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const DAOPlatformABI = DAOPlatformAbi.abi;

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      const contractInstance = new ethers.Contract(contractAddress, DAOPlatformABI, signer);
      setContract(contractInstance);
      fetchProposals(contractInstance);
    } else {
      alert("MetaMask is required to use this application.");
    }
  };

  const createProposal = async () => {
    if (!proposalDescription) return alert("Proposal description cannot be empty");
    if (!proposalDuration || proposalDuration <= 0) return alert("Proposal duration must be greater than zero");

    try {
      setLoading(true);

      // Make sure to convert duration to an integer if it's passed as a string
      const durationInSeconds = parseInt(proposalDuration);

      const tx = await contract.createProposal(proposalDescription, durationInSeconds); // Pass both parameters (description and duration)
      await tx.wait(); // Wait for the transaction to be mined
      setProposalDescription(""); // Clear description input after successful proposal creation
      setProposalDuration(""); // Clear duration input after successful proposal creation
      fetchProposals(contract); // Fetch updated proposals list
    } catch (error) {
      console.error("Error creating proposal:", error);
    } finally {
      setLoading(false);
    }
};


  const voteOnProposal = async () => {
    if (!proposalId) return alert("Enter a valid Proposal ID");
    try {
      setLoading(true);
      const id = parseInt(proposalId);
      const tx = await contract.voteOnProposal(id);
      await tx.wait();
      fetchProposals(contract);
    } catch (error) {
      console.error("Error voting on proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeProposal = async () => {
    if (!proposalId) return alert("Enter a valid Proposal ID");
    try {
      setLoading(true);
      const id = parseInt(proposalId);
      const tx = await contract.closeProposal(id);
      await tx.wait();
      fetchProposals(contract);
    } catch (error) {
      console.error("Error closing proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async (contractInstance) => {
    try {
      setLoading(true);
      const count = await contractInstance.getProposalCount();
      let fetchedProposals = [];
      for (let i = 0; i < count; i++) {
        const proposal = await contractInstance.proposals(i);
        fetchedProposals.push({
          id: i,
          description: proposal.description,
          votes: proposal.votes.toString(),
          executed: proposal.executed,
        });
      }
      setProposals(fetchedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>DAO Platform</h1>
        {account && <p>Connected Wallet: {account}</p>}
      </header>
      <form onSubmit={(e) => { e.preventDefault(); createProposal(); }}>
  <input
    type="text"
    value={proposalDescription}
    onChange={(e) => setProposalDescription(e.target.value)}
    placeholder="Enter Proposal Description"
  />
  <input
    type="number"
    value={proposalDuration}
    onChange={(e) => setProposalDuration(e.target.value)}
    placeholder="Proposal Duration in seconds"
  />
  <button type="submit" disabled={loading}>
    {loading ? "Creating Proposal..." : "Create Proposal"}
  </button>
</form>

      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        
        <div className="content">
          {/* Create Proposal */}
          
           
         

          {/* Vote on Proposal */}
        <div className="section">
            <h3>Vote on Proposal</h3>
            <input
              type="number"
              placeholder="Proposal ID"
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
            />
            
              <button onClick={voteOnProposal} disabled={loading}>
              {loading ? "Voting..." : "Vote"}
            </button>

            
          </div>

          {/* Close Proposal */}
          <div className="section">
            <h3>Close Proposal</h3>
            <button onClick={closeProposal} disabled={loading}>
              Close
            </button>
          </div>

          {/* Display Proposals */}
          <div className="section">
            <h3>Proposals</h3>
            {loading ? (
              <p>Loading proposals...</p>
            ) : proposals.length > 0 ? (
              proposals.map((proposal) => (
                <div key={proposal.id} className="proposal">
                  <p>
                    <strong>ID:</strong> {proposal.id}
                  </p>
                  <p>
                    <strong>Description:</strong> {proposal.description}
                  </p>
                  <p>
                    <strong>Votes:</strong> {proposal.votes}
                  </p>
                  <p>
                    <strong>Executed:</strong> {proposal.executed ? "Yes" : "No"}
                  </p>
                </div>
              ))
            ) : (
              <p>No proposals found.</p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          text-align: center;
          background: #f9f9f9;
          color: #333;
          font-family: "Inter", sans-serif;
          border-radius: 12px;
          background-image: url("https://i.pinimg.com/originals/34/93/4f/34934ff0d94d085d02e5ceb345ecde66.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 100vh;
          width: 100%;
          padding: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .content {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }

        .section {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 240px;
        }

        input,
        button {
          margin-top: 10px;
          padding: 8px;
          width: 100%;
          border-radius: 6px;
          font-size: 16px;
        }

        button {
          background: #007bff;
          color: white;
          cursor: pointer;
          border: none;
        }

        button:hover {
          background: #0056b3;
        }
      `}</style>
    </main>
  );
}
