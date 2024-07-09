import ReactQueryClientProvider from './providers/reactQueryClient';
import RouterProvider from './providers/router';

function App() {
  return (
    <ReactQueryClientProvider>
      <RouterProvider />
    </ReactQueryClientProvider>
  );
}

export default App;
