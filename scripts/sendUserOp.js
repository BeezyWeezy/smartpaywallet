require("dotenv").config();
const { ethers } = require("ethers");
const { SimpleAccountAPI } = require("@account-abstraction/sdk");
const { EntryPoint__factory } = require("@account-abstraction/contracts");
const { resolveProperties } = require("@ethersproject/properties");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const entryPointAddress = process.env.ENTRY_POINT;
    const walletAddress = process.env.WALLET_ADDRESS;
    const paymasterAddress = process.env.PAYMASTER_ADDRESS;

    const recipient = "0x0574f4e1629f79527f2e0014ef54aec4ebcf4beb";
    const feeReceiver = signer.address;

    const amount = ethers.utils.parseEther("0.01");
    const fee = amount.div(100);
    const amountToSend = amount.sub(fee);

    const iface = new ethers.utils.Interface([
        "function execute(address dest, uint256 value, bytes calldata func)"
    ]);

    const accountAPI = new SimpleAccountAPI({
        provider,
        entryPointAddress,
        owner: signer,
        factoryAddress: null,
        accountAddress: walletAddress
    });

    const entryPoint = EntryPoint__factory.connect(entryPointAddress, provider);

    // 🔁 Отправляем основную сумму пользователю
    const callData1 = iface.encodeFunctionData("execute", [recipient, amountToSend, "0x"]);
    const userOp1 = await accountAPI.createSignedUserOp({
        target: walletAddress,
        data: callData1,
        value: amountToSend,
        paymasterAndData: paymasterAddress
    });

    console.log(`🚀 Sending 0.099 ETH to recipient: ${recipient}`);
    const tx1 = await entryPoint.handleOps([await resolveProperties(userOp1)], feeReceiver);
    await tx1.wait();
    console.log("✅ First transfer confirmed.");

    // 🔁 Отправляем комиссию себе
    const callData2 = iface.encodeFunctionData("execute", [feeReceiver, fee, "0x"]);
    const userOp2 = await accountAPI.createSignedUserOp({
        target: walletAddress,
        data: callData2,
        value: fee,
        paymasterAndData: paymasterAddress
    });

    console.log(`💰 Sending 1% fee (${ethers.utils.formatEther(fee)} ETH) to yourself`);
    const tx2 = await entryPoint.handleOps([await resolveProperties(userOp2)], feeReceiver);
    await tx2.wait();
    console.log("✅ Fee transfer confirmed.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
