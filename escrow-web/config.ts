import { Address, chain } from "wagmi";

export const contracts = {
  [chain.mainnet.id]: {
    EscrowFactory: { address: "" },
  },
  [chain.goerli.id]: {
    EscrowFactory: { address: "" },
  },
  [chain.hardhat.id]: {
    EscrowFactory: { address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" },
  },
};
export type ContractType = keyof typeof contracts[1];

export const tokens: { label: string; value: Address }[] = [
  { label: "TestToken", value: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" },
  { label: "USDC", value: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6" },
];
