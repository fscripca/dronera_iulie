import fs from 'fs';

try {
  const contractData = JSON.parse(fs.readFileSync('deployments/polygon_mumbai/DRNTokenSale.json'));
  const contractAddress = contractData.address;

  const config = {
    REACT_APP_SUPABASE_URL: process.env.SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    REACT_APP_STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    CONTRACT_ADDRESS: contractAddress,
    ALCHEMY_MUMBAI_URL: process.env.ALCHEMY_MUMBAI_URL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };

  let envContent = '';
  for (const [key, value] of Object.entries(config)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file generated!');
} catch (err) {
  console.error('❌ Error generating .env file:', err);
}
