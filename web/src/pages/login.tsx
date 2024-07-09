import { FormEvent, FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/button';
import ErrorAlert from '../components/errorAlert';
import { useSupabase } from '../hooks/auth';

export default function LoginPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const navigate = useNavigate();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    e: FormEvent
  ) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (!error) {
        navigate('/');
      }
    } catch (err) {
      setErrMsg('Something went wrong. Try again.');
    }
  };

  return (
    <div className="mt-24">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center"
      >
        <label>Email</label>
        <input
          type="email"
          className="border-solid border-2 border-gray-400 rounded mb-4"
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <label>Password</label>
        <input
          type="password"
          className="border-solid border-2 border-gray-400 rounded mb-4"
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <Button type="submit" text="Login" />
        {errMsg && <ErrorAlert msg={errMsg} />}
      </form>
    </div>
  );
}
