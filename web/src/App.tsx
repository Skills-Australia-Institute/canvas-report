import { Theme } from '@radix-ui/themes';
import ReactQueryClientProvider from './providers/reactQueryClient';
import RouterProvider from './providers/router';
import SessionProvider from './providers/session';

function App() {
  return (
    <Theme>
      <SessionProvider>
        <ReactQueryClientProvider>
          <RouterProvider />
        </ReactQueryClientProvider>
      </SessionProvider>
    </Theme>
  );
}

export default App;
