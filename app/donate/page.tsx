"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Copy, Check, ArrowLeft, ShieldCheck, QrCode, Sparkles } from "lucide-react";

export default function DonatePage() {
  const [copied, setCopied] = useState(false);
  const upiId = "bhusanrajlegend@oksbi"; //
  const upiPhone = "7005814596"; //[cite: 1]

  // Direct UPI deep link and QR code payload
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=KangleiCima&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiPayUrl
  )}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Back Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-xl bg-zinc-950/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Heart Badge */}
        <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-500 mx-auto flex items-center justify-center shadow-lg shadow-red-950/30">
          <Heart size={28} className="fill-red-500/20" />
        </div>

        {/* Heading & Mission */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
            <Sparkles size={12} className="text-red-500" />
            <span>Community Preservation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Support <span className="text-white">KANGLEI</span>
            <span className="text-red-600">CIMA</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
            KangleiCima exists to archive, preserve, and showcase Manipuri cinema and Sumang Leela for viewers worldwide[cite: 1]. We don't charge subscription fees—voluntary contributions keep our cloud infrastructure online[cite: 1].
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 max-w-xs mx-auto flex flex-col items-center space-y-3">
          <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="Scan to Donate via UPI"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
            <QrCode size={14} className="text-red-500" />
            <span>Scan with any UPI App (GPay, PhonePe, Paytm)</span>
          </div>
        </div>

        {/* UPI Copy Box */}
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2 text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            UPI Virtual Payment Address (VPA)
          </div>
          <div className="flex items-center justify-between bg-black/80 border border-zinc-800 px-3.5 py-2.5 rounded-xl">
            <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-200 select-all">
              {upiId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/60 border border-red-800/60 px-3 py-1.5 rounded-lg transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 pt-1">
            <span>Linked Phone: {upiPhone}</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <ShieldCheck size={13} /> Verified UPI Account
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-block w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950 transition active:scale-95"
        >
          Return to Movies
        </Link>
      </div>
    </main>
  );
}