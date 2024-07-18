import {
  Alert,
  Button,
  Flex,
  Loader,
  Progress,
  Select,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { GetCoursesByAccountID } from '../../../wailsjs/go/canvas/Canvas';
import {
  ExportUngradedAssignments,
  GetUngradedAssignmentsByCourse,
} from '../../../wailsjs/go/csv/CSV';
import { canvas, csv } from '../../../wailsjs/go/models';
import { colors } from '../../theme';
import { SuperadminAction } from '../../types/enum';
import { Account } from '../../types/type';
import GoBackHome from '../goBackHome';
import { ICallout } from './callout';
import { useQueries, useQuery } from '@tanstack/react-query';

interface IUngradedAssignments {
  account: Account;
}

export default function UngradedAssignments({ account }: IUngradedAssignments) {
  const [callout, setCallout] = useState<ICallout | null>(null);
  const [progress, setProgress] = useState(0);
  const query = useQuery()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    changeInProgress(true);
    setAlertMsg(null);

    try {
      if (account === null) {
        return;
      }

      const assignments: csv.UngradedAssignment[] = [];
      const courses = await GetCoursesByAccountID(account.id, '', [
        canvas.CourseEnrollmentType.STUDENT,
      ]);

      let completedCourses = 0;
      const totalProgress = courses.length + 1; // One for CSV export operation

      for (let i = 0; i < courses.length; i++) {
        const _assignments = await GetUngradedAssignmentsByCourse(courses[i]);
        assignments.push(..._assignments);
        completedCourses++;
        setProgress((completedCourses / totalProgress) * 100);
      }

      assignments.sort((a, b) => {
        if (a.section < b.section) {
          return -1;
        } else if (a.section > b.section) {
          return 1;
        }
        return 0;
      });

      await ExportUngradedAssignments(assignments, account.name);
      setProgress(100);
      setAlertMsg({
        type: 'success',
        msg: 'Created 2 csv files in currrent folder.',
      });
    } catch (err: any) {
      // error from Go comes as string but throw Error() returns object and object can't be React element
      typeof err === 'object'
        ? setAlertMsg({
            type: 'error',
            msg: err.message,
          })
        : setAlertMsg({
            type: 'error',
            msg: err,
          });
    } finally {
      changeInProgress(false);
      setProgress(0);
    }
  };

  if (isPending) {
    return (
      <Flex align={'center'} justify={'center'}>
        <Loader mt={'md'} size={'sm'} />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert
        variant="light"
        mt="md"
        color={'red'}
        title={'Error'}
        icon={iconInfoCircle}
      >
        {error.message}
      </Alert>
    );
  }

  return (
    <div style={{ background: '100%' }}>
      <Text fw={500} c={colors.blue}>
        {SuperadminAction.UngradedAssignments}
      </Text>
      <form onSubmit={handleSubmit}>
        <Select
          label="Select an account."
          placeholder="Pick an account."
          data={accounts.map((a) => {
            return {
              value: a.id.toString(),
              label: a.name,
            };
          })}
          onChange={(val, opt) => {
            val
              ? setAccount({
                  id: Number(val),
                  name: opt.label,
                })
              : setAccount(null);
          }}
          mb={'md'}
          disabled={inProgress}
          searchable
          clearable
        />
        <Flex justify={'space-between'} gap="md">
          <Button type="submit" disabled={inProgress} color="cyan">
            Start
          </Button>
          <GoBackHome />
        </Flex>
      </form>
      {inProgress && (
        <div>
          <Progress
            color="teal"
            radius="md"
            value={progress}
            striped
            animated
            mt={'md'}
          />
          <Text c="blue" fw={700} ta="center" size="md">
            {Math.floor(progress)}%
          </Text>
        </div>
      )}
      {alertMsg && (
        <Alert
          variant="light"
          mt="md"
          color={alertMsg.type === 'error' ? 'red' : 'teal'}
          title={alertMsg.type === 'error' ? 'Error' : 'Success'}
          icon={alertMsg.type === 'error' ? iconInfoCircle : iconCheck}
        >
          {alertMsg.msg}
        </Alert>
      )}
    </div>
  );
}
