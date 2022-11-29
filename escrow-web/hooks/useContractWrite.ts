import { useToast } from "@chakra-ui/react";
import { useBeforeUnload } from "react-use";
import { useContractWrite, useWaitForTransaction } from "wagmi";

// Helper function to wait for transaction which let's us update the UI with proper state
export function useContractWriteWait({
  address,
  abi,
  functionName,
  onSuccess,
  onError,
}: any) {
  const toast = useToast();
  const fn = useContractWrite({
    address,
    abi,
    functionName,
    mode: "recklesslyUnprepared",
    onError: (err) => onError && toast(onError(err)),
  });
  const waitForTransaction = useWaitForTransaction({
    hash: fn.data?.hash,
    onSuccess: (data) => onSuccess && toast(onSuccess(data)),
  });

  // Show an alert if user tries to close or navigate from page
  useBeforeUnload(fn.isLoading || waitForTransaction.isLoading);

  return {
    ...fn,
    isLoading: fn.isLoading || waitForTransaction.isLoading,
  };
}
