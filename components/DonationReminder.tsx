"use client";
import React, { useState, useEffect } from 'react';
import { X, Heart, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DonationReminder = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check first visit
    const dismissed = localStorage.getItem('donationIntroDismissed');
    if (!dismissed) {
      setShowModal(true);
    }

    // Check interaction count
    const interactionCount = parseInt(localStorage.getItem('movieInteractionCount') || '0', 10);
    const bannerDismissed = localStorage.getItem('donationBannerDismissed');
    if (interactionCount > 10 && !bannerDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismissModal = () => {
    localStorage.setItem('donationIntroDismissed', 'true');
    setShowModal(false);
  };

  const handleDismissBanner = () => {
    localStorage.setItem('donationBannerDismissed', 'true');
    setShowBanner(false);
  };

  const navigateToDonate = () => {
    router.push('/donate');
    setShowModal(false);
    setShowBanner(false);
    localStorage.setItem('donationIntroDismissed', 'true');
    localStorage.setItem('donationBannerDismissed', 'true');
  };

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center shadow-2xl">
            <Heart className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">SUPPORT ME</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
                Donations help support development, hosting, and the platform's growth.
            </p>
            <div className="flex flex-col gap-3">
                <button onClick={navigateToDonate} className="bg-white text-black py-3 rounded font-bold hover:bg-gray-200 transition">Donate</button>
                <button onClick={handleDismissModal} className="bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition">Maybe Later</button>
            </div>
        </div>
      </div>
    );
  }

  if (showBanner) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg w-72">
        <button onClick={handleDismissBanner} className="absolute top-2 right-2 text-gray-500 hover:text-white">
            <X size={16} />
        </button>
        <h3 className="font-bold text-white mb-1">Enjoying Manipuri OTT?</h3>
        <p className="text-sm text-gray-400 mb-3">Support the platform and help us keep expanding the collection.</p>
        <button onClick={navigateToDonate} className="w-full bg-red-600 text-white py-2 rounded font-bold text-sm">Support Us</button>
      </div>
    );
  }

  return null;
};

export default DonationReminder;
