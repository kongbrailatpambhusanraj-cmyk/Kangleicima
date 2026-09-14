import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await prisma.profile.findMany({
        where: { userId: user.id }
    });

    return NextResponse.json(profiles);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const profile = await prisma.profile.create({
        data: {
            name,
            userId: user.id
        }
    });

    return NextResponse.json(profile, { status: 201 });
}
