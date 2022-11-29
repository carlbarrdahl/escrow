import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { parseEther } from "ethers/lib/utils.js";
import { useEscrowWrite } from "hooks/useEscrow";
import { useForm } from "hooks/useForm";

export default function RefundForm({ address = "", token = "" }) {
  const { register, formState, reset, handleSubmit } = useForm<{
    refund: string;
    message: string;
  }>();

  const { write, isLoading } = useEscrowWrite({
    address,
    functionName: "refund",
    onSuccess: () => reset(),
  });

  return (
    <form
      onSubmit={handleSubmit(({ refund, message = "" }) => {
        const args = [token, parseEther(refund as string), message];
        write?.({ recklesslySetUnpreparedArgs: args });
      })}
    >
      <FormControl mb={2}>
        <FormLabel>Request Refund</FormLabel>
        <Input
          type="number"
          name="refund"
          placeholder="300"
          {...register("refund")}
        />
      </FormControl>
      <FormControl>
        <Input name="message" placeholder="Message" {...register("message")} />
      </FormControl>
      <Button
        w="100%"
        type="submit"
        variant={"ghost"}
        colorScheme="red"
        isLoading={isLoading}
        disabled={isLoading || !formState.refund}
      >
        Refund
      </Button>
    </form>
  );
}
