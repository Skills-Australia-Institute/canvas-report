import { Spinner } from '@radix-ui/themes';

export default function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
