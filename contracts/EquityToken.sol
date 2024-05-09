// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

//import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
//import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract EquityToken is ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    uint8 private constant _decimals = 6;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    //@dev In upgradable contracts, we use an initializer instead of a constructor.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) public virtual initializer {
        //@dev We need to call the inherited initialisation functions explicitly.
        __ERC20_init(name_, symbol_);
        __Ownable_init();
        _mint(msg.sender, initialSupply_ * 10 ** decimals());
    }

    //@dev required by the OZ UUPS module
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    function getAdminAddress() public view returns (address) {
        return owner();
    }

    function getImplementationAddress() public view returns (address) {
        return _getImplementation();
    }

    function mint(address to, uint256 amount) public virtual onlyOwner {
        _mint(to, amount);
    }

    function withdraw() public virtual onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
}

contract EquityTokenV2 is EquityToken {

}

/*


    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) initializer virtual override public {
        EquityToken.initialize(name_, symbol_, initialSupply_);
    }

        __ERC20Burnable_init();
        __Pausable_init();

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }



*/
