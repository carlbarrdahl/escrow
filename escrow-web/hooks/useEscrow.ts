import {
  Address,
  erc20ABI,
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import Escrow from "contracts/Escrow.json";

export function useEscrow(address: Address) {
  // The values we want to read from the contract
  const functionNames = ["client", "talent", "resolver", "fee"];
  const escrow = useContractReads({
    enabled: Boolean(address),
    contracts: functionNames.map((functionName) => ({
      address,
      abi: Escrow.abi,
      functionName,
    })),
  });
  return {
    ...escrow,
    // Reduce the array of returned values into an object { client: "0x..", ... }
    data: escrow.data?.reduce(
      (acc: {}, val, i) => ({ ...acc, [functionNames[i]]: val }),
      {}
    ),
  };
}
export const useEscrowWrite = ({
  address = "",
  functionName = "",
  onSuccess = () => {},
}) =>
  useContractWrite({
    address,
    abi: Escrow.abi,
    functionName,
    mode: "recklesslyUnprepared",
    onSuccess,
  });

export function useApprove({ token }: { token: Address }) {
  const approve = useContractWrite({
    address: token,
    abi: erc20ABI,
    functionName: "approve",
    mode: "recklesslyUnprepared",
  });

  const waitForTransaction = useWaitForTransaction({
    hash: approve.data?.hash,
  });

  return {
    ...approve,
    isLoading: approve.isLoading || waitForTransaction.isLoading,
  };
}

export function useAllowance({
  address,
  token,
}: {
  address: Address;
  token: Address;
}) {
  const account = useAccount();
  return useContractRead({
    address: token,
    abi: erc20ABI,
    functionName: "allowance",
    args: [account.address as Address, address],
    enabled: Boolean(address && token && account.address),
    watch: true,
  });
}
