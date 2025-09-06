import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS } from "../contracts";
import type { ContractName, SupportedChainId } from "../types/contracts";

// Hook to get contract address for current chain
export const useContractAddress = (contractName: ContractName) => {
  const { chain } = useAccount();

  if (!chain || !CONTRACTS[contractName]) {
    return undefined;
  }

  return CONTRACTS[contractName].addresses[chain.id as SupportedChainId];
};

// Hook to write to your EmotionRecorder contract
export const useEmotionRecorderWrite = () => {
  return useWriteContract();
};

// Specific hooks for EmotionRecorder contract functions

// Hook to get emotions for a user
export const useGetEmotions = (userId?: number) => {
  const { chain } = useAccount();
  const contractAddress = useContractAddress("emotionRecorder");

  return useReadContract({
    address: contractAddress,
    abi: CONTRACTS.emotionRecorder.abi,
    functionName: "getEmotions",
    args: userId !== undefined ? [BigInt(userId)] : undefined,
    chainId: chain?.id,
  });
};

// Hook to record an emotion
export const useRecordEmotion = () => {
  const { writeContract, isPending, isSuccess, error } =
    useEmotionRecorderWrite();
  const contractAddress = useContractAddress("emotionRecorder");

  const recordEmotion = async (userId: number, emotion: string) => {
    if (!contractAddress) {
      throw new Error("Contract address not found for current chain");
    }

    return writeContract({
      address: contractAddress,
      abi: CONTRACTS.emotionRecorder.abi,
      functionName: "recordEmotion",
      args: [BigInt(userId), emotion],
    });
  };

  return {
    recordEmotion,
    isPending,
    isSuccess,
    error,
  };
};
