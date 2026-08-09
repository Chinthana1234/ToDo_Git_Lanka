import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-black">Welcome to TodoApp</h1>
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-500 text-white px-6 py-2 rounded shadow">Login</Link>
        <Link href="/register" className="bg-green-500 text-white px-6 py-2 rounded shadow">Register</Link>
      </div>
    </div>
  );
}
