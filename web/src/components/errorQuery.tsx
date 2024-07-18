import Callout from './callout';
import OutletHeader from './outletHeader';

interface IErrorQuery {
  outletHeaderProps: {
    title: string;
    subtitle?: string;
  };
  calloutProps: {
    type: 'error';
    msg: string;
  };
}

export default function ErrorQuery({
  outletHeaderProps: { title, subtitle },
  calloutProps: { type, msg },
}: IErrorQuery) {
  return (
    <div className="m-4">
      <OutletHeader title={title} subTitle={subtitle} />
      <Callout type={type} msg={msg} />
    </div>
  );
}
