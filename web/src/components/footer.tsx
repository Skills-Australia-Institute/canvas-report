import CopyrightIcon from '../assets/icons/copyright.svg';

export default function Footer() {
  return (
    <div>
      <Copyright />
    </div>
  );
}

function Copyright() {
  const year = new Date().getFullYear();

  return (
    <div className="text-sm">
      <img src={CopyrightIcon} className="inline w-3 h-3" /> {year}{' '}
      <a
        href="https://skillsaustralia.instructure.com/"
        target="_blank"
        className="underline"
      >
        Skills Australia Institute
      </a>
    </div>
  );
}
