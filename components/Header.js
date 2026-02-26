export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-4 shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">🧱 BrickBuilder</span>
        </div>

        <nav className="flex gap-6 text-sm font-medium">
          <a href="/" className="hover:underline hover:text-purple-200 transition">Home</a>
          <a href="/Menu" className="hover:underline hover:text-purple-200 transition">Menu</a>
          <a href="/ContactUs" className="hover:underline hover:text-purple-200 transition">Contact Us</a>
        </nav>
      </div>
    </header>
  );
}