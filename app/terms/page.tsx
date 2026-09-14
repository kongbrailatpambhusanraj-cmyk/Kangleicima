import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Monitor, Mail, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Copyright Policy | MANIPURI+',
  description: 'Terms of Service, DMCA Safe Harbor, and non-hosting copyright policy for MANIPURI+.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300 pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium mb-4">
            <ShieldCheck size={14} /> Legal & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms of Service & Copyright
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Last Updated: September 13, 2026 • Effective Immediately
          </p>
        </div>

        {/* Quick Highlights Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <Monitor className="text-red-500" size={20} /> 100% Embedded Content
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              MANIPURI+ does not host, upload, or store video media on its own servers. Playback routes strictly through official YouTube embed players.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <FileText className="text-blue-400" size={20} /> Safe Harbor Intermediary
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Operating under Section 79 of the Indian IT Act, 2000 and the DMCA (17 U.S.C. § 512) as a cultural discovery directory.
            </p>
          </div>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">1. Description of Service</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            MANIPURI+ is an online discovery, cataloging, and indexing platform dedicated to Manipuri cinema, Shumang Leela, dramas, and regional cultural media. The Service provides an organized, searchable user interface allowing users to discover titles, view metadata, track viewing progress, and access publicly available audiovisual content.
          </p>
        </section>

        {/* Section 2: User Accounts */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">2. User Accounts & Security</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Certain personalized features (such as "My List", watch history tracking, and rating functions) require creating an account using Supabase Authentication. You are solely responsible for maintaining the confidentiality of your credentials. We reserve the right to suspend accounts that engage in abuse or unauthorized platform access.
          </p>
        </section>

        {/* Section 3: Voluntary Donations */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">3. Voluntary Donations & Support</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Any voluntary financial contributions or tips made via UPI or third-party payment rails are strictly voluntary gifts made to support database hosting and platform development. Contributions do not constitute payment for content licensing, subscriptions, or pay-per-view access. Access to the catalogue remains free.
          </p>
        </section>

        {/* Section 4: NON-HOSTING & INTELLECTUAL PROPERTY */}
        <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-red-500" size={24} /> 4. Intellectual Property & Non-Hosting Policy
          </h2>
          
          <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <p>
              <strong className="text-white">Zero Video Storage:</strong> MANIPURI+ does <strong>NOT</strong> host, store, duplicate, rip, transcode, upload, or stream any audiovisual files on its own servers or cloud databases.
            </p>
            <p>
              <strong className="text-white">Official Third-Party Embedding:</strong> All streaming playback is rendered strictly through official third-party embedded players (principally the official YouTube Player API and standard iframe embed mechanisms).
            </p>
            <p>
              <strong className="text-white">Creator Rights & Monetization:</strong> Because content is played directly via the YouTube embed player, all advertising monetization, view counts, audience analytics, and licensing settings configured by the original channel uploaders remain fully active and accrue directly to the official uploader or copyright owner.
            </p>
            <p>
              <strong className="text-white">Automatic Takedown Synchronization:</strong> If a video is removed, set to private, geoblocked, or claimed on YouTube by its rightful owner, it automatically and instantly becomes unplayable on MANIPURI+.
            </p>
          </div>
        </section>

        {/* Section 5: Notice & Takedown */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">5. Notice & Content Delisting Procedure</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            We respect the intellectual property rights of all artists, cultural performers, and film producers. If you are a copyright owner or authorized representative and wish to have a title delisted from the MANIPURI+ search directory, you may:
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 pl-2">
            <li>
              <strong className="text-white">Disable Embedding on YouTube (Fastest):</strong> Disabling "Allow embedding" in your YouTube Studio video settings immediately prevents playback across all external sites, including MANIPURI+.
            </li>
            <li>
              <strong className="text-white">Request Directory Delisting:</strong> Send a delisting request to our team with the title name, the URL on MANIPURI+, the YouTube source link, and proof of copyright ownership.
            </li>
          </ul>

          <div className="mt-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Mail className="text-red-500" size={20} />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Designated Copyright Contact</p>
                <p className="text-sm font-medium text-white">bhusanrajlegend@gmail.com</p>
              </div>
            </div>
            <span className="text-xs text-zinc-500">Takedown requests processed within 36 hours</span>
          </div>
        </section>

        {/* Section 6: Jurisdiction */}
        <section className="space-y-4 border-t border-zinc-800/80 pt-8">
          <h2 className="text-xl font-bold text-white">6. Governing Law & Jurisdiction</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or controversy arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Imphal, Manipur, India.
          </p>
        </section>

        {/* Back Link */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-red-500 hover:text-red-400 transition"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}