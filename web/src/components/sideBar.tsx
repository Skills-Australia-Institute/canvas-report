import {
  AccessibilityIcon,
  BackpackIcon,
  GearIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Avatar, Flex, IconProps, Tooltip } from '@radix-ui/themes';
import { useLocation, useNavigate } from 'react-router-dom';
import SAILogo from '../assets/sai-logo.png';
import { AppRole } from '../constants';
import { useAuth } from '../hooks/auth';

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
    <Flex direction="column" gap="5">
      <Avatar
        src={SAILogo}
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
