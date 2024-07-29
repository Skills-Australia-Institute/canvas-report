import { zodResolver } from '@hookform/resolvers/zod';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import SAILogoFull from '../assets/sai-logo-full.png';
import Callout from '../components/callout';
import { useSupabase } from '../hooks/supabase';

const formSchema = z
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

export default function ResetPassword() {
  const supabase = useSupabase();
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit({ password }: z.infer<typeof formSchema>) {
    setErrMsg('');
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (!error) {
        return navigate('/');
      }

      setErrMsg(error.message);
    } catch (err) {
      setErrMsg('Something went wrong. Try again.');
    }
  }

  return (
    <main className="flex flex-col items-center pt-24">
      <img src={SAILogoFull} className="h-20 mb-6" />
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 p-2">
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
                  {showPassword ? (
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
        <div className="flex justify-between items-center mb-4">
          <a href="/login" className="underline">
            Back to login
          </a>
          <Button type="submit" className="cursor-pointer" variant="surface">
            Reset password
          </Button>
        </div>
        {errMsg && <Callout type="error" msg={errMsg} />}
      </form>
    </main>
  );
}
