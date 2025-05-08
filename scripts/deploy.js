const { ethers } = require("hardhat");

// Официальный EntryPoint от StackUp для Sepolia
const ENTRY_POINT = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);

    const SmartPayWallet = await ethers.getContractFactory("SmartPayWallet");
    const wallet = await SmartPayWallet.deploy(ENTRY_POINT, deployer.address);

    await wallet.waitForDeployment();
    console.log("✅ SmartPayWallet deployed to:", await wallet.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
