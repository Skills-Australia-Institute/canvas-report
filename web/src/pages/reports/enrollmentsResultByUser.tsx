import { Button, Text } from '@radix-ui/themes';
import { FormEvent, useContext, useState } from 'react';
import Callout from '../../components/callout';
import EnrollmentsResultsByUser from '../../components/reports/enrollmentsResultsByUser';
import SearchAndSelectUser from '../../components/searchAndSelectUser';
import { SupabaseUserContext } from '../../providers/supabaseUser';

export default function StudentEnrollmentsResultPage() {
  const { user: student } = useContext(SupabaseUserContext);
  const [errMsg, setErrMsg] = useState('');
  const [isProgress, setIsProgress] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!student) {
      setErrMsg('Please select a student.');
      setIsProgress(false);
      return;
    }

    setIsProgress(true);
  };

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="4">
        Student Enrollments Result Report
      </Text>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 max-w-xl">
          <SearchAndSelectUser
            onChange={() => {
              setIsProgress(false);
            }}
          />
        </div>
        <div>
          <Button className="block cursor-pointer" type="submit">
            Submit
          </Button>
        </div>

        {errMsg && <Callout type={'error'} msg={errMsg} className="max-w-lg" />}
      </form>
      <div className="mt-2">
        {isProgress && student && <EnrollmentsResultsByUser user={student} />}
      </div>
    </div>
  );
}
