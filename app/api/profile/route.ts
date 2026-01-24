import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser, hashPassword, verifyPassword } from '@/app/lib/auth';
import { validatePassword } from '@/app/lib/password-validation';

// GET: Get current user profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij ophalen profiel' },
      { status: 500 }
    );
  }
}

// PATCH: Update profile (name, email, password)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    const updateData: any = {};

    // Update name
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update email
    if (email !== undefined && email !== user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Dit emailadres is al in gebruik' },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase();
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Huidig wachtwoord is verplicht om wachtwoord te wijzigen' },
          { status: 400 }
        );
      }

      // Validate new password with strength check
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          {
            error: 'Nieuw wachtwoord voldoet niet aan de vereisten',
            details: passwordValidation.errors,
            strength: passwordValidation.strength,
          },
          { status: 400 }
        );
      }

      // Verify current password
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
      });

      if (!userData) {
        return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
      }

      const isValid = await verifyPassword(currentPassword, userData.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Huidig wachtwoord is onjuist' },
          { status: 401 }
        );
      }

      // Hash new password
      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: newPassword ? 'Wachtwoord succesvol gewijzigd' : 'Profiel succesvol bijgewerkt',
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij bijwerken profiel' },
      { status: 500 }
    );
  }
}

