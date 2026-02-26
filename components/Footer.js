export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm">
          BrickBuilder © {new Date().getFullYear()} • Built for LEGO enthusiasts
        </p>
        

      </div>
    </footer>
  );
}