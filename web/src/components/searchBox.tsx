import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useDebounce } from '../hooks/debounce';

interface ISearchBox<T> {
  data: Array<T>;
  updateFiltered: (filteredData: Array<T>) => void;
  filterKey: keyof T;
}

export default function SearchBox<T>({
  data,
  updateFiltered,
  filterKey,
}: ISearchBox<T>) {
  const debouncedUpdateSearch = useDebounce(updateFiltered);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const search = e.currentTarget.value;

    const filteredData = data.filter((d) =>
      String(d[filterKey]).toLowerCase().includes(search.toLowerCase())
    );

    debouncedUpdateSearch(filteredData);
  };

  return (
    <TextField.Root placeholder="Search…" onChange={handleChange}>
      <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
      </TextField.Slot>
    </TextField.Root>
  );
}
