import "@rainbow-me/rainbowkit/styles.css";

import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_ID || "";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.goerli, chain.hardhat],
  [alchemyProvider({ apiKey }), publicProvider()]
);

const { connectors } = getDefaultWallets({ appName: "Escrow", chains });
const wagmiClient = createClient({ autoConnect: true, connectors, provider });

const theme = extendTheme({
  config: { initialColorMode: "dark" },
  components: {
    Input: { defaultProps: { variant: "filled" } },
    Select: { defaultProps: { variant: "filled" } },
  },
});

console.log(theme);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            // Use Chakra colors
            accentColor: theme.colors.blue[200],
            accentColorForeground: theme.colors.gray[800],
            borderRadius: "small",
          })}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}
