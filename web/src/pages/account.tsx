import { Badge, Box, ScrollArea, Table, Tabs, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountByID } from '../api/supabase/accounts';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import UngradedAssignments from '../components/reports/ungradedAssignments';
import { ACTIONS } from '../constants';
import { Course } from '../entities/courses';
import { useSupabase } from '../hooks/supabase';

export default function Account() {
  const { accountID } = useParams();
  const supabase = useSupabase();
  const { isLoading, error, data } = useQuery({
    queryKey: ['accounts', accountID],
    queryFn: () => {
      if (accountID) {
        return getAccountByID(supabase, Number(accountID));
      }
    },
    enabled: !!accountID,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{ title: 'Accounts', subtitle: data?.name }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
    );
  }

  return (
    <div className="w-full">
      <OutletHeader title="Accounts" subTitle={data?.name} />
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Trigger value="Courses" className="cursor-pointer">
            Courses
          </Tabs.Trigger>
          <Tabs.Trigger
            value={ACTIONS.UngradedAssignments.key}
            className="cursor-pointer"
          >
            {ACTIONS.UngradedAssignments.value}
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value="Courses">
            {data?.courses && <CoursesTable courses={data.courses} />}
          </Tabs.Content>
          <Tabs.Content value={ACTIONS.UngradedAssignments.key}>
            {data && <UngradedAssignments account={data} />}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

function CoursesTable({ courses }: { courses: Course[] }) {
  const navigate = useNavigate();
  return (
    <ScrollArea scrollbars="both" className="pr-4" style={{ height: 600 }}>
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {courses.map((c) => (
            <Table.Row key={c.id}>
              <Table.Cell>
                <Text
                  className="hover:underline cursor-pointer"
                  onClick={() => navigate(`/courses/${c.id}`)}
                >
                  {c.name}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  color={c.workflow_state === 'available' ? 'green' : 'orange'}
                >
                  {c.workflow_state}
                </Badge>
              </Table.Cell>
              <Table.Cell>{c.course_code}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </ScrollArea>
  );
}
