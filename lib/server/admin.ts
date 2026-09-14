import { prisma } from '@/lib/prisma';

export async function getAdminDashboardStats() {
  const [userCount, profileCount, movieCount, playableSources, leelaCount] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.movie.count(),
    prisma.movie.count({ where: { availabilityStatus: 'AVAILABLE' } }),
    prisma.movie.count({ where: { genres: { has: 'Leela' } } }),
  ]);

  return {
    userCount,
    profileCount,
    movieCount,
    playableSources,
    leelaCount,
  };
}
