import { Cross2Icon } from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Flex,
  ScrollArea,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { CSVLink } from 'react-csv';
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker';
import Callout from '../../components/callout';
import Loading from '../../components/loading';
import { useSupabase } from '../../hooks/supabase';
import { getAdditionalAttemptAssignments } from '../../supabase/assignments';
import { rpc } from '../../supabase/supabase';
import { getDateTimeString } from '../../utils';

export default function AdditionalAttemptAssigments() {
  const [dates, setDates] = useState<DateValueType>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isProgress, setIsProgress] = useState(false);

  const searchTermsProps =
    searchTerms.length === 0 && searchTerm ? [searchTerm] : searchTerms;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (searchTermsProps.length === 0) {
      setErrMsg('Please enter search terms.');
      setIsProgress(false);
      return;
    }

    setIsProgress(true);
  };

  const updateSearchTerms = (items: string[]) => {
    setSearchTerm('');
    setSearchTerms(items);
  };

  const updateSearchTerm = (item: string) => {
    setIsProgress(false);
    setSearchTerm(item);
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
            <Text className="font-bold block" size="2">
              Enter course search terms
            </Text>
            <SearchTermsInput
              searchTerms={searchTerms}
              updateSearchTerms={updateSearchTerms}
              updateSearchTerm={updateSearchTerm}
            />
            <Text className="block text-xs mt-1"></Text>
          </div>
        </div>
      </form>
      {errMsg && <Callout type={'error'} msg={errMsg} className="max-w-lg" />}
      {isProgress &&
        dates &&
        dates.startDate &&
        searchTermsProps.length > 0 && (
          <AdditionalAttemptAssigmentsTable
            courseSearchTerms={searchTermsProps}
            updatedAfter={dates.startDate}
          />
        )}
    </div>
  );
}

function SearchTermsInput({
  searchTerms,
  updateSearchTerms,
  updateSearchTerm,
}: {
  searchTerms: string[];
  updateSearchTerms: (items: string[]) => void;
  updateSearchTerm: (item: string) => void;
}) {
  const [value, setValue] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    updateSearchTerm(e.currentTarget.value);
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
        ></TextField.Slot>
      </TextField.Root>
      <Flex mt="2" gap="1">
        {searchTerms.map((value, i) => (
          <Badge key={i + value} size="2">
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

function AdditionalAttemptAssigmentsTable({
  courseSearchTerms,
  updatedAfter,
}: {
  courseSearchTerms: string[];
  updatedAfter: Date;
}) {
  const queryKey = courseSearchTerms.reduce((acc, val) => acc + val, '');
  const supabase = useSupabase();
  const {
    isLoading,
    error,
    data: result,
  } = useQuery({
    queryKey: [rpc.GetAdditionalAttemptAssignments, updatedAfter, queryKey],
    queryFn: () =>
      getAdditionalAttemptAssignments(
        supabase,
        updatedAfter,
        courseSearchTerms
      ),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Callout type="error" msg={error.message} className="mt-4 max-w-lg" />
    );
  }

  const data = result?.map((d) => {
    d.updated_at = d.updated_at
      ? new Date(d.updated_at).toLocaleString('en-AU')
      : '';
    d.lock_at = d.lock_at ? new Date(d.lock_at).toLocaleString('en-AU') : '';

    return d;
  });

  return (
    <div>
      {data && data.length > 0 ? (
        <>
          <ScrollArea
            type="auto"
            scrollbars="vertical"
            className="pr-4 mt-2"
            style={{ maxHeight: 600 }}
          >
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Needs grading</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Last updated</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Link</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.map((d) => (
                  <Table.Row key={d.id}>
                    <Table.Cell className="max-w-sm">
                      {d.account_name}
                    </Table.Cell>
                    <Table.Cell className="max-w-sm">
                      {d.course_name}
                    </Table.Cell>
                    <Table.Cell className="max-w-sm">{d.title}</Table.Cell>
                    <Table.Cell className="max-w-sm">
                      {d.needs_grading}
                    </Table.Cell>
                    <Table.Cell className="max-w-sm">{d.updated_at}</Table.Cell>
                    <Table.Cell className="max-w-sm">
                      <a href={d.url} target="_blank" className="underline">
                        Link
                      </a>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea>
          <div className="mt-4">
            <CSVLink
              data={data}
              headers={headers}
              filename={`additional_attempt_assignments-${getDateTimeString()}`}
            >
              <Button className="cursor-pointer" color="cyan">
                Download
              </Button>
            </CSVLink>
          </div>
        </>
      ) : (
        <Callout
          type="success"
          msg="No items to display"
          className="max-w-lg"
        ></Callout>
      )}
    </div>
  );
}

const headers = [
  {
    label: 'Account',
    key: 'account_name',
  },
  {
    label: 'Course',
    key: 'course_name',
  },
  {
    label: 'Assignment',
    key: 'title',
  },
  {
    label: 'Needs Grading',
    key: 'needs_grading',
  },
  {
    label: 'Last updated',
    key: 'updated_at',
  },
  {
    label: 'Available Until',
    key: 'lock_at',
  },
  {
    label: 'Link',
    key: 'url',
  },
];
