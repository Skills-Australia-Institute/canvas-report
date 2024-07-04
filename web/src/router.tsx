import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import OAuth2Response from './pages/auth/oAuth2Response';

const router = createBrowserRouter([
  {
    path: '/oauth2response',
    element: <OAuth2Response />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
