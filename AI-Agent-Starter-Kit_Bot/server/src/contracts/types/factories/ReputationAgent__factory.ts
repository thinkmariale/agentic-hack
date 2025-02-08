/* tslint:disable */
/* eslint-disable */

import { Contract,ContractRunner } from "ethers";
// localhost
// const address = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
// testnet
const address ="0x984B06553b696d813A0D2C4475ba9aF5405EeeEe";
// const chainId = 84532;

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "platform",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "reputationScore",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "firstOffenseTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lastOffenseTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "postCount",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "offenseCount",
        type: "uint128",
      },
    ],
    name: "NewInfrigmentUser",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "recordId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "userId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "postText",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "postUrl",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "derivedContext",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "derivedContextExplanation",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "severityScore",
        type: "uint128",
      },
    ],
    name: "ReportedPost",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "reputationScore",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "firstOffenseTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lastOffenseTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "postCount",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "offenseCount",
        type: "uint128",
      },
    ],
    name: "UpdateInfrigmentUser",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "recordId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "derivedContext",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "derivedContextExplanation",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "severityScore",
        type: "uint128",
      },
    ],
    name: "UpdatedReportedPost",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "userId",
            type: "address",
          },
          {
            internalType: "string",
            name: "platform",
            type: "string",
          },
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "uint128",
            name: "postCount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "offenseCount",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "firstOffenseTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastOffenseTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "reputationScore",
            type: "uint128",
          },
        ],
        internalType: "struct ICopyrightInfringementUser",
        name: "_addUser",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "recordId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "userId",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "contentHash",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "postText",
            type: "string",
          },
          {
            internalType: "string",
            name: "postUrl",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "derivedContext",
            type: "string",
          },
          {
            internalType: "string",
            name: "derivedContextExplanation",
            type: "string",
          },
          {
            internalType: "uint128",
            name: "severityScore",
            type: "uint128",
          },
        ],
        internalType: "struct IReportedPost",
        name: "_addPost",
        type: "tuple",
      },
    ],
    name: "AddInfringement",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_contentHash",
        type: "uint256",
      },
    ],
    name: "GetReportedPost",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "recordId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "userId",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "contentHash",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "postText",
            type: "string",
          },
          {
            internalType: "string",
            name: "postUrl",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "derivedContext",
            type: "string",
          },
          {
            internalType: "string",
            name: "derivedContextExplanation",
            type: "string",
          },
          {
            internalType: "uint128",
            name: "severityScore",
            type: "uint128",
          },
        ],
        internalType: "struct IReportedPost",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userId",
        type: "address",
      },
    ],
    name: "GetReputationScore",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userId",
        type: "address",
      },
      {
        internalType: "uint128",
        name: "_reputationScore",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "_firstOffenseTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_lastOffenseTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "_postCount",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "_offenseCount",
        type: "uint128",
      },
    ],
    name: "UpdateCopyrightInfringementUser",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_recordId",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "_severityScore",
        type: "uint128",
      },
      {
        internalType: "string",
        name: "_derivedContext",
        type: "string",
      },
      {
        internalType: "string",
        name: "_derivedContextExplanatio",
        type: "string",
      },
    ],
    name: "UpdatePost",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "contentHashPosts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "greeting",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "manager",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "manager_1",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "posts",
    outputs: [
      {
        internalType: "uint256",
        name: "recordId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "userId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "contentHash",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "postText",
        type: "string",
      },
      {
        internalType: "string",
        name: "postUrl",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "derivedContext",
        type: "string",
      },
      {
        internalType: "string",
        name: "derivedContextExplanation",
        type: "string",
      },
      {
        internalType: "uint128",
        name: "severityScore",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "users",
    outputs: [
      {
        internalType: "address",
        name: "userId",
        type: "address",
      },
      {
        internalType: "string",
        name: "platform",
        type: "string",
      },
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "uint128",
        name: "postCount",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "offenseCount",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "firstOffenseTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastOffenseTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "reputationScore",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

// const contractABI = [
//   // Replace with your actual contract's ABI
//   "function GetReputationScore(address user) public view returns (uint256)",
//   "function users(address user) public view returns (object)",

// ];
// export default deployedContracts satisfies GenericContractsDeclaration;
export class ReputationAgent__factory {
  static readonly abi = _abi;
  // static createInterface(): WowXYZERC20Interface {
  //   return new Interface(_abi) as WowXYZERC20Interface;
  // }
  static connect(runner: ContractRunner):Contract {
    return new Contract(address, _abi, runner) ;
  }

}