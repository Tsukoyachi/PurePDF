import { useState } from "react"; // import state

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false); // initiate isNavOpen state with false

  return (
    <div className="flex items-center justify-between border-b border-gray-400 py-8">
  <a href="/">
    <img src="/assets/logo.png" alt="logo" className="w-28 sm:w-40 h-auto" />
  </a>
  <nav>
    <section className="flex lg:hidden">
      <div
        className="space-y-2"
        onClick={() => setIsNavOpen((prev) => !prev)}
      >
        {Array(3).fill(undefined).map((_, index) => (
          <span key={index} className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
        ))}
      </div>

      <div className={`${isNavOpen ? "flex" : "hidden"} absolute w-full h-screen top-0 left-0 bg-white z-10 flex-col justify-evenly items-center`}>
        <div
          className="absolute top-0 right-0 px-8 py-8"
          onClick={() => setIsNavOpen(false)}
        >
          <svg
            className="h-8 w-8 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <ul className="flex flex-col items-center justify-between min-h-[250px]">
          {["Merge", "Organize", "Compress"].map((text, index) => (
            <li key={index} className="border-b border-gray-400 my-8 uppercase">
              <a href={`/${text.toLowerCase()}`}>{text} PDF</a>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <ul className="hidden space-x-8 lg:flex">
      {["Merge", "Organize", "Compress"].map((text, index) => (
        <li key={index}>
          <a href={`/${text.toLowerCase()}`}>{text} PDF</a>
        </li>
      ))}
    </ul>
  </nav>
</div>

  );
}