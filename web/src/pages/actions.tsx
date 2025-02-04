import { Text } from '@radix-ui/themes';
import { Navigate } from 'react-router-dom';
import { AppRole, AppRoleValue } from '../constants';
import { useAuth } from '../hooks/auth';
import { SupabaseUserProvider } from '../providers/supabaseUser';
import LogoutAllMobileApps from './actions/logoutAllMobileApps';
import TerminateUserSessions from './actions/terminateUserSessions';

export default function ActionsPage() {
  const { user: currentUser } = useAuth();

  const userRoleValue = currentUser?.app_role
    ? AppRoleValue.get(currentUser.app_role)
    : undefined;

  const studentServicesRoleValue = AppRoleValue.get(AppRole.StudentServices);

  if (!userRoleValue || !studentServicesRoleValue) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="w-full">
      <Text className="block font-bold" mb="2">
        Actions
      </Text>
      <div className="flex gap-6 flex-wrap">
        {userRoleValue >= studentServicesRoleValue && (
          <SupabaseUserProvider>
            <TerminateUserSessions />
          </SupabaseUserProvider>
        )}
        {userRoleValue >= studentServicesRoleValue && <LogoutAllMobileApps />}
      </div>
    </div>
  );
}
