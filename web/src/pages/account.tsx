import { Badge, Box, ScrollArea, Table, Tabs, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Course, getCoursesByAccountID } from '../canvas/courses';
import Callout from '../components/callout';
import ErrorQuery from '../components/errorQuery';
import Loading from '../components/loading';
import OutletHeader from '../components/outletHeader';
import UngradedAssignments from '../components/reports/ungradedAssignments';
import { ACTIONS, AppRole } from '../constants';
import { useAuth } from '../hooks/auth';
import { useSupabase } from '../hooks/supabase';
import { getAccountByID } from '../supabase/accounts';

export default function Account() {
  const { accountID } = useParams();
  const { user } = useAuth();
  const supabase = useSupabase();
  const {
    isLoading: isLoadingAccount,
    error: errorAccount,
    data: account,
  } = useQuery({
    queryKey: ['accounts', accountID],
    queryFn: () => {
      if (accountID) {
        return getAccountByID(supabase, Number(accountID));
      }
    },
    enabled: !!accountID,
  });

  const {
    isLoading: isLoadingCourses,
    error: errorCourses,
    data: courses,
  } = useQuery({
    queryKey: ['accounts', accountID, 'courses'],
    queryFn: ({ signal }) => {
      if (accountID) {
        return getCoursesByAccountID(signal, Number(accountID));
      }
    },
    enabled: !!accountID,
  });

  const isLoading = isLoadingAccount || isLoadingCourses;
  const error = errorAccount || errorCourses;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorQuery
        outletHeaderProps={{ title: 'Accounts', subtitle: account?.name }}
        calloutProps={{ type: 'error', msg: error.message }}
      />
    );
  }

  return (
    <div className="w-full">
      <OutletHeader title="Accounts" subTitle={account?.name} />
      <Tabs.Root defaultValue="Courses">
        <Tabs.List>
          <Tabs.Trigger value="Courses" className="cursor-pointer">
            Courses
          </Tabs.Trigger>
          {user?.app_role !== AppRole.StudentServices && (
            <Tabs.Trigger
              value={ACTIONS.UngradedAssignments.key}
              className="cursor-pointer"
            >
              {ACTIONS.UngradedAssignments.value}
            </Tabs.Trigger>
          )}
        </Tabs.List>
        <Box pt="2">
          <Tabs.Content value="Courses">
            {courses && courses.length > 0 ? (
              <CoursesTable courses={courses} />
            ) : (
              <Callout
                type={'success'}
                msg={'No items to display'}
                className="max-w-lg"
              ></Callout>
            )}
          </Tabs.Content>
          {user?.app_role !== AppRole.StudentServices && (
            <Tabs.Content value={ACTIONS.UngradedAssignments.key}>
              {account && courses && (
                <UngradedAssignments account={account} courses={courses} />
              )}
            </Tabs.Content>
          )}
        </Box>
      </Tabs.Root>
    </div>
  );
}

function CoursesTable({ courses }: { courses: Course[] }) {
  const navigate = useNavigate();
  return (
    <ScrollArea
      type="auto"
      scrollbars="vertical"
      className="pr-4"
      style={{ maxHeight: 600 }}
    >
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
