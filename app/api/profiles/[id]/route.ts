import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Validate profile belong to user
    const profile = await prisma.profile.findFirst({
        where: { id: params.id, userId: user.id }
    });

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updatedProfile = await prisma.profile.update({
        where: { id: params.id },
        data: { name }
    });

    return NextResponse.json(updatedProfile);
}
