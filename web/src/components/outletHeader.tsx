import { CaretRightIcon } from '@radix-ui/react-icons';
import { Heading } from '@radix-ui/themes';
import { useLocation } from 'react-router-dom';

interface IOutletHeader {
  title: string;
  subTitle?: string;
}
export default function OutletHeader({ title, subTitle }: IOutletHeader) {
  const { pathname } = useLocation();
  return (
    <div className="mb-2">
      <Heading size="3" className="inline">
        <a
          className="hover:underline cursor-pointer"
          href={`/${title.toLowerCase()}`}
        >
          {title}
        </a>
      </Heading>
      {subTitle && (
        <Heading size="2" className="inline">
          <CaretRightIcon className="inline mx-2" />
          <a href={pathname} className="hover:underline cursor-pointer">
            {subTitle}
          </a>
        </Heading>
      )}
    </div>
  );
}
