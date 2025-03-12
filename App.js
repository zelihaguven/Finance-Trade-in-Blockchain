import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import CoinIcon from './components/CoinIcon'; // Coin simgesi bileşeni
import './App.css'; // CSS dosyası

// Token kontrat ABI'si (derleme sonrası güncellenecek)
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function buyTokens() payable",
  "function sellTokens(uint256 tokenAmount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Token kontrat adresi (deploy sonrası güncellenecek)
const TOKEN_ADDRESS = "YOUR_TOKEN_CONTRACT_ADDRESS";

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [error, setError] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showTrade, setShowTrade] = useState(false);

  useEffect(() => {
    checkMetaMaskInstallation();
  }, []);

  const checkMetaMaskInstallation = () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsMetaMaskInstalled(true);
      setError('');
    } else {
      setIsMetaMaskInstalled(false);
      setError('MetaMask is not installed. Please install MetaMask.');
    }
  };

  const updateBalances = async () => {
    try {
      if (!provider || !walletAddress) return;

      const ethBalance = await provider.getBalance(walletAddress);
      setEthBalance(ethBalance.toString());

      if (contract) {
        const tokenBalance = await contract.balanceOf(walletAddress);
        setTokenBalance(tokenBalance.toString());
      }
    } catch (err) {
      console.error('Balance update error:', err);
      setError('Error updating balances.');
    }
  };

  const connectWallet = async () => {
    try {
      if (!isMetaMaskInstalled) {
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(browserProvider);
      setWalletAddress(address);
      setError('');

      // Token kontratını başlat
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      setContract(tokenContract);

      // Bakiyeleri güncelle
      await updateBalances();

      console.log("Wallet Connected:", address);
    } catch (err) {
      console.error('Connection error:', err);
      setError('Error connecting wallet. Please try again.');
    }
  };

  const buyTokens = async (amount) => {
    try {
      setIsLoading(true);
      setError('');
      
      const tx = await contract.buyTokens({ value: amount });
      await tx.wait();
      
      await updateBalances();
      setError('Token purchase successful!');
    } catch (err) {
      console.error('Token purchase error:', err);
      setError('Error during token purchase.');
    } finally {
      setIsLoading(false);
    }
  };

  const sellTokens = async (amount) => {
    try {
      setIsLoading(true);
      setError('');
      
      const tx = await contract.sellTokens(amount);
      await tx.wait();
      
      await updateBalances();
      setError('Token sale successful!');
    } catch (err) {
      console.error('Token sale error:', err);
      setError('Error during token sale.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await updateBalances();
          setError('');
        } else {
          setWalletAddress('');
          setError('Please select an account.');
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        setWalletAddress('');
        setError('Wallet disconnected.');
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('disconnect');
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        {(showCoins || showTrade) && (
          <button 
            onClick={() => {
              setShowCoins(false);
              setShowTrade(false);
            }} 
            className="back-button"
          >
            ← BACK TO HOME
          </button>
        )}
        <button 
          onClick={connectWallet} 
          className={`connect-button ${!isMetaMaskInstalled && !showCoins && !showTrade ? 'install-metamask' : ''}`}
        >
          {!isMetaMaskInstalled && !showCoins && !showTrade
            ? 'INSTALL METAMASK' 
            : walletAddress 
              ? `CONNECTED: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
              : 'CONNECT WALLET'}
        </button>
        {walletAddress && (
          <div className="balances">
            <div className="balance">ETH: {Number(ethBalance) / 1e18}</div>
            <div className="balance">FBT: {Number(tokenBalance) / 1e18}</div>
          </div>
        )}
      </header>
      <main className="app-main">
        {error && !showCoins && !showTrade && <div className="error-message">{error}</div>}
        {!showCoins && !showTrade ? (
          <div className="main-actions">
            <div className="coin-icon main-coin">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                <text
                  x="50"
                  y="65"
                  fontFamily="Arial"
                  fontSize="40"
                  fill="#B8860B"
                  textAnchor="middle"
                >
                  ₿
                </text>
              </svg>
              <div className="greeting">FINANCE BRO-ING SAYS HI!</div>
            </div>
            <div className="action-buttons">
              <button className="action-button buy" onClick={() => setShowCoins(true)}>
                COINS
              </button>
              <button className="action-button trade" onClick={() => setShowTrade(true)}>
                TRADE
              </button>
            </div>
          </div>
        ) : showCoins ? (
          <CoinIcon 
            onBuy={() => buyTokens('100000000000000000')}
            onSell={() => sellTokens('100000000000000000000')}
            isLoading={isLoading}
            showTradePanel={false}
          />
        ) : (
          <CoinIcon 
            onBuy={() => buyTokens('100000000000000000')}
            onSell={() => sellTokens('100000000000000000000')}
            isLoading={isLoading}
            showTradePanel={true}
          />
        )}
      </main>
    </div>
  );
};

export default App;