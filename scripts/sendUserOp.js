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
    console.log(paymasterAddress);

    const recipient = "0xB48499F43c5069609256989b1Cf56758F2Cddb13";
    const feeReceiver = signer.address;

    const amount = ethers.utils.parseEther("0.0005");

    const fee = amount.div(100); // 1%
    const amountToSend = amount.sub(fee);

    const iface = new ethers.utils.Interface([
        "function execute(address dest, uint256 value, bytes calldata func)",
        "function executeBatch(address[] calldata dests, bytes[] calldata funcs)"
    ]);

    const callData = iface.encodeFunctionData("executeBatch", [
        [recipient, feeReceiver],
        [
            iface.encodeFunctionData("execute", [recipient, amountToSend, "0x"]),
            iface.encodeFunctionData("execute", [feeReceiver, fee, "0x"])
        ]
    ]);

    const accountAPI = new SimpleAccountAPI({
        provider,
        entryPointAddress,
        owner: signer,
        factoryAddress: null,
        accountAddress: walletAddress
    });

    const entryPoint = EntryPoint__factory.connect(entryPointAddress, provider);

    const userOp = await accountAPI.createSignedUserOp({
        target: walletAddress,
        data: callData,
        value: 0,
        paymasterAndData: paymasterAddress
    });

    const resolvedOp = await resolveProperties(userOp);
    const resolvedFeeReceiver = await signer.getAddress(); // обязательно строка

    const tx = await entryPoint.handleOps([resolvedOp], resolvedFeeReceiver);

    console.log("🚀 Sending UserOperation with 1% fee split...");
    await tx.wait();
    console.log("✅ Transaction confirmed.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
