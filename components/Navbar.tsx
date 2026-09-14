"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import UserAuth from "./UserAuth";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsDrawerOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-black/90 md:bg-gradient-to-b md:from-black/95 md:via-black/60 md:to-transparent backdrop-blur-sm transition-all duration-300">
      {/* Brand: Signature White & Red Contrast */}
      <Link href="/" className="font-black text-xl sm:text-2xl tracking-wider shrink-0 flex items-center select-none">
        <span className="text-white drop-shadow-md">KANGLEI</span>
        <span className="text-red-600 drop-shadow-md ml-0.5">CIMA</span>
      </Link>

      {/* Desktop Navigation & Search */}
      <div className="hidden md:flex items-center gap-6 shrink-0">
        <form onSubmit={handleSearch} className="flex relative items-center bg-zinc-900/90 border border-zinc-800 rounded-full px-3 py-1.5 focus-within:border-zinc-600 transition">
          <input
            type="text"
            placeholder="Search movies, leela..."
            className="bg-transparent text-white text-xs w-36 lg:w-48 outline-none placeholder-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search" className="text-zinc-400 hover:text-white transition ml-1">
            <Search size={15} />
          </button>
        </form>

        <div className="flex items-center gap-5 text-zinc-300 text-xs sm:text-sm font-medium">
          <Link href="/browse" className="hover:text-white transition">Movies</Link>
          <Link href="/leela" className="hover:text-white transition">Sumang Leela</Link>
          <Link href="/my-list" className="hover:text-white transition">My List</Link>
          <Link href="/donate" className="text-red-500 hover:text-red-400 font-bold transition">SUPPORT ME</Link>
          <div className="pl-2 border-l border-zinc-800 flex items-center gap-3">
            <UserAuth />
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        className="md:hidden text-white p-1.5 focus:outline-none"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        aria-label="Toggle Navigation"
      >
        {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Slide Drawer */}
      {isDrawerOpen && (
        <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-5 flex flex-col gap-4 text-white md:hidden shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Search movies, leela..."
              className="bg-transparent text-white text-sm w-full outline-none placeholder-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="text-zinc-400 hover:text-white ml-2">
              <Search size={18} />
            </button>
          </form>

          <Link href="/browse" className="py-1 text-sm font-semibold hover:text-red-500" onClick={() => setIsDrawerOpen(false)}>Movies</Link>
          <Link href="/leela" className="py-1 text-sm font-semibold hover:text-red-500" onClick={() => setIsDrawerOpen(false)}>Sumang Leela</Link>
          <Link href="/my-list" className="py-1 text-sm font-semibold hover:text-red-500" onClick={() => setIsDrawerOpen(false)}>My List</Link>
          <Link href="/donate" className="py-1 text-sm font-bold text-red-500" onClick={() => setIsDrawerOpen(false)}>SUPPORT ME</Link>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <UserAuth />
            <Link href="/profile" className="text-xs text-zinc-400 hover:text-white" onClick={() => setIsDrawerOpen(false)}>Profile</Link>
          </div>
        </div>
      )}
    </nav>
  );
}