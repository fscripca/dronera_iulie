import { ethers } from 'ethers';
import contractAbi from './contractAbi.json' assert { type: 'json' };

async function distribute() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_MUMBAI_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractAbi, wallet);

    const tx = await contract.transfer(process.env.ADMIN_ADDRESS, ethers.utils.parseEther('1000000'));
    console.log('Admin reserve transferred, tx hash:', tx.hash);
    await tx.wait();
    console.log('✅ Admin reserve transfer confirmed!');
  } catch (err) {
    console.error('❌ Error distributing admin reserve:', err);
  }
}

distribute();
