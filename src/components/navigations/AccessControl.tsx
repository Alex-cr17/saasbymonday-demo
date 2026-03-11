'use client';

import { ReactNode } from 'react';

type AccessControlProps = {
  isAllowed?: boolean;
  check?: () => boolean;
  elseContent?: ReactNode | null;
  children: ReactNode;
};

export function AccessControl({ isAllowed, check, elseContent = null, children }: AccessControlProps) {
  let permitted = false;

  if (typeof isAllowed === 'boolean') {
    permitted = isAllowed;
  } else if (typeof check === 'function') {
    permitted = check();
  } else {
    permitted = true;
  }

  if (permitted) {
    return <>{children}</>;
  }

  return <>{elseContent}</>;
}

// Usage example
// <AccessControl isAllowed={userRole === Roles.SYSTEM_ADMIN}>
//   <Link href="/admin/settings">Settings</Link>
// </AccessControl>

// <AccessControl check={() => !exceptRoles.includes(userRole)}>
//   <Button>Edit Project</Button>
// </AccessControl>

// <AccessControl check={() => user.isSuperAdmin}>
//   <SecretContent />
// </AccessControl>