import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { parseUnits } from "ethers/lib/utils.js";
import { useAllowance, useApprove, useEscrowWrite } from "hooks/useEscrow";
import { useForm } from "hooks/useForm";
import { Address } from "wagmi";

interface Props {
  address: Address;
  token: Address;
}
export default function DepositReleaseForm({ address, token }: Props) {
  const { register, formState, reset, handleSubmit } = useForm<{
    deposit: string;
    release: string;
    message: string;
  }>();

  const approve = useApprove({ token });
  const allowance = useAllowance({ address, token });

  const deposit = useEscrowWrite({
    address,
    functionName: "deposit",
    onSuccess: () => reset(),
  });
  const release = useEscrowWrite({
    address,
    functionName: "release",
    onSuccess: () => reset(),
  });

  const depositAmount = parseUnits(formState.deposit || "0");
  const releaseAmount = parseUnits(formState.release || "0");
  const hasAllowance = formState.deposit
    ? allowance.data?.gte(depositAmount)
    : true;

  function handleApprove() {
    approve.write?.({
      recklesslySetUnpreparedArgs: [address, depositAmount],
    });
  }

  const buttonText = formState.release
    ? formState.deposit
      ? "Deposit & Release"
      : "Release"
    : "Deposit";
  return (
    <Box
      as="form"
      mb={8}
      onSubmit={handleSubmit((values) => {
        if (values.deposit) {
          const args = [token, depositAmount, releaseAmount, ""];
          return deposit.write?.({ recklesslySetUnpreparedArgs: args });
        }
        if (values.release) {
          const args = [token, releaseAmount, ""];
          return release.write?.({ recklesslySetUnpreparedArgs: args });
        }
      })}
    >
      <VStack align="stretch" mb={2}>
        <FormControl>
          <FormLabel>Deposit</FormLabel>
          <HStack>
            <Input
              type="number"
              name="deposit"
              placeholder="300"
              {...register("deposit")}
            />
            <Button
              w={64}
              onClick={handleApprove}
              disabled={
                hasAllowance ||
                !formState.deposit ||
                approve.isLoading ||
                allowance.isLoading
              }
              isLoading={approve.isLoading || allowance.isLoading}
            >
              {hasAllowance ? <CheckIcon /> : "Approve"}
            </Button>
          </HStack>
        </FormControl>
        <FormControl>
          <FormLabel>Release</FormLabel>
          <Input
            type="number"
            name="release"
            placeholder="300"
            {...register("release")}
          />
        </FormControl>
      </VStack>

      <Button
        w="100%"
        type="submit"
        colorScheme={"blue"}
        disabled={!hasAllowance || !(formState.deposit || formState.release)}
      >
        {buttonText}
      </Button>
    </Box>
  );
}
