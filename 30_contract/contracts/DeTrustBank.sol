// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract DeTrustBank is AccessControl{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");

    mapping(address => mapping(address=>uint256)) deposited;
    mapping(address => mapping(uint256=>bool)) trustedList;
    address defaultFt;

    event Withdrawal(uint amount, uint when);

    constructor() payable {

    }

    /**************************
    Setter
    **************************/
    function setTrustedList(address issuer_, uint256 credType_) public onlyRole("ADMIN_ROLE") {
        trustedList[issuer_][credType_] = true;
    }
    function setDefaultFt(address ft_) public onlyRole("ADMIN_ROLE") {
        defaultFt = ft_;
    }

    /**************************
    Getter
    **************************/

    /**************************
    Logic
    **************************/
    function deposit() public payable {
        require(msg.value > 0);
        deposited[msg.sender][address(0)] = msg.value;
    }

    function deposit(address ft_, uint256 value_) public payable {
        IERC20 _ft = IERC20(ft_);
        require(_ft.balanceOf(msg.sender) > value_, 'DeTrustBankd Error: Your balance is insufficient');
        _ft.transferFrom(msg.sender, address(this), value_);
    }

    function withdrawWitVC(address issuer_, string memory credSubject_, bytes memory signature_) public {
        bytes32 _messageHash = keccak256(abi.encodePacked(credSubject_));
        bool _check = SignatureChecker.isValidSignatureNow(issuer_, _messageHash, signature_);
        require(_check, 'DeTrustBankd Error: Issuer is not registered in trustedList');
        require(trustedList[issuer_][1], 'DeTrustBankd Error: Issuer is not registered');
        payable(msg.sender).transfer(10**16);
        //require(issuer_がトラストリストにある)
    }

    function withdrawWitVC(address issuer_, string memory credSubject_, bytes memory signature_, address ft_) public {
        bytes32 _messageHash = keccak256(abi.encodePacked(credSubject_));
        bool _check = SignatureChecker.isValidSignatureNow(issuer_, _messageHash, signature_);
        require(_check, 'DeTrustBankd Error: Issuer is not registered in trustedList');
        require(trustedList[issuer_][1], 'DeTrustBankd Error: Issuer is not registered');
        IERC20 _ft = IERC20(ft_);
        _ft.transfer(msg.sender, 10*16);
    }
}
