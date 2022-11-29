import Layout from "components/Layout";

import { useEscrow } from "hooks/useEscrow";

import DepositReleaseForm from "components/DepositReleaseForm";
import EscrowBalance, { useSelectedToken } from "components/EscrowBalance";
import EscrowConfig from "components/EscrowConfig";
import RefundForm from "components/RefundForm";
import { useRouter } from "next/router";

export default function Escrow() {
  const { address } = useRouter().query;
  const escrow = useEscrow(address as string);
  const [token] = useSelectedToken();

  return (
    <Layout>
      <EscrowConfig disabled defaultValues={escrow.data} />
      <EscrowBalance />
      <DepositReleaseForm address={address} token={token} />
      <RefundForm address={address} token={token} />
    </Layout>
  );
}
