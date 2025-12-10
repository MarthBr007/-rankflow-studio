import { prisma } from './prisma';

export type UserRole = 'viewer' | 'editor' | 'admin';

export interface AccessCheck {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
}

// Check user permissions for a specific organization
export async function checkUserAccess(
  organizationId: string,
  userEmail: string
): Promise<AccessCheck> {
  try {
    const user = await prisma.tenantUser.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: userEmail,
        },
      },
    });

    if (!user) {
      // Default: no access
      return {
        canView: false,
        canEdit: false,
        canAdmin: false,
      };
    }

    const role = user.role as UserRole;

    return {
      canView: role === 'viewer' || role === 'editor' || role === 'admin',
      canEdit: role === 'editor' || role === 'admin',
      canAdmin: role === 'admin',
    };
  } catch (error) {
    console.error('Error checking user access:', error);
    return {
      canView: false,
      canEdit: false,
      canAdmin: false,
    };
  }
}

// Check if user can access a specific resource
export async function canAccessResource(
  organizationId: string,
  userEmail: string,
  resourceType: 'templates' | 'prompts' | 'keys' | 'library',
  action: 'view' | 'edit' | 'delete'
): Promise<boolean> {
  const access = await checkUserAccess(organizationId, userEmail);

  if (resourceType === 'keys' && action !== 'view') {
    // Only admins can edit/delete API keys
    return access.canAdmin;
  }

  if (resourceType === 'prompts' && action === 'delete') {
    // Only admins can delete prompts
    return access.canAdmin;
  }

  if (action === 'view') {
    return access.canView;
  }

  if (action === 'edit') {
    return access.canEdit;
  }

  if (action === 'delete') {
    return access.canAdmin;
  }

  return false;
}

