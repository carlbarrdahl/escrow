import { Box, Container, Flex } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Box minH="100vh">
      <Container maxW="container.sm">
        <Flex justify={"flex-end"} mb={8} py={2}>
          <ConnectButton />
        </Flex>
        {children}
      </Container>
    </Box>
  );
}
