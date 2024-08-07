import { zodResolver } from '@hookform/resolvers/zod';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Tabs,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';
import Callout from '../components/callout';
import { AuthUser } from '../entities/supabase/authUser';
import { useAuth } from '../hooks/auth';
import { useSupabase } from '../hooks/supabase';
import { supabase } from '../supabase';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const fullName = user.first_name + ' ' + user.last_name;

  return (
    <div className="w-full">
      <Heading size="3">{fullName}</Heading>
      <Tabs.Root defaultValue="Profile">
        <Tabs.List>
          <Tabs.Trigger value="Profile" className="cursor-pointer">
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger value="ChangePassword" className="cursor-pointer">
            Change Password
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value="Profile" className="mt-2">
            <ProfileSection user={user} />
          </Tabs.Content>
          <Tabs.Content value="ChangePassword" className="mt-2">
            <ChangePassword />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
});

function ProfileSection({ user }: { user: AuthUser }) {
  const [edit, setEdit] = useState(false);
  const [callout, setCallout] = useState<ICallout | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user.first_name || '',
      lastName: user.last_name || '',
    },
  });

  async function onSubmit({
    firstName,
    lastName,
  }: z.infer<typeof profileFormSchema>) {
    setCallout(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (error) {
        return setCallout({ type: 'error', msg: error.message });
      }

      setCallout({
        type: 'success',
        msg: 'Your profile has been updated successfully.',
      });
    } catch (err) {
      setCallout({ type: 'error', msg: 'Something went wrong. Try again.' });
    } finally {
      setEdit(false);
    }
  }
  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <Text>Email</Text>
          <TextField.Root value={user.email || ''} disabled></TextField.Root>
        </div>
        <div className="mb-4">
          <Text>Role</Text>
          <TextField.Root value={user.app_role || ''} disabled></TextField.Root>
        </div>
        <div className="flex justify-between mb-6">
          <Controller
            name="firstName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div>
                <Text>First name</Text>
                <TextField.Root {...field} disabled={!edit}></TextField.Root>
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
              <div>
                <Text>Last name</Text>
                <TextField.Root {...field} disabled={!edit}></TextField.Root>
                {errors.lastName && (
                  <Text color="red" size="2">
                    {errors.lastName.message}
                  </Text>
                )}
              </div>
            )}
          />
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-6 ">
            <Button
              type="submit"
              disabled={!edit || isSubmitting}
              className="cursor-pointer inline"
              color="teal"
            >
              Submit
            </Button>
            {isSubmitting && <Spinner size="3" />}
          </div>
          <Button
            type="button"
            color={edit ? 'blue' : 'indigo'}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setEdit(!edit);
              reset();
            }}
            disabled={isSubmitting}
          >
            {edit ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        {callout && <Callout type={callout.type} msg={callout.msg} />}
      </form>
    </div>
  );
}

const changePasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Minimum of 6 characters is required.' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Minimum of 6 characters is required.' }),
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

interface ICallout {
  type: 'error' | 'success';
  msg: string;
}
function ChangePassword() {
  const supabase = useSupabase();
  const [callout, setCallout] = useState<ICallout | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof changePasswordFormSchema>>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit({
    password,
    confirmPassword,
  }: z.infer<typeof changePasswordFormSchema>) {
    setCallout(null);
    try {
      if (password !== confirmPassword) {
        return setCallout({
          type: 'error',
          msg: 'Password did not match.',
        });
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        return setCallout({
          type: 'error',
          msg: error.message,
        });
      }

      reset();
      setCallout({
        type: 'success',
        msg: 'Your password has been changed successfully.',
      });
    } catch (err) {
      setCallout({ type: 'error', msg: 'Something went wrong. Try again.' });
    }
  }
  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <Text>New password</Text>
              <TextField.Root
                {...field}
                type={showPassword ? 'text' : 'password'}
                disabled={isSubmitting}
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
            <div className="mb-5">
              <Text>Confirm password</Text>
              <TextField.Root
                {...field}
                type={showConfirmPassword ? 'text' : 'password'}
                disabled={isSubmitting}
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
              {errors.confirmPassword && (
                <Text color="red" size="2">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </div>
          )}
        />
        <div className="flex items-center gap-6 ">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer inline"
            color="teal"
          >
            Submit
          </Button>
          {isSubmitting && <Spinner size="3" />}
        </div>
        {callout && <Callout type={callout.type} msg={callout.msg} />}
      </form>
    </div>
  );
}
