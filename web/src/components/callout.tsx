import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout as C } from '@radix-ui/themes';

export interface ICallout {
  type: 'success' | 'error';
  msg: string;
}

export default function Callout({ type, msg }: ICallout) {
  return (
    <div className="mt-4">
      <C.Root color={type === 'success' ? 'green' : 'red'}>
        <C.Icon>
          <InfoCircledIcon />
        </C.Icon>
        <C.Text>{msg}</C.Text>
      </C.Root>
    </div>
  );
}