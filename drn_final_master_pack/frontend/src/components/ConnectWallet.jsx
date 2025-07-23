import { useState } from 'react';
import { connectWallet } from '../lib/blockchainService';

export default function ConnectWallet() {
  const [address, setAddress] = useState('');
  const handleConnect = async () => {
    try {
      const { address } = await connectWallet();
      setAddress(address);
    } catch (err) {
      console.error(err);
      alert('Failed to connect wallet');
    }
  };
  return (
    <button onClick={handleConnect} className="bg-blue-600 text-white p-2 rounded">
      {address ? `Connected: ${address}` : 'Connect MetaMask'}
    </button>
  );
}
