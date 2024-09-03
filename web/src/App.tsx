import { Theme } from '@radix-ui/themes';
import { Toaster } from 'react-hot-toast';
import ReactQueryClientProvider from './providers/reactQueryClient';
import RouterProvider from './providers/router';
import SessionProvider from './providers/session';

function App() {
  return (
    <Theme>
      <SessionProvider>
        <ReactQueryClientProvider>
          <RouterProvider />
          <Toaster />
        </ReactQueryClientProvider>
      </SessionProvider>
    </Theme>
  );
}

export default App;
