import { Theme } from '@radix-ui/themes';
import ReactQueryClientProvider from './providers/reactQueryClient';
import RouterProvider from './providers/router';
import SessionProvider from './providers/session';

function App() {
  return (
    <SessionProvider>
      <Theme>
        <ReactQueryClientProvider>
          <RouterProvider />
        </ReactQueryClientProvider>
      </Theme>
    </SessionProvider>
  );
}

export default App;
