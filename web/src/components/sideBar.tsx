import { Flex, TabNav } from '@radix-ui/themes';

export default function SideBar() {
  return (
    <Flex direction="column" gap="4" pb="2">
      <TabNav.Root color="indigo">
        <TabNav.Link href="#" active>
          Account
        </TabNav.Link>
      </TabNav.Root>
      <TabNav.Root color="indigo">
        <TabNav.Link href="#" active>
          Account
        </TabNav.Link>
      </TabNav.Root>
    </Flex>
  );
}
