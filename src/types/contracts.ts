import type { Address } from "viem";

// Type definitions for your contracts
export interface ContractConfig {
  abi: readonly unknown[];
  addresses: Record<number, Address>;
}

export interface ContractAddresses {
  emotionRecorder: Address;
}

export type SupportedChainId = 11155931;

export type ContractName = keyof ContractAddresses;

// EmotionRecord struct type
export interface EmotionRecord {
  emotion: string;
  timestamp: bigint;
}
