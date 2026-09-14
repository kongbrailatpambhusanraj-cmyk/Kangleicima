import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { progress } = await request.json();
    const activeProfileId = (user as any)?.user_metadata?.activeProfileId;

    const profile = await prisma.profile.findFirst({
        where: {
            userId: user.id,
            ...(activeProfileId ? { id: activeProfileId } : {})
        }
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // Check if history exists
    const history = await prisma.watchHistory.findFirst({
        where: { profileId: profile.id, movieId: params.id }
    });

    if (history) {
        await prisma.watchHistory.update({
            where: { id: history.id },
            data: { progress, watchedAt: new Date() }
        });
    } else {
        await prisma.watchHistory.create({
            data: { profileId: profile.id, movieId: params.id, progress }
        });
    }

    return NextResponse.json({ success: true });
}
