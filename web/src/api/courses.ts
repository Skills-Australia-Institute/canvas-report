import { axios } from '../axios';
import { Course } from '../entities/courses';

export const getCoursesByAccountID = async (accountID: number) => {
  try {
    const { data } = await axios(`/accounts/${accountID}/courses`);

    return data as Course[];
  } catch (err) {
    throw err as Error;
  }
};
