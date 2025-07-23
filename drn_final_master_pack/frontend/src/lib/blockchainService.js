import { ethers } from 'ethers';

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

export async function buyTokens(saleContractAddress, amountETH) {
  const { provider, signer } = await connectWallet();
  const saleContract = new ethers.Contract(saleContractAddress, saleABI, signer);
  const tx = await saleContract.buyTokens({ value: ethers.utils.parseEther(amountETH) });
  await tx.wait();
  return tx.hash;
}
