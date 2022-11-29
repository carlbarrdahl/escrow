import { useNetwork } from "wagmi";

import { contracts, ContractType } from "config";

export function useContractConfig(contract: ContractType) {
  const { chain } = useNetwork();

  console.log(chain);
  if (!chain?.id) return { address: "" };

  const id = chain.id as keyof typeof contracts;
  return contracts[id][contract] || { address: "" };
}
