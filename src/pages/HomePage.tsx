import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { decrement, increment } from '../features/counter/counterSlice';
import { cn } from '../lib/cn';

export default function HomePage() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <section className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-slate-900">Help Desk Lite</h1>
      <p className="text-slate-600">Production-ready React + TypeScript starter.</p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(decrement())}
          className={cn('rounded-lg bg-slate-200 px-4 py-2 font-medium hover:bg-slate-300')}
        >
          –
        </button>
        <span className="w-10 text-center text-2xl font-semibold">{count}</span>
        <button
          onClick={() => dispatch(increment())}
          className={cn(
            'rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700',
          )}
        >
          +
        </button>
      </div>

      <Link to="/about" className="text-indigo-600 underline hover:text-indigo-800">
        Go to About
      </Link>
    </section>
  );
}
