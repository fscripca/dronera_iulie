import { ethers } from 'ethers';
import contractAbi from './contractAbi.json' assert { type: 'json' };

async function triggerBuyback() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_MUMBAI_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

    const tx = await contract.buyback();
    console.log('Buyback tx hash:', tx.hash);
    await tx.wait();
    console.log('Buyback confirmed!');
  } catch (err) {
    console.error('Error during buyback:', err);
  }
}

triggerBuyback();
