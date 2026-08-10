import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8E7C9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="text-center max-w-lg">
          <div className="text-6xl sm:text-7xl mb-6">📝</div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#064E3B] mb-4 leading-tight">
            Organize Your Day
          </h1>
          <p className="text-[#064E3B]/70 text-base sm:text-lg mb-8 leading-relaxed">
            A simple and beautiful way to manage your tasks. Stay productive and never miss a thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#064E3B] text-[#F8E7C9] px-8 py-3 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-[#064E3B]/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border-2 border-[#064E3B] text-[#064E3B] px-8 py-3 rounded-xl font-semibold text-lg hover:bg-[#064E3B] hover:text-[#F8E7C9] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
