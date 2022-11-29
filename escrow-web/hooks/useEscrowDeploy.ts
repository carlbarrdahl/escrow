import { useContractWrite, useWaitForTransaction } from "wagmi";

import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useBeforeUnload } from "react-use";

import EscrowFactory from "contracts/EscrowFactory.json";
import { useContractConfig } from "./useContractConfig";

export function useEscrowDeploy() {
  const toast = useToast();
  const router = useRouter();
  const { address } = useContractConfig("EscrowFactory");

  const deploy = useContractWrite({
    address,
    abi: EscrowFactory.abi,
    functionName: "create",
    // We don't know the parameters until form is submitted so this mode is required
    mode: "recklesslyUnprepared",
    onError: (err) =>
      toast({
        title: "Escrow deployment failed",
        description: `${err.message}`,
        status: "error",
      }),
  });

  const waitForTransaction = useWaitForTransaction({
    hash: deploy.data?.hash,
    onSuccess: (data) => {
      const { address } = data.logs[0];
      toast({
        title: "Escrow Created",
        description: `The Escrow smart contract was deployed successfully with address: ${address}`,
        status: "success",
      });

      // Redirect to Escrow page
      router.push(`/escrow/${address}`);
    },
  });

  // Show an alert if user tries to close or navigate from page
  useBeforeUnload(deploy.isLoading || waitForTransaction.isLoading);

  return {
    ...deploy,
    isLoading: deploy.isLoading || waitForTransaction.isLoading,
  };
}
