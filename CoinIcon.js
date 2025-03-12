import React, { useState } from 'react';

const coins = [
  { id: 'bitcoin', symbol: '₿', name: 'Bitcoin', price: '64,280', change: '+2.5%', color: '#FFE5B4' },
  { id: 'ethereum', symbol: 'Ξ', name: 'Ethereum', price: '3,480', change: '+1.8%', color: '#E8F0FE' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: '128', change: '+4.2%', color: '#E0FFF1' },
  { id: 'cardano', symbol: '₳', name: 'Cardano', price: '0.72', change: '-0.5%', color: '#E6EEFF' }
];

const CoinIcon = ({ onBuy, onSell, isLoading, showTradePanel }) => {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [amount, setAmount] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const handleCoinClick = (coin) => {
    if (!showTradePanel) {
      setSelectedCoin(selectedCoin?.id === coin.id ? null : coin);
    }
  };

  const handleAmountChange = (value, coin) => {
    setAmount(value);
  };

  const calculateTotal = (amount, price) => {
    const numericPrice = parseFloat(price.replace(/,/g, ''));
    return (amount * numericPrice).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleBuy = (coin) => {
    if (!isLoading) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  const handleSell = (coin) => {
    if (!isLoading) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  return (
    <div className="coins-grid">
      {showWarning && (
        <div className="wallet-warning">
          ⚠️ Connect your wallet to start trading
        </div>
      )}
      {coins.map((coin) => (
        <div key={coin.id} className="coin-wrapper">
          <div 
            className={`coin-container ${selectedCoin?.id === coin.id ? 'selected' : ''}`}
            onClick={() => handleCoinClick(coin)}
          >
            <div className={`coin-icon ${selectedCoin?.id === coin.id ? 'paused' : ''}`}>
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" fill={coin.color} stroke="#B8860B" strokeWidth="2" />
                <text
                  x="50"
                  y="65"
                  fontFamily="Arial"
                  fontSize={coin.symbol.length > 1 ? "24" : "40"}
                  fill="#B8860B"
                  textAnchor="middle"
                >
                  {coin.symbol}
                </text>
              </svg>
            </div>
            <div className="coin-info">
              <div className="coin-name">{coin.name}</div>
              <div className="coin-price">${coin.price}</div>
              <div className={`coin-change ${coin.change.startsWith('-') ? 'negative' : 'positive'}`}>
                {coin.change}
              </div>
            </div>
          </div>
          
          {((showTradePanel && !selectedCoin) || (!showTradePanel && selectedCoin?.id === coin.id)) && (
            <div className="trade-panel">
              <div className="greeting">TRADE {coin.name.toUpperCase()}</div>
              <div className="trade-form">
                <div className="input-group">
                  <label>Amount ({coin.symbol})</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="trade-input"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value, coin)}
                  />
                </div>
                <div className="input-group">
                  <label>Total (USD)</label>
                  <input 
                    type="text" 
                    value={amount ? `$${calculateTotal(amount, coin.price)}` : '$0.00'} 
                    className="trade-input" 
                    disabled 
                  />
                </div>
                <div className="trade-buttons">
                  <button 
                    className={`trade-button buy ${isLoading ? 'loading' : ''}`} 
                    onClick={() => handleBuy(coin)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'PROCESSING...' : 'BUY'}
                  </button>
                  <button 
                    className={`trade-button sell ${isLoading ? 'loading' : ''}`}
                    onClick={() => handleSell(coin)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'PROCESSING...' : 'SELL'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CoinIcon; 