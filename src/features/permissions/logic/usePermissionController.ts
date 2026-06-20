import { useQuery } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { unwrap } from '../../../core/models/Result';

const PERMISSION_CATALOGUE_KEY = 'permissionCatalogue';

/**
 * Logic hook for the permission catalogue. Feeds the grant pickers in the role
 * builder views.
 */
export function usePermissionController() {
  const repo = useInjected(TOKENS.PermissionRepo);

  const permissionCatalogueQuery = useQuery({
    queryKey: [PERMISSION_CATALOGUE_KEY],
    queryFn: () => unwrap(repo.listPermissionCategories()),
    staleTime: Infinity,
    select: (result) => result.items,
  });

  return {
    permissionCategories: permissionCatalogueQuery.data ?? [],
    permissionCatalogueQuery,
  };
}
