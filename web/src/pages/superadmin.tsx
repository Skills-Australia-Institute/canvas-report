import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  ScrollArea,
  Select,
  Spinner,
  Table,
  Tabs,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getAuthUsers } from '../api/supabase/authUsers';
import Callout from '../components/callout';
import Canvas from '../components/canvas';
import Loading from '../components/loading';
import { APP_ROLES } from '../constants';
import { AuthUser } from '../entities/supabase/authUser';
import { useSupabase } from '../hooks/supabase';

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
          <Tabs.Trigger value="Canvas" className="cursor-pointer">
            Canvas
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value="Users">
            <div className="mt-2 mb-1">
              <CreateUserDialog />
            </div>
            {data && <AuthUsersTable users={data} />}
          </Tabs.Content>
          <Tabs.Content value="Canvas">
            <Canvas />
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
                <Badge color={RoleColorMap.get(u.app_role) || 'amber'}>
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

const formSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Valid email is required.' })
      .min(1, { message: 'Valid email is required.' }),
    firstName: z.string().min(1, { message: 'First name is required.' }),
    lastName: z.string().min(1, { message: 'Last name is required.' }),
    password: z
      .string()
      .min(6, { message: 'Minimum of 6 characters is required.' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Minimum of 6 characters is required.' }),
    role: z.string().min(1, { message: 'Role is required.' }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match.',
        path: ['confirmPassword'],
      });
    }
  });

function CreateUserDialog() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'john@skillsaustralia.edu.au',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: APP_ROLES[0],
    },
  });
  const [errMsg, setErrMsg] = useState('');

  async function onSubmit({
    email,
    password,
    firstName,
    lastName,
    role,
  }: z.infer<typeof formSchema>) {
    setErrMsg('');
    try {
      console.log(firstName, lastName, email, password, role);
    } catch (err) {
      setErrMsg('Something went wrong. Try again.');
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button className="cursor-pointer">Create user</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Create user</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Fill in the form and submit to create a new user.
        </Dialog.Description>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex gap-3 justify-between">
            <Controller
              disabled={isSubmitting}
              name="firstName"
              control={control}
              render={({ field }) => (
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    First name
                  </Text>
                  <TextField.Root {...field} />
                  {errors.firstName && (
                    <Text color="red" size="1">
                      {errors.firstName.message}
                    </Text>
                  )}
                </label>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              disabled={isSubmitting}
              render={({ field }) => (
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Last name
                  </Text>
                  <TextField.Root {...field} />
                  {errors.lastName && (
                    <Text color="red" size="1">
                      {errors.lastName.message}
                    </Text>
                  )}
                </label>
              )}
            />
          </div>
          <Controller
            name="email"
            control={control}
            disabled={isSubmitting}
            render={({ field }) => (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Email
                </Text>
                <TextField.Root {...field} />
                {errors.email && (
                  <Text color="red" size="1">
                    {errors.email.message}
                  </Text>
                )}
              </label>
            )}
          />
          <Controller
            name="password"
            control={control}
            disabled={isSubmitting}
            render={({ field }) => (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Password
                </Text>
                <TextField.Root {...field} />
                {errors.password && (
                  <Text color="red" size="1">
                    {errors.password.message}
                  </Text>
                )}
              </label>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            disabled={isSubmitting}
            render={({ field }) => (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Confirm password
                </Text>
                <TextField.Root {...field} />
                {errors.confirmPassword && (
                  <Text color="red" size="1">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </label>
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Role
                </Text>
                <Select.Root
                  onValueChange={field.onChange}
                  defaultValue={APP_ROLES[0]}
                  disabled={isSubmitting}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {APP_ROLES.map((r) => (
                      <Select.Item key={r} value={r}>
                        {r}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {errors.role && (
                  <Text color="red" size="1">
                    {errors.role.message}
                  </Text>
                )}
              </label>
            )}
          />
          <Flex gap="3" mt="4" justify="end" align="center">
            {isSubmitting && <Spinner size="3" />}
            <Dialog.Close>
              <Button
                color="gray"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              Save
            </Button>
          </Flex>
        </form>
        {errMsg && <Callout type="error" msg={errMsg} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}
