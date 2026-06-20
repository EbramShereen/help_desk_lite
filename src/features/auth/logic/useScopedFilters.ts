import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { useAppSelector } from '../../../app/hooks';
import type { PermissionGrant } from '../../../core/data/models/response/admin/permission_response';
import type { TicketViewScope } from '../../tickets/repo/TicketRepo';

/**
 * Pure derivation of a user's ticket VIEW scope from their permission grants.
 * Kept pure (no hooks) so it can be unit-tested. Mirrors the Firestore read
 * rules — see `firestore.rules` (canReadTicket).
 */
export function deriveTicketViewScope(
  grants: PermissionGrant[],
  teamId: string | null,
): TicketViewScope {
  const scopeIdsOf = new Map<string, string[]>(grants.map((g) => [g.key, g.scopeIds]));
  const has = (k: string) => scopeIdsOf.has(k);
  const unrestricted = (k: string) => scopeIdsOf.get(k)?.length === 0;

  // A system-wide or unrestricted team/epic/label view grant means every ticket
  // passes the read rule → a single unconstrained query is allowed.
  if (
    has('can_view_all_tickets') ||
    unrestricted('can_view_custom_team_tickets') ||
    unrestricted('can_view_custom_epic_tickets') ||
    unrestricted('can_view_custom_label_tickets')
  ) {
    return { mode: 'all' };
  }

  const teamIds = new Set<string>(scopeIdsOf.get('can_view_custom_team_tickets') ?? []);
  if (has('can_view_own_team_tickets') && teamId) teamIds.add(teamId);
  const epicIds = scopeIdsOf.get('can_view_custom_epic_tickets') ?? [];
  const labelIds = scopeIdsOf.get('can_view_custom_label_tickets') ?? [];
  const ownCreated = has('can_view_own_tickets');
  const assigned = has('can_view_assigned_ticket');

  if (
    teamIds.size === 0 &&
    epicIds.length === 0 &&
    labelIds.length === 0 &&
    !ownCreated &&
    !assigned
  ) {
    return { mode: 'none' };
  }

  return {
    mode: 'scoped',
    teamIds: [...teamIds],
    epicIds: [...epicIds],
    labelIds: [...labelIds],
    ownCreated,
    assigned,
  };
}

/** Hook wrapper: the current user's ticket view scope. */
export function useTicketViewScope(): TicketViewScope {
  const { grants } = usePermissions();
  const teamId = useAppSelector((s) => s.auth.user?.teamId ?? null);
  return useMemo(() => deriveTicketViewScope(grants, teamId), [grants, teamId]);
}
