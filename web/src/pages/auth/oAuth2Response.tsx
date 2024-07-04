import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function OAuth2Response() {
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post('/todos', newTodo);
    },
  });
  const [params] = useSearchParams();
  const error = params.get('error');

  useEffect(() => {
    mutation.mutate();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const code = params.get('code');
  const state = params.get('state');

  return <></>;
}
