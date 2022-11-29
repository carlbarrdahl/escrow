// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/proxy/Clones.sol";

contract EscrowFactory {
    address public immutable implementation;

    event EscrowCreated(
        address escrow,
        address client,
        address talent,
        address resolver
    );

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function create(
        address _client,
        address _talent,
        address _resolver,
        uint256 _fee
    ) external payable returns (address) {
        address escrow = Clones.clone(implementation);
        IEscrow(escrow).init(_client, _talent, _resolver, _fee);
        emit EscrowCreated(escrow, _client, _talent, _resolver);

        return escrow;
    }
}

interface IEscrow {
    function init(
        address _client,
        address _talent,
        address _resolver,
        uint256 _fee
    ) external;
}
