import {
  AccessibilityIcon,
  BackpackIcon,
  ExitIcon,
  GearIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Avatar, Flex, IconProps, Tooltip } from '@radix-ui/themes';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRole, LOGO } from '../constants';
import { useAuth } from '../hooks/auth';
import { useSupabase } from '../hooks/supabase';

const navs = [
  {
    title: 'Accounts',
    path: '/accounts',
    icon: AccessibilityIcon,
  },
  {
    title: 'Users',
    path: '/users',
    icon: PersonIcon,
  },
  {
    title: 'Courses',
    path: '/courses',
    icon: BackpackIcon,
  },
];

export default function SideBar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Flex direction="column" gap="5" className="relative">
      <Avatar
        src={LOGO}
        fallback="SAI"
        size="2"
        className="bg-gray-100 mb-4 cursor-pointer"
        onClick={() => navigate('/')}
      />
      {navs.map((n) => (
        <SideNav key={n.path} navigation={n} />
      ))}
      {user?.app_role === AppRole.Superadmin && (
        <SideNav
          key={'/app'}
          navigation={{
            title: 'App',
            path: '/app',
            icon: GearIcon,
          }}
        />
      )}
      <LogoutButton />
    </Flex>
  );
}

interface ISideNavProps {
  navigation: {
    title: string;
    path: string;
    icon: React.ForwardRefExoticComponent<
      IconProps & React.RefAttributes<SVGSVGElement>
    >;
  };
}

function SideNav({ navigation: { title, path, icon: Icon } }: ISideNavProps) {
  const location = useLocation();
  const isActive = location.pathname.includes(path);
  const navigate = useNavigate();

  return (
    <Tooltip content={title}>
      <div className="cursor-pointer" onClick={() => navigate(path)}>
        <Icon className={isActive ? 'w-6 h-6 text-blue-600' : 'w-6 h-6'} />
      </div>
    </Tooltip>
  );
}

function LogoutButton() {
  const supabase = useSupabase();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged out successfully.');
      }
    } catch (err: unknown) {
      toast.error('Unable to logout. Try again.');
    }
  };

  return (
    <Tooltip content="Click to logout">
      <ExitIcon
        className="w-6 h-6 absolute bottom-2 cursor-pointer"
        onClick={handleLogout}
      />
    </Tooltip>
  );
}
