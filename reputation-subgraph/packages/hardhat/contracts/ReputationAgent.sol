//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract to track IP users reputation and offenses of infringement
 */
 


 struct ICopyrightInfringementUser {
    address userId;
    string platform;
    string username;
    uint128 postCount;
    uint128 offenseCount;
    uint256 firstOffenseTimestamp;
    uint256 lastOffenseTimestamp;
    uint128 reputationScore;
}
 struct IReportedPost {
    uint256 recordId;
    address userId;
    uint256 contentHash;
    string postText;
    string postUrl;
    uint256 timestamp;
    string derivedContext;
    string derivedContextExplanation;
    uint128 severityScore;
}
contract ReputationAgent {
    // State Variables
    string public greeting = "Be good to IP!";

    address public immutable owner;
    address public immutable manager = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    mapping(address => ICopyrightInfringementUser) public users;
    mapping(uint256 => IReportedPost) public posts;

    event NewInfrigmentUser(address indexed userId, string username, string platform, uint128 reputationScore, bool isOffense);
    event ReportedPost(uint256 indexed recordId,address userId,string postText,string postUrl,uint256 timestamp,string derivedContext,string derivedContextExplanation,uint128 severityScore);

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    modifier isOwner() {
        require((msg.sender == manager || msg.sender == owner), "Not the Owner or Manager");
        // require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Function that allows the owner to add new infringements
     *
     */
    function AddInfringement(ICopyrightInfringementUser memory _addUser, IReportedPost memory _addPost, bool _isOffense) external isOwner returns (bool) {
        // Print data to the hardhat chain console. Remove when deploying to a live network.
        console.log("Adding infringement", _addUser.userId);
        address _userId = _addUser.userId;
        if(users[_userId].postCount > 0) {
            users[_userId].reputationScore = _addUser.reputationScore;
            users[_userId].postCount += 1;
            if(_isOffense) {
                users[_userId].offenseCount += 1;
                users[_userId].lastOffenseTimestamp = _addUser.lastOffenseTimestamp;
            }
        } else {
            users[_addUser.userId] = _addUser;
        }
        posts[_addPost.recordId] = _addPost;
        emit ReportedPost(_addPost.recordId,_addPost.userId,_addPost.postText,_addPost.postUrl,_addPost.timestamp,_addPost.derivedContext,_addPost.derivedContextExplanation,_addPost.severityScore);
        emit NewInfrigmentUser(_addUser.userId, _addUser.username, _addUser.platform, _addUser.reputationScore, _isOffense);
        
        return true;
    }


    /**
     * Function that allows the owner to update an infringement user
     *
     */
    function GetReputationScore(address _userId) public view  returns (uint128) {
        // Print data to the hardhat chain console. Remove when deploying to a live network.
        console.log("GetReputationScore", _userId);
       
        uint128 reputation = users[_userId].reputationScore;
        return reputation;
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success, ) = owner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
