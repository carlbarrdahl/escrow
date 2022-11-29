import { Button, Flex } from "@chakra-ui/react";
import { useEscrowDeploy } from "hooks/useEscrowDeploy";
import EscrowConfig from "./EscrowConfig";

export default function EscrowDeploy() {
  const deploy = useEscrowDeploy();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const {
          client,
          talent,
          resolver,
          fee = 1500,
        } = Object.fromEntries(new FormData(e.target as HTMLFormElement));

        // Call the contract
        deploy.write?.({
          recklesslySetUnpreparedArgs: [client, talent, resolver, fee],
        });
      }}
    >
      <EscrowConfig />
      <Flex justify={"center"}>
        <Button
          type="submit"
          isLoading={deploy.isLoading}
          disabled={deploy.isLoading}
        >
          Create Escrow
        </Button>
      </Flex>
    </form>
  );
}
