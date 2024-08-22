import {
  Badge,
  Box,
  Heading,
  ScrollArea,
  Table,
  Tabs,
  Text,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import Callout from '../components/callout';
import Loading from '../components/loading';
import { useSupabase } from '../hooks/supabase';
import { AuthUser, getAuthUsers } from '../supabase/authUsers';

export default function Superadmin() {
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['app', 'auth-users'],
    queryFn: () => getAuthUsers(supabase),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Callout type="error" msg={error.message} className="max-w-lg" />;
  }

  return (
    <div className="w-full">
      <Heading size="3" mb="2">
        Dashboard
      </Heading>
      <Tabs.Root defaultValue="Users">
        <Tabs.List>
          <Tabs.Trigger value="Users" className="cursor-pointer">
            Users
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value="Users">
            {data && <AuthUsersTable users={data} />}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

type Color = 'green' | 'blue' | 'gray' | 'teal' | 'purple';

const RoleColorMap = new Map<string, Color>([
  ['Superadmin', 'purple'],
  ['Admin', 'teal'],
  ['Compliance', 'blue'],
  ['Student Services', 'gray'],
]);

function AuthUsersTable({ users }: { users: AuthUser[] }) {
  return (
    <ScrollArea scrollbars="both" className="pr-4" style={{ height: 600 }}>
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Last login</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Created at</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((u) => (
            <Table.Row key={u.id}>
              <Table.Cell>
                <Text className="hover:underline cursor-pointer">
                  {u.first_name + ' ' + u.last_name}
                </Text>
              </Table.Cell>
              <Table.Cell>{u.email}</Table.Cell>
              <Table.Cell>
                <Badge
                  color={u.app_role ? RoleColorMap.get(u.app_role) : 'amber'}
                >
                  {u.app_role}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {u.last_sign_in_at &&
                  new Date(u.last_sign_in_at).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                {u.created_at && new Date(u.created_at).toLocaleString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  );
}
