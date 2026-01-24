import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser, hashPassword } from '@/app/lib/auth';
import { validatePassword } from '@/app/lib/password-validation';

// GET: List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Alleen admins kunnen users bekijken' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het ophalen van users' },
      { status: 500 }
    );
  }
}

// POST: Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Alleen admins kunnen users aanmaken' }, { status: 403 });
    }

    const { email, password, name, role = 'user' } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Validate password with strength check
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Wachtwoord voldoet niet aan de vereisten',
          details: passwordValidation.errors,
          strength: passwordValidation.strength,
        },
        { status: 400 }
      );
    }

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Role moet "user" of "admin" zijn' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Dit emailadres is al geregistreerd' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || undefined,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het aanmaken van user' },
      { status: 500 }
    );
  }
}

// PUT: Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Alleen admins kunnen users updaten' }, { status: 403 });
    }

    const { id, email, name, role, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is verplicht' }, { status: 400 });
    }

    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase();
    if (name !== undefined) updateData.name = name;
    if (role && (role === 'user' || role === 'admin')) updateData.role = role;
    if (password) {
      // Validate password with strength check
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          {
            error: 'Wachtwoord voldoet niet aan de vereisten',
            details: passwordValidation.errors,
            strength: passwordValidation.strength,
          },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het updaten van user' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Alleen admins kunnen users verwijderen' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is verplicht' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Je kunt jezelf niet verwijderen' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het verwijderen van user' },
      { status: 500 }
    );
  }
}

