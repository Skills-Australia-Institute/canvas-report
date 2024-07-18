import { RouterProvider as RP } from 'react-router-dom';
import { router } from '../router';

export default function RouterProvider() {
  return <RP router={router} />;
}
