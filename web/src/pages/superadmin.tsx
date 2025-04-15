import { zodResolver } from '@hookform/resolvers/zod';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Button,
  Heading,
  ScrollArea,
  Select,
  Table,
  Tabs,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import Callout from '../components/callout';
import Loading from '../components/loading';
import { AppRole } from '../constants';
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
        Admin Tools
      </Heading>
      <Tabs.Root defaultValue="Users">
        <Tabs.List>
          <Tabs.Trigger value="Users" className="cursor-pointer">
            Users
          </Tabs.Trigger>
          <Tabs.Trigger value="Add user" className="cursor-pointer">
            Add user
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value="Users">
            {data && <AuthUsersTable users={data} />}
          </Tabs.Content>
          <Tabs.Content value="Add user">
            <AddUser />
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
    <ScrollArea
      type="auto"
      scrollbars="vertical"
      className="pr-4"
      style={{ maxHeight: 600 }}
    >
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
                  new Date(u.last_sign_in_at).toLocaleString('en-AU')}
              </Table.Cell>
              <Table.Cell>
                {u.created_at && new Date(u.created_at).toLocaleString('en-AU')}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  );
}

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z
    .string()
    .email({ message: 'Valid email is required.' })
    .min(1, { message: 'Valid email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  confirmPassword: z.string().min(1, { message: 'Password is required.' }),
  role: z.enum(Object.values(AppRole) as [string, ...string[]], {
    required_error: 'Role is required.',
  }),
});

function AddUser() {
  const [errMsg, setErrMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '@skillsaustralia.edu.au',
      password: '',
      confirmPassword: '',
      role: AppRole.Compliance,
    },
  });

  async function onSubmit({
    password,
    confirmPassword,
  }: z.infer<typeof formSchema>) {
    setErrMsg('');

    if (password !== confirmPassword) {
      setErrMsg('Password did not match.');
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-96 p-2">
      <Controller
        name="firstName"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-4">
            <Text>First name</Text>
            <TextField.Root {...field}></TextField.Root>
            {errors.firstName && (
              <Text color="red" size="2">
                {errors.firstName.message}
              </Text>
            )}
          </div>
        )}
      />
      <Controller
        name="lastName"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-4">
            <Text>Last name</Text>
            <TextField.Root {...field}></TextField.Root>
            {errors.lastName && (
              <Text color="red" size="2">
                {errors.lastName.message}
              </Text>
            )}
          </div>
        )}
      />
      <Controller
        name="email"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-4">
            <Text>Email</Text>
            <TextField.Root {...field}></TextField.Root>
            {errors.email && (
              <Text color="red" size="2">
                {errors.email.message}
              </Text>
            )}
          </div>
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <div className="mb-4">
            <Text>Password</Text>
            <TextField.Root
              {...field}
              type={showPassword ? 'text' : 'password'}
            >
              <TextField.Slot
                onClick={() => setShowPassword(!showPassword)}
                side="right"
                className="cursor-pointer"
              >
                {showPassword ? (
                  <EyeOpenIcon height="16" width="16" />
                ) : (
                  <EyeNoneIcon height="16" width="16" />
                )}
              </TextField.Slot>
            </TextField.Root>
            {errors.password && (
              <Text color="red" size="2">
                {errors.password.message}
              </Text>
            )}
          </div>
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <div className="mb-4">
            <Text>Confirm password</Text>
            <TextField.Root
              {...field}
              type={showConfirmPassword ? 'text' : 'password'}
            >
              <TextField.Slot
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                side="right"
                className="cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOpenIcon height="16" width="16" />
                ) : (
                  <EyeNoneIcon height="16" width="16" />
                )}
              </TextField.Slot>
            </TextField.Root>
            {errors.password && (
              <Text color="red" size="2">
                {errors.password.message}
              </Text>
            )}
          </div>
        )}
      />
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <div className="mb-4">
            <Text mr="2">Assign role</Text>
            <Select.Root onValueChange={field.onChange} {...field}>
              <Select.Trigger />
              <Select.Content className="max-w-sm">
                {Object.values(AppRole).map((value) => (
                  <Select.Item value={value}>{value}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {errors.role && (
              <Text color="red" size="2">
                {errors.role.message}
              </Text>
            )}
          </div>
        )}
      />
      <div className="mb-4">
        <Button type="submit" className="cursor-pointer" variant="surface">
          Submit
        </Button>
      </div>
      {errMsg && <Callout type={'error'} msg={errMsg} />}
    </form>
  );
}
