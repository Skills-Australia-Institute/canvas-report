import NotFoundImg from '../assets/not-found.png';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center w-full">
      <img src={NotFoundImg} />
    </div>
  );
}
