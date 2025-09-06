import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";
import { encryptString, tryDecryptString } from "../utils/crypto";
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
export const useGetEmotions = (userId?: string) => {
  const { chain } = useAccount();
  const contractAddress = useContractAddress("emotionRecorder");

  const readResult = useReadContract({
    address: contractAddress,
    abi: CONTRACTS.emotionRecorder.abi,
    functionName: "getEmotions",
    args: userId !== undefined ? [userId] : undefined,
    chainId: chain?.id,
  });

  type EmotionOnChain = { emotion: string; timestamp: bigint };
  const data = (readResult as unknown as { data?: EmotionOnChain[] }).data;

  const [decrypted, setDecrypted] = useState<
    Array<{ emotion: string; timestamp: bigint }> | undefined
  >(undefined);
  const [decLoading, setDecLoading] = useState(false);
  const [decError, setDecError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDecError(null);
      if (!data) {
        setDecrypted(undefined);
        return;
      }
      setDecLoading(true);
      try {
        const out = await Promise.all(
          (data as EmotionOnChain[]).map(
            async (r: EmotionOnChain, idx: number) => {
              const decrypted = await tryDecryptString(r.emotion);
              // Log opposite direction for Journal: ciphertext -> plaintext
              console.log(`[Journal] Decryption #${idx + 1}:`, {
                ciphertext: r.emotion,
                plaintext: decrypted,
              });
              return {
                ...r,
                emotion: decrypted,
              };
            }
          )
        );
        if (!cancelled) setDecrypted(out);
      } catch (e) {
        if (!cancelled) setDecError(e as Error);
      } finally {
        if (!cancelled) setDecLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const base = readResult as unknown as {
    refetch: () => unknown;
    queryKey?: unknown;
    isLoading: boolean;
    error: Error | null;
    status?: unknown;
  };

  return {
    ...base,
    data: decrypted,
    isLoading: base.isLoading || decLoading,
    error: (base.error || decError) as Error | null,
  } as typeof readResult;
};

// Hook to record an emotion
export const useRecordEmotion = () => {
  const { writeContract, data, isPending, isSuccess, error } =
    useEmotionRecorderWrite();
  const contractAddress = useContractAddress("emotionRecorder");

  const recordEmotion = async (userId: string, emotion: string) => {
    if (!contractAddress) {
      throw new Error("Contract address not found for current chain");
    }

    // Log plaintext before encryption (Record Page flow)
    console.log("[Record] Encrypting emotion (plaintext):", emotion);
    const encryptedEmotion = await encryptString(emotion);
    console.log("[Record] Encrypted emotion (ciphertext):", encryptedEmotion);

    return writeContract({
      address: contractAddress,
      abi: CONTRACTS.emotionRecorder.abi,
      functionName: "recordEmotion",
      args: [userId, encryptedEmotion],
    });
  };

  return {
    recordEmotion,
    data,
    isPending,
    isSuccess,
    error,
  };
};
