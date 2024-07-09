import { FormEvent, FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SAILogo from '../assets/sai-logo.png';
import ErrorAlert from '../components/errorAlert';
import { useSupabase } from '../hooks/auth';

export default function ForgotPasswordPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('Something went wrong. Try again.');

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
    <div className="flex flex-col items-center mt-24">
      <img src={SAILogo} className="h-20 mb-4" />
      <form onSubmit={handleSubmit} className="w-96 p-2">
        <label className="block">Email</label>
        <input
          type="email"
          className="border-solid border-2 border-gray-400 rounded mb-4 w-full px-2 py-1"
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <label className="block">Password</label>
        <input
          type="password"
          className="border-solid border-2 border-gray-400 rounded mb-4 w-full px-2 py-1"
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <div className="flex justify-between">
          <a href="/login" className="underline">
            Back to login
          </a>
          <button
            type="submit"
            className="border-solid  bg-blue-400 rounded-md mb-4 py-1 px-4 text-white font-medium"
          >
            Request password
          </button>
        </div>
        {errMsg && <ErrorAlert msg={errMsg} />}
      </form>
    </div>
  );
}
