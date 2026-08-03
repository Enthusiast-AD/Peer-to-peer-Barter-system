import bcrypt from 'bcryptjs';
import { prisma } from '../db/index.js';

// Bootstrap the admin account from environment variables on server start.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in .env. If the user exists, this promotes
// them to admin and updates their password so login always works.
export const bootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin bootstrap.');
    return;
  }
  if (password.length < 8) {
    console.warn('ADMIN_PASSWORD too short (<8 chars) - skipping admin bootstrap.');
    return;
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { isAdmin: true, password: hashed, banned: false }
      });
      console.log(`Admin bootstrap: ${email} is now an admin.`);
    } else {
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: email.toLowerCase(),
          password: hashed,
          credits: 0,
          isAdmin: true,
          bio: 'Platform administrator'
        }
      });
      console.log(`Admin bootstrap: created admin ${email}.`);
    }
  } catch (error) {
    console.error('Admin bootstrap failed:', error.message);
  }
};
