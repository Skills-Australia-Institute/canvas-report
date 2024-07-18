import { axios } from '../axios';
import { AssignmentResult, UngradedAssignment } from '../entities/assignment';

export const getUngradedAssignmentsByCourseID = async (courseID: number) => {
  try {
    const { data } = await axios(`/courses/${courseID}/ungraded-assignments`);

    return data as UngradedAssignment[];
  } catch (err) {
    throw err as Error;
  }
};

export const getAssignmentsResultsByUserID = async (userID: number) => {
  try {
    const { data } = await axios.get(`/users/${userID}/assignments-results`);

    return data as AssignmentResult[];
  } catch (err) {
    throw err as Error;
  }
};
