import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Select,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Address, useBalance } from "wagmi";
import { createGlobalState } from "react-use";
import { tokens } from "config";

export const useSelectedToken = createGlobalState<Address>(tokens[0].value);

export default function EscrowBalance() {
  const address = useRouter().query.address as Address;
  const [token, setToken] = useSelectedToken();

  const balance = useBalance({
    address,
    token,
    watch: true, // Update automatically when deposit happens
    enabled: Boolean(address && token),
  });
  return (
    <HStack>
      <Stat>
        <StatLabel>Funds in Escrow</StatLabel>
        <StatNumber>
          {balance.data?.symbol}
          {balance.data?.formatted || "No funds in Escrow"}
        </StatNumber>
      </Stat>
      <Box>
        <FormControl>
          <FormLabel>Token</FormLabel>
          <Select
            value={token}
            onChange={(e) => setToken(e.target.value as Address)}
          >
            {tokens.map((token) => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </Box>
    </HStack>
  );
}
