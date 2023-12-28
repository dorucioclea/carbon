import { Button, CardTitle, HStack, VStack } from "@carbon/react";
import { BsEnvelopeFill } from "react-icons/bs";
import { Avatar } from "~/components";
import { usePermissions } from "~/hooks";
import type { Account } from "~/modules/account";

const PersonHeader = ({ user }: { user: Account }) => {
  const permissions = usePermissions();
  return (
    <HStack className="py-4 justify-between w-full" spacing={4}>
      <HStack spacing={4}>
        <Avatar size="lg" path={user.avatarUrl} />
        <VStack spacing={1}>
          <CardTitle>{user.fullName}</CardTitle>
          <p className="text-muted-foreground text-sm">{user.about}</p>
        </VStack>
      </HStack>
      <HStack>
        {permissions.can("create", "messaging") && (
          <Button
            variant="secondary"
            leftIcon={<BsEnvelopeFill />}
            onClick={() => alert("TODO")}
          >
            Message
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default PersonHeader;
