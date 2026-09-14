"use client";
import React, { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to actual backend logic
    setSubmitted(true);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8 bg-gray-900 rounded w-96">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        {submitted ? (
            <p className="text-green-500">If an account exists with that email, a reset link has been sent.</p>
        ) : (
            <>
                <p className="text-sm text-gray-400">Enter your email to receive a password reset link.</p>
                <input name="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 bg-gray-800 rounded text-white" required />
                <button type="submit" className="p-2 bg-red-600 rounded font-bold">Send Reset Link</button>
            </>
        )}
      </form>
    </div>
  );
}