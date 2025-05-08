const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying Paymaster with account:", deployer.address);

    const ENTRY_POINT = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

    const PaymasterFactory = await hre.ethers.getContractFactory("SmartPayPaymaster");
    const paymaster = await PaymasterFactory.deploy(ENTRY_POINT, deployer.address);

    await paymaster.waitForDeployment();
    console.log("✅ SmartPayPaymaster deployed to:", await paymaster.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
