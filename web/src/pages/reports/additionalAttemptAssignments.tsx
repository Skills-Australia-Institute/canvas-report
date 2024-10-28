import { Cross2Icon } from '@radix-ui/react-icons';
import { Badge, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { createContext, FormEvent, PropsWithChildren, useState } from 'react';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';
import Callout from '../../components/callout';
import { User } from '../../supabase/users';

export default function AdditionalAttemptAssigments() {
  const [dates, setDates] = useState<DateValueType>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [errMsg, setErrMsg] = useState('');
  const [isProgress, setIsProgress] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (searchTerms.length === 0) {
      setErrMsg('Please enter search terms.');
      setIsProgress(false);
      return;
    }

    setIsProgress(true);
  };

  const updateSearchTerms = (items: string[]) => {
    setSearchTerms(items);
  };

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Additional Attempt Assignments Report
      </Text>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-20">
          <div className="mb-3 w-full">
            <Text className="font-bold block mb-1 border-blue-900" size="2">
              Updated after
            </Text>
            <Datepicker
              inputClassName="w-full p-1 bg-indigo-50 cursor-pointer rounded"
              asSingle={true}
              useRange={false}
              value={dates}
              onChange={(dates) => {
                setIsProgress(false);
                setDates(dates);
              }}
              showShortcuts={true}
              required={true}
            />
            <Button className="block cursor-pointer mt-4" type="submit">
              Submit
            </Button>
          </div>
          <div className="mb-3 w-full">
            <Text className="font-bold block mb-1 border-blue-900" size="2">
              Enter course search terms
            </Text>
            <SearchTermsInput
              searchTerms={searchTerms}
              updateSearchTerms={updateSearchTerms}
            />
            <Text className="block text-xs mt-1"></Text>
          </div>
        </div>
      </form>
      {errMsg && <Callout type={'error'} msg={errMsg} className="max-w-lg" />}
      {isProgress && dates && dates.startDate && (
        // <AdditionalAttemptAssigmentsTable courseSearchTerms={searchTerms} />
        <></>
      )}
    </div>
  );
}

interface IGraderContext {
  grader: User | null;
  setGrader: React.Dispatch<React.SetStateAction<User | null>>;
}

export const GraderContext = createContext<IGraderContext>(
  {} as IGraderContext
);

export function GraderProvider(props: PropsWithChildren) {
  const [grader, setGrader] = useState<User | null>(null);
  return (
    <GraderContext.Provider
      value={{
        grader,
        setGrader,
      }}
    >
      {props.children}
    </GraderContext.Provider>
  );
}

function SearchTermsInput({
  searchTerms,
  updateSearchTerms,
}: {
  searchTerms: string[];
  updateSearchTerms: (items: string[]) => void;
}) {
  const [value, setValue] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value;
      updateSearchTerms([...searchTerms, value]);
      setValue('');
      e.preventDefault();
    }
  };

  return (
    <div>
      <TextField.Root
        placeholder="Type and press enter key"
        variant="soft"
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        value={value}
      >
        <TextField.Slot
          side="right"
          className="cursor-pointer"
          onClick={() => {}}
        ></TextField.Slot>
      </TextField.Root>
      <Flex mt="2" gap="1">
        {searchTerms.map((value, i) => (
          <Badge key={i + value} className="relative" size="2">
            {value}
            <Cross2Icon
              color="red"
              className="cursor-pointer"
              onClick={() => {
                updateSearchTerms(
                  searchTerms.filter((_, index) => index !== i)
                );
              }}
            />
          </Badge>
        ))}
      </Flex>
    </div>
  );
}

// function AdditionalAttemptAssigmentsTable({
//   courseSearchTerms,
//   updatedAfter,
// }: {
//   courseSearchTerms: string[];
//   updatedAfter: Date;
// }) {
//   return <>
//   </>;
// }
