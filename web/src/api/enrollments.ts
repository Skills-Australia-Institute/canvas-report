import { axios } from '../axios';
import { EnrollmentResult } from '../entities/enrollment';

export const getEnrollmentsResultsByUserID = async (userID: number) => {
  try {
    const { data } = await axios.get(`/users/${userID}/enrollments-results`);

    return data as EnrollmentResult[];
  } catch (err) {
    throw err as Error;
  }
};
