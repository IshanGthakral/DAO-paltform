import { useState, useEffect } from "react";
import { ethers } from "ethers";
import DAOPlatformAbi from "../artifacts/contracts/DAOPlatform.sol/DAOPlatform.json";

export default function DAOPlatform() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [DAOPlatform, setDAOPlatform] = useState(undefined);
  const [proposals, setProposals] = useState([]);
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [message, setMessage] = useState("");

  const contractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const DAOPlatformABI = DAOPlatformAbi.abi;

  useEffect(() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  }, []);

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }
    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      getDAOPlatformContract(accounts[0]);
    } catch (error) {
      setMessage("Error connecting account: " + (error.message || error));
    }
  };

  const getDAOPlatformContract = (userAccount) => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const DAOPlatformContract = new ethers.Contract(contractAddress, DAOPlatformABI, signer);
    setDAOPlatform(DAOPlatformContract);
    getTokenBalance(DAOPlatformContract, userAccount);
  };

  const getTokenBalance = async (contract, userAccount) => {
    try {
      const balance = await contract.balanceOf(userAccount);
      setTokenBalance(parseInt(balance.toString()));
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const createProposal = async () => {
    setMessage("");
    if (DAOPlatform) {
      try {
        
        let tx = await DAOPlatform.createProposal(proposalDescription, { gasLimit: 300000 });
        await tx.wait();
        setMessage("Proposal created successfully!");
      } catch (error) {
        setMessage("Error creating proposal: " + (error.message || error));
      }
    }
  };

  const voteOnProposal = async () => {
    setMessage("");
    
    try {
      let tx = await DAOPlatform.vote(proposalId, { gasLimit: 300000 });
      await tx.wait();
      setMessage("Voted successfully!");
    } catch (error) {
      setMessage("Error voting: " + (error.message || error));
      console.error("Vote error:", error);
    }
  };

  const closeProposal = async () => {
    setMessage("");
    if (DAOPlatform) {
      try {
        let tx = await DAOPlatform.closeProposal(proposalId , { gasLimit: 300000 });
        await tx.wait();
        setMessage("Proposal closed successfully!");
      } catch (error) {
        setMessage("Error closing proposal: " + (error.message || error));
      }
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to DAO Platform</h1>
      </header>
      {ethWallet ? (
        account ? (
          <div>
            <p>Your Account: {account}</p>
            <p>Governance Token Balance: {tokenBalance}</p>
            <div>
              <h3>Create Proposal</h3>
              <input
                type="text"
                placeholder="Proposal Description"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
              />
              <button onClick={createProposal}>Create</button>
            </div>
            <div>
              <h3>Vote on Proposal</h3>
              <input
                type="number"
                placeholder="Proposal ID"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
              />
              <button onClick={voteOnProposal}>Vote</button>
            </div>
            <div>
              <h3>Close Proposal</h3>
              <button onClick={closeProposal}>Close Proposal</button>
            </div>
            {message && <p><strong>{message}</strong></p>}
          </div>
        ) : (
          <button onClick={connectAccount}>Connect MetaMask Wallet</button>
        )
      ) : (
        <p>Please install MetaMask to use this DAO Platform.</p>
      )}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: white;
          color: black;
          font-family: "Times New Roman", serif;
          border: 10px solid black;
          border-radius: 20px;
          background-image: url("https://i.pinimg.com/736x/52/55/74/525574293de5cd959d11a551b85fd791.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 900px;
          width: 1500px;
          
          font-weight: 1000;
          padding: 20px;
        }

        h1 {
          font-family: "Arial", serif;
          font-size: 60px;
          margin-bottom: 20px;
        }
          .content {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          width: 100%;
        }

        .section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          width: 300px;
        }

        input {
          margin: 10px;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 18px;
          cursor: pointer;
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        button:hover {
          background-color: #388e3c;
        }
      `}</style>
    </main>
  );
}
