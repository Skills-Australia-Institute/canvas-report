import { zodResolver } from '@hookform/resolvers/zod';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import SAILogo from '../assets/sai-logo.png';
import ErrorCallout from '../components/errorCallout';
import { useSupabase } from '../hooks/supabase';

const formSchema = z.object({
  email: z
    .string()
    .email({ message: 'Valid email is required.' })
    .min(1, { message: 'Valid email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function Login() {
  const supabase = useSupabase();
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'john@skillsaustralia.edu.au',
      password: '',
    },
  });

  async function onSubmit({ email, password }: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
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
    <div className="flex flex-col items-center mt-24">
      <img src={SAILogo} className="h-20 mb-6" />
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 p-2">
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
        <div className="flex justify-between items-center mb-4">
          <a href="/forgot-password" className="underline">
            Forgot password?
          </a>
          <Button type="submit" className="cursor-pointer" variant="surface">
            Login
          </Button>
        </div>
        {errMsg && <ErrorCallout msg={errMsg} />}
      </form>
    </div>
  );
}