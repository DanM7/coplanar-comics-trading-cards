import { prisma } from "@/lib/prisma";

export const DEV_USER_ID = "dev-user";

/** JWT dev sign-in does not use PrismaAdapter — ensure User row exists before FK writes. */
export async function ensureUserExists(
  userId: string,
  profile?: { email?: string | null; name?: string | null }
): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: profile?.email ?? undefined,
      name: profile?.name ?? undefined,
    },
    update: {
      ...(profile?.email !== undefined ? { email: profile.email } : {}),
      ...(profile?.name !== undefined ? { name: profile.name } : {}),
    },
  });
}
