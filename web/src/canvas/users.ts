import { axios } from '../axios';

export const terminateUserSessions = async (userID: number) => {
  try {
    const { status } = await axios.delete(`/users/${userID}/sessions`);
    return status;
  } catch (err) {
    throw err as Error;
  }
};

export const logoutAllFromMobileApps = async () => {
  try {
    const { status } = await axios.delete(`/users/sessions`);
    return status;
  } catch (err) {
    throw err as Error;
  }
};
