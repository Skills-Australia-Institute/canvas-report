import NotFoundImg from '../assets/not-found.png';
import { useAuth } from '../hooks/auth';
import Layout from './layout';

export default function NotFound() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <Layout>
        <div className="flex items-center justify-center w-full">
          <img src={NotFoundImg} />
        </div>
      </Layout>
    );
  }

  return (
    <main className="flex flex-row min-h-screen justify-center items-center">
      <img src={NotFoundImg} />
    </main>
  );
}
