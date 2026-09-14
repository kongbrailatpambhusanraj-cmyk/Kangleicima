"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(currentQuery);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(currentQuery);
    if (currentQuery) setIsOpen(true);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 1) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 1) {
      router.replace(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    router.push("/search");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <div
        className={`flex items-center bg-zinc-900 border transition-all duration-200 rounded-full overflow-hidden ${
          isOpen || query
            ? "w-48 sm:w-64 border-zinc-700 bg-zinc-950/90 shadow-md"
            : "w-8 sm:w-48 border-transparent sm:border-zinc-800 bg-transparent sm:bg-zinc-900/60"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white flex-none transition-colors"
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          placeholder="Search movies..."
          className={`bg-transparent text-white text-xs outline-none w-full pr-2 placeholder-zinc-500 transition-opacity ${
            isOpen || query ? "opacity-100" : "opacity-0 sm:opacity-100"
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 mr-1 text-zinc-400 hover:text-white rounded-full transition"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </form>
  );
}