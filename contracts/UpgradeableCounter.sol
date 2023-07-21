// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.20;

// Open Zeppelin libraries for controlling upgradability and access.
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract UpgradeableCounter is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public value;

    //@dev no constructor in upgradable contracts. Instead we have initializers.
    function initialize() public initializer {
        //@dev as there is no constructor, we need to initialise the OwnableUpgradeable explicitly
        __Ownable_init();
        value = 0;
    }

    //@dev required by the OZ UUPS module
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function setValue(uint256 _newValue) public onlyOwner {
        value = _newValue;
        emit ValueChanged(_newValue);
    }

    event ValueChanged(uint256 newValue);
}


contract UpgradeableCounterV2 is UpgradeableCounter {

   function increment() external {
       value += 1;
   }
}
