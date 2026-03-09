import { useContext } from 'react';
import { ConfirmContext } from '@/context/ConfirmProvider';

/**
 * Hook for showing confirmation dialogs.
 * 
 * Usage:
 * ```typescript
 * const confirm = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete item?',
 *     description: 'This action cannot be undone.',
 *     confirmText: 'Delete',
 *     destructive: true,
 *   });
 * 
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 * ```
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  
  return context.confirm;
}
