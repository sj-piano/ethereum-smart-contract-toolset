// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.20;

// Open Zeppelin libraries for controlling upgradability and access.
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract UpgradeableCounter is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    string public name;
    uint256 public version;

    event VersionChanged(uint256 newVersion);

    //@dev no constructor in upgradable contracts. Instead we have initializers.
    function initialize() public virtual initializer {
        //@dev as there is no constructor, we need to initialise the OwnableUpgradeable explicitly
        __Ownable_init();
        name = "CounterLogic";
        version = 0;
    }

    //@dev required by the OZ UUPS module
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function getAdminAddress() public view returns (address) {
        return owner();
    }

    function getImplementationAddress() public view returns (address) {
        return _getImplementation();
    }

    function setVersion(uint256 _newVersion) public onlyOwner {
        version = _newVersion;
        emit VersionChanged(_newVersion);
    }

}


contract UpgradeableCounterV2 is UpgradeableCounter {

    uint256 public value;

    function initialize() public override initializer {
        super.initialize();
        value = 0;
    }

   function increment() external {
       value += 1;
   }

}
