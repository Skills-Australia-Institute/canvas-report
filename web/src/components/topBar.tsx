import { Avatar } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';

export default function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstInitial = user?.first_name?.charAt(0).toLocaleUpperCase() || '';
  const lastInitial = user?.last_name?.charAt(0).toLocaleUpperCase() || '';

  return (
    <div>
      <div onClick={() => navigate('/profile')}>
        <Avatar
          variant="solid"
          fallback={firstInitial + lastInitial}
          color="teal"
          radius="full"
          size="2"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
