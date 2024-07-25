import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import SAILogo from '../assets/sai-logo.png';
import Callout from '../components/callout';
import { useSupabase } from '../hooks/supabase';

const formSchema = z.object({
  email: z
    .string()
    .email({ message: 'Valid email is required.' })
    .min(1, { message: 'Valid email is required.' }),
});

const redirect = 'https://skillsaustralia.netlify.app/reset-password';

export default function ForgotPassword() {
  const supabase = useSupabase();
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'john@skillsaustralia.edu.au',
    },
  });

  async function onSubmit({ email }: z.infer<typeof formSchema>) {
    setErrMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirect,
      });

      if (!error) {
        return setSuccess(true);
      }

      setErrMsg(error.message);
    } catch (err) {
      setErrMsg('Something went wrong. Try again.');
    }
  }

  if (success) {
    return (
      <main className="flex flex-col items-center pt-24">
        <img src={SAILogo} className="h-20 mb-6" />
        <div className="w-96 p-2">
          <p className="mb-4">
            A password reset link has been emailed. This link will redirect you
            to password reset page.
          </p>
          <p className="mb-4">
            If <span className="font-bold">{getValues('email')}</span> is not
            your email. Try again by clicking below button.
          </p>
          <div className="flex justify-between items-center">
            <a href="/login" className="underline">
              Back to login
            </a>
            <Button
              type="button"
              className="cursor-pointer"
              variant="surface"
              onClick={() => setSuccess(false)}
            >
              Forgot password
            </Button>
          </div>
          {errMsg && <Callout type="error" msg={errMsg} />}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pt-24">
      <img src={SAILogo} className="h-20 mb-6" />
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 p-2">
        <div className="mb-4">
          <Text size="2">
            Enter your email and we'll send you a link to change your password.
          </Text>
        </div>
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
        <div className="flex justify-between items-center mb-4">
          <a href="/login" className="underline">
            Back to login
          </a>
          <Button type="submit" className="cursor-pointer" variant="surface">
            Request password
          </Button>
        </div>
        {errMsg && <Callout type="error" msg={errMsg} />}
      </form>
    </main>
  );
}
