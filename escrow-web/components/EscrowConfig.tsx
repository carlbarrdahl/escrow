import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";

const addressInputs = {
  pattern: "^0x[a-fA-F0-9]{40}",
  title: "Must be a valid Ethereum address",
  placeholder: "0x...",
  required: true,
};

interface Props {
  disabled?: boolean;
  defaultValues?: {
    client?: string;
    talent?: string;
    resolver?: string;
    fee?: number;
  };
}
export default function EscrowConfig({
  disabled = false,
  defaultValues = {},
}: Props) {
  const { client, talent, resolver, fee } = defaultValues;
  return (
    <VStack align="stretch" mb={12}>
      <HStack>
        <FormControl isDisabled={disabled}>
          <FormLabel>Resolver</FormLabel>
          <Input name="resolver" defaultValue={resolver} {...addressInputs} />
        </FormControl>
        <FormControl isDisabled={disabled} width={120}>
          <FormLabel>Fee</FormLabel>
          <Input
            name="fee"
            {...addressInputs}
            type="number"
            min={0}
            max={9999}
            defaultValue={fee}
            placeholder="1500"
            disabled={disabled}
          />
        </FormControl>
      </HStack>
      <HStack>
        <FormControl isDisabled={disabled}>
          <FormLabel>Client</FormLabel>
          <Input name="client" defaultValue={client} {...addressInputs} />
        </FormControl>
        <FormControl isDisabled={disabled}>
          <FormLabel>Talent</FormLabel>
          <Input name="talent" defaultValue={talent} {...addressInputs} />
        </FormControl>
      </HStack>
    </VStack>
  );
}
