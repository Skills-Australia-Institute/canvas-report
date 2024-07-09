interface IButtonProps {
  text: string;
  type: 'submit' | 'button' | 'reset';
}

export default function Button({ text, type }: IButtonProps) {
  return (
    <button
      type={type}
      className="border-solid border-2 border-sky-300 rounded-md mb-4 py-1 px-4"
    >
      {text}
    </button>
  );
}
