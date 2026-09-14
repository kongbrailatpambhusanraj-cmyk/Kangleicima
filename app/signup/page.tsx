"use client";
import { signUp } from "@/lib/actions";
import { useState } from "react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);

  const action = async (formData: FormData) => {
    try {
        await signUp(formData);
    } catch (e: any) {
        setError(e.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <form action={action} className="flex flex-col gap-4 p-8 bg-gray-900 rounded">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input name="name" type="text" placeholder="Profile Name" className="p-2 bg-gray-800 rounded text-white" required />
        <input name="email" type="email" placeholder="Email" className="p-2 bg-gray-800 rounded text-white" required />
        <input name="password" type="password" placeholder="Password" className="p-2 bg-gray-800 rounded text-white" required />
        <button type="submit" className="p-2 bg-red-600 rounded font-bold">Sign Up</button>
      </form>
    </div>
  );
}
