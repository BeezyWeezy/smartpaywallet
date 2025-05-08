// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./base/CustomBasePaymaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartPayPaymaster is CustomBasePaymaster, Ownable {
    event GasSponsored(address indexed sender, uint256 gasUsed, uint256 timestamp);

    constructor(IEntryPoint _entryPoint, address initialOwner)
    CustomBasePaymaster(_entryPoint)
    Ownable(initialOwner)
    {}

    receive() external payable {}

    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32,
        uint256
    ) internal override returns (bytes memory context, uint256 validationData) {
        // Пропускаем всех — можно добавить валидацию
        return (abi.encode(userOp.sender), 0);
    }

    function _postOp(
        PostOpMode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal override {
        address sender = abi.decode(context, (address));
        emit GasSponsored(sender, actualGasCost, block.timestamp);
    }

    function withdrawTo(address payable to, uint256 amount) external onlyOwner {
        (bool success,) = to.call{value: amount}("");
        require(success, "Withdraw failed");
    }
}
