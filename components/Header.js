"use client"; 
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-bold">🧱 BrickBuilder</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-base font-medium">
            <a
              href="/"
              className="hover:underline hover:text-purple-200 transition"
            >
              Home
            </a>
            <a
              href="/Menu"
              className="hover:underline hover:text-purple-200 transition"
            >
              Menu
            </a>
            <a
              href="/ContactUs"
              className="hover:underline hover:text-purple-200 transition"
            >
              Contact Us
            </a>
          </nav>

          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className="w-8 h-8 flex flex-col justify-center items-center space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-60 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
          }`}
        >
          <nav className="flex flex-col items-center gap-5 text-base font-medium">
            <a
              href="/"
              className="hover:text-purple-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="/Menu"
              className="hover:text-purple-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Menu
            </a>
            <a
              href="/ContactUs"
              className="hover:text-purple-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}