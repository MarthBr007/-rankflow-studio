import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { checkUserAccess, canAccessResource } from '@/app/lib/access-control';

// GET: Check user access OR list all users for an organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const userEmail = searchParams.get('userEmail');
    const resourceType = searchParams.get('resourceType') as 'templates' | 'prompts' | 'keys' | 'library' | null;
    const action = searchParams.get('action') as 'view' | 'edit' | 'delete' | null;
    const listUsers = searchParams.get('listUsers') === 'true';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is verplicht' },
        { status: 400 }
      );
    }

    // List all users for organization
    if (listUsers) {
      const users = await prisma.tenantUser.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        select: {
          email: true,
          role: true,
          createdAt: true,
        },
      });
      return NextResponse.json(users);
    }

    // Check access for specific user
    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is verplicht voor access checks' },
        { status: 400 }
      );
    }

    if (resourceType && action) {
      const canAccess = await canAccessResource(organizationId, userEmail, resourceType, action);
      return NextResponse.json({ canAccess });
    }

    const access = await checkUserAccess(organizationId, userEmail);
    return NextResponse.json(access);
  } catch (error: any) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het controleren van toegang' },
      { status: 500 }
    );
  }
}

// POST: Create or update user role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, email, role } = body;

    if (!organizationId || !email || !role) {
      return NextResponse.json(
        { error: 'organizationId, email en role zijn verplicht' },
        { status: 400 }
      );
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Ongeldige role. Gebruik: viewer, editor of admin' },
        { status: 400 }
      );
    }

    const user = await prisma.tenantUser.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
      update: {
        role,
      },
      create: {
        organizationId,
        email,
        role,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error saving user role:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het opslaan van user role' },
      { status: 500 }
    );
  }
}

// DELETE: Remove user access
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const email = searchParams.get('email');

    if (!organizationId || !email) {
      return NextResponse.json(
        { error: 'organizationId en email zijn verplicht' },
        { status: 400 }
      );
    }

    await prisma.tenantUser.delete({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
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

