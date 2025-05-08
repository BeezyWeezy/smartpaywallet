const hre = require("hardhat");

const ENTRY_POINT = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying updated SmartPayWallet with account:", deployer.address);

    const WalletFactory = await hre.ethers.getContractFactory("SmartPayWallet");
    const wallet = await WalletFactory.deploy(ENTRY_POINT, deployer.address);

    await wallet.waitForDeployment();
    console.log("✅ Updated SmartPayWallet deployed to:", await wallet.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
