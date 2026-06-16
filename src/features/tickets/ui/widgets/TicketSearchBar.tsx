import { useEffect, useState } from 'react';
import { AppTextField } from '../../../../core/widgets/AppTextField';
import { useAppDispatch } from '../../../../app/hooks';
import { setSearch } from '../../logic/ticketsSlice';

export function TicketSearchBar() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => dispatch(setSearch(value)), 300);
    return () => clearTimeout(timer);
  }, [value, dispatch]);

  return (
    <AppTextField
      placeholder="Search tickets…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
