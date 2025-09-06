// Your EmotionRecorder contract address
export const EMOTION_RECORDER_ADDRESS =
  "0x2942d65D44217b4F1A2F69972e9286aeeE2780a2" as const;

// Contract addresses for Rise Testnet only
export const CONTRACT_ADDRESSES = {
  // Rise Testnet (Chain ID: 11155931)
  11155931: {
    emotionRecorder: EMOTION_RECORDER_ADDRESS,
  },
} as const;

// Your EmotionRecorder contract ABI
export const EMOTION_RECORDER_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "userId",
        type: "string",
      },
    ],
    name: "getEmotions",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "emotion",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct EmotionRecorder.EmotionRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        internalType: "string",
        name: "emotion",
        type: "string",
      },
    ],
    name: "recordEmotion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Helper function to get contract address for current chain
export const getContractAddress = (
  chainId: number,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[11155931]
) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.[
    contractName
  ];
};

// Contract configuration object
export const CONTRACTS = {
  emotionRecorder: {
    abi: EMOTION_RECORDER_ABI,
    addresses: {
      11155931: CONTRACT_ADDRESSES[11155931].emotionRecorder,
    },
  },
} as const;

// Type for EmotionRecord struct
export interface EmotionRecord {
  emotion: string;
  timestamp: bigint;
}
