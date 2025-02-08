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
    // address public immutable manager = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    // address public immutable manager_1 = 0x7549D03022252D136fa62FCF184ef77ec05D3F07;

    mapping(address => ICopyrightInfringementUser) public users;
    mapping(uint256 => IReportedPost) public posts;
    mapping (uint256 => uint256) public contentHashPosts;

    event NewInfrigmentUser(address indexed userId, string username, string platform, uint128 reputationScore, uint256 firstOffenseTimestamp,  uint256 lastOffenseTimestamp, uint128 postCount, uint128 offenseCount);
    event ReportedPost(uint256 indexed recordId, address userId,string postText,string postUrl,uint256 timestamp,string derivedContext,string derivedContextExplanation,uint128 severityScore);

    event UpdateInfrigmentUser(address indexed userId, uint128 reputationScore, uint256 firstOffenseTimestamp, uint256 lastOffenseTimestamp, uint128 postCount, uint128 offenseCount);
    event UpdatedReportedPost(uint256 indexed recordId,string derivedContext,string derivedContextExplanation,uint128 severityScore);

    // Constructor: Called once on contract deployment
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    modifier isOwner() {
        // require((msg.sender == manager || msg.sender == owner || msg.sender == manager_1), "Not the Owner or Manager");
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Function that allows the owner to add new infringements
     *
     */
    function AddInfringement(ICopyrightInfringementUser memory _addUser, IReportedPost memory _addPost) external isOwner returns (bool) {
        // console.log("Adding infringement", _addUser.userId);
        users[_addUser.userId] = _addUser;
        if( users[_addUser.userId].postCount == 0) {
            users[_addUser.userId].postCount = 1;
        }
        posts[_addPost.recordId] = _addPost;
        contentHashPosts[_addPost.contentHash] = _addPost.recordId;
       
        emit ReportedPost(_addPost.recordId,_addPost.userId,_addPost.postText,_addPost.postUrl,_addPost.timestamp,_addPost.derivedContext,_addPost.derivedContextExplanation,_addPost.severityScore);
        emit NewInfrigmentUser(_addUser.userId, _addUser.username, _addUser.platform, _addUser.reputationScore,_addUser.firstOffenseTimestamp,_addUser.lastOffenseTimestamp,_addUser.postCount,_addUser.offenseCount);
        
        return true;
    }

    /**
     * Function that allows the owner to update an infringement user
     *
     */
    function UpdateCopyrightInfringementUser(address _userId, uint128 _reputationScore, uint256 _firstOffenseTimestamp, uint256 _lastOffenseTimestamp, uint128 _postCount, uint128 _offenseCount) public isOwner returns (bool) {
        // console.log("updateCopyrightInfringementUser", _userId);
       if(users[_userId].postCount != 0) {
            users[_userId].reputationScore = _reputationScore;
            users[_userId].firstOffenseTimestamp = _firstOffenseTimestamp;
            users[_userId].lastOffenseTimestamp = _lastOffenseTimestamp;
            users[_userId].postCount = _postCount;
            users[_userId].offenseCount = _offenseCount;
            
            emit UpdateInfrigmentUser(_userId, _reputationScore, _firstOffenseTimestamp, _lastOffenseTimestamp, _postCount, _offenseCount);
       }
       return true;
    }
    /**
     * Function that allows the owner to update an infringement user
     *
     */
    function UpdatePost(uint256 _recordId, uint128 _severityScore, string memory _derivedContext, string memory _derivedContextExplanatio)  public isOwner returns (bool) {
        // console.log("UpdatePost", _recordId);
       if(posts[_recordId].contentHash != 0) {
           posts[_recordId].severityScore = _severityScore;
           posts[_recordId].derivedContext = _derivedContext;
           posts[_recordId].derivedContextExplanation = _derivedContextExplanatio;
        
           emit UpdatedReportedPost(_recordId, _derivedContext, _derivedContextExplanatio, _severityScore);
       }
       return true;
    }
    /**
     * Function to get reputation score of a user
     *
     */
    function GetReputationScore(address _userId) public view returns (uint128) {
        uint128 reputation = users[_userId].reputationScore;
        return reputation;
    }
    /**
     * Function to get post by hash
     *
     */
    function GetReportedPost(uint256 _contentHash) public view  returns (IReportedPost memory) {
        if(contentHashPosts[_contentHash] !=0) {
            uint256 c = contentHashPosts[_contentHash]; 
            return posts[c];
        }
        return posts[0];
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
