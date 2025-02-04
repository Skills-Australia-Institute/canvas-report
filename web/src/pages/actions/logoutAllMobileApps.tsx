import { Cross2Icon } from '@radix-ui/react-icons';
import { Button, Dialog, Spinner, Text } from '@radix-ui/themes';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { logoutAllFromMobileApps } from '../../canvas/users';

export default function LogoutAllMobileApps() {
  const [inProgress, setInProgress] = useState(false);

  const title = 'Logout everyone from mobile apps';
  const description = 'Logout all Canvas users from mobile apps.';

  const handleSubmit = async () => {
    setInProgress(true);

    try {
      const status = await logoutAllFromMobileApps();
      if (status === 200) {
        toast.success('Logged out everyone from mobile apps successfully.');
      }
    } catch (error: unknown) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setInProgress(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <div className="p-6 rounded-md bg-slate-700 text-white color hover:bg-slate-600 max-w-sm pointer-events-none">
          <Text className="block font-bold mb-1">{title}</Text>
          <Text className="block" size="2">
            {description}
          </Text>
          <Button className="bg-cyan-500 cursor-pointer hover:bg-cyan-400 mt-4 pointer-events-auto">
            Click here
          </Button>
        </div>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-xl max-h-lvh">
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description className="mb-3">{description}</Dialog.Description>
        <Dialog.Close>
          <button className="h-6 w-6 bg-violet-100 rounded-full absolute top-5 right-5 flex justify-center items-center hover:bg-violet-200">
            <Cross2Icon className="h-4 w-4" />
          </button>
        </Dialog.Close>
        <div>
          <div className="mt-4 mb-4 flex items-center gap-4">
            <Button
              className="cursor-pointer"
              type="button"
              onClick={handleSubmit}
            >
              Proceed
            </Button>
            {inProgress && <Spinner size="3" />}
          </div>
          <Toaster />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
