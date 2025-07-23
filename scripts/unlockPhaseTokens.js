import { ethers } from 'ethers';
import contractAbi from './contractAbi.json' assert { type: 'json' };

async function unlock() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_MUMBAI_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

    const tx = await contract.unlockPhase('Phase2');
    console.log('Phase 2 unlocked, tx hash:', tx.hash);
    await tx.wait();
    console.log('✅ Phase 2 tokens unlocked!');
  } catch (err) {
    console.error('❌ Error unlocking phase tokens:', err);
  }
}

unlock();
