import {
  AccessibilityIcon,
  BackpackIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Avatar, Flex, IconProps, Tooltip } from '@radix-ui/themes';
import SAILogo from '../assets/sai-logo.png';

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
  return (
    <Flex direction="column" gap="5">
      <Avatar src={SAILogo} fallback="SAI" size="2" className="bg-white mb-4" />
      {navs.map((n) => (
        <SideNav key={n.path} navigation={n} />
      ))}
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
  return (
    <Tooltip content={title}>
      <a href={path} className="cursor-pointer">
        <Icon className="w-5 h-5" />
      </a>
    </Tooltip>
  );
}
