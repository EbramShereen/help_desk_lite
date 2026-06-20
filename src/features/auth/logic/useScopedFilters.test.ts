import { describe, it, expect } from 'vitest';
import { deriveTicketViewScope } from './useScopedFilters';
import type { PermissionGrant } from '../../../core/data/models/response/admin/permission_response';

const g = (key: string, scopeIds: string[] = []): PermissionGrant =>
  ({ key, scopeIds }) as PermissionGrant;

describe('deriveTicketViewScope', () => {
  it('returns "all" for a system-wide view grant', () => {
    expect(deriveTicketViewScope([g('can_view_all_tickets')], 'teamA')).toEqual({ mode: 'all' });
  });

  it('returns "all" when a custom-team view grant is unrestricted (empty scope)', () => {
    expect(deriveTicketViewScope([g('can_view_custom_team_tickets', [])], null)).toEqual({
      mode: 'all',
    });
  });

  it('returns "none" when there are no view grants', () => {
    expect(deriveTicketViewScope([g('can_create_ticket')], 'teamA')).toEqual({ mode: 'none' });
  });

  it('scopes to the specific custom teams plus own team', () => {
    const scope = deriveTicketViewScope(
      [g('can_view_custom_team_tickets', ['teamA', 'teamB']), g('can_view_own_team_tickets')],
      'teamC',
    );
    expect(scope.mode).toBe('scoped');
    if (scope.mode === 'scoped') {
      expect(scope.teamIds.sort()).toEqual(['teamA', 'teamB', 'teamC']);
      expect(scope.ownCreated).toBe(false);
      expect(scope.assigned).toBe(false);
    }
  });

  it('captures own/assigned/epic/label scopes', () => {
    const scope = deriveTicketViewScope(
      [
        g('can_view_custom_epic_tickets', ['epic1']),
        g('can_view_custom_label_tickets', ['lbl1']),
        g('can_view_own_tickets'),
        g('can_view_assigned_ticket'),
      ],
      null,
    );
    expect(scope).toEqual({
      mode: 'scoped',
      teamIds: [],
      epicIds: ['epic1'],
      labelIds: ['lbl1'],
      ownCreated: true,
      assigned: true,
    });
  });
});
