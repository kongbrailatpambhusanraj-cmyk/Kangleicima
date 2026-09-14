import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const { user } = session;

    // Fetch profile data from Prisma
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true }
    });

    if (!dbUser) return <div className="pt-24 p-8 text-white">User not found.</div>;

    return (
        <div className="pt-24 p-8 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
            <div className="bg-gray-900 p-8 rounded-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Account Information</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Created:</strong> {new Date(user.created_at || '').toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Profiles</h2>
                {dbUser.profile.map(p => (
                    <div key={p.id} className="flex justify-between items-center mb-2">
                        <span>{p.name}</span>
                        <Link href="/profile" className="text-blue-500">Edit</Link>
                    </div>
                ))}
                <Link href="/profile" className="block text-red-500 mt-4">Manage Profiles</Link>
            </div>
        </div>
    );
}
