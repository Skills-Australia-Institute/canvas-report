import { CaretRightIcon } from '@radix-ui/react-icons';
import { Heading, Text } from '@radix-ui/themes';
import { useLocation, useNavigate } from 'react-router-dom';

interface IOutletHeader {
  title: string;
  subTitle?: string;
}

export default function OutletHeader({ title, subTitle }: IOutletHeader) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="mb-2">
      <Heading size="3" className="inline">
        <Text
          className="hover:underline cursor-pointer"
          onClick={() => navigate(`/${title.toLowerCase()}`)}
        >
          {title}
        </Text>
      </Heading>
      {subTitle && (
        <Heading size="2" className="inline">
          <CaretRightIcon className="inline mx-2" />
          <Text
            className="hover:underline cursor-pointer"
            onClick={() => navigate(pathname)}
          >
            {subTitle}
          </Text>
        </Heading>
      )}
    </div>
  );
}
