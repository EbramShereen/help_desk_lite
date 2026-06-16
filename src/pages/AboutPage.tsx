import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <section className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-slate-900">About</h1>
      <p className="max-w-md text-center text-slate-600">
        This starter ships with React Router, Redux Toolkit, TanStack Query, Axios, React Hook Form,
        Zod, Tailwind CSS, ESLint, Prettier, and Vitest.
      </p>
      <Link to="/" className="text-indigo-600 underline hover:text-indigo-800">
        Back home
      </Link>
    </section>
  );
}
