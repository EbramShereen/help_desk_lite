import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../app/hooks';
import { useTicketDetailController } from '../../logic/useTicketController';
import { useMembersController } from '../../logic/useMembersController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { AppBadge } from '../../../../core/widgets/AppBadge';
import { StatusBadge } from '../../../../core/widgets/StatusBadge';
import { PriorityBadge } from '../../../../core/widgets/PriorityBadge';
import { DeadlineBadge } from '../../../../core/widgets/DeadlineBadge';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { SubTicketList } from '../widgets/SubTicketList';
import { ActivityTimeline } from '../widgets/ActivityTimeline';
import { TICKET_STATUSES, statusLabels, type TicketStatus } from '../../models/Ticket';
import { usePermissions } from '../../../auth/logic/usePermissions';

export default function TicketDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { ticketQuery, updateStatus, softDelete } = useTicketDetailController(id!);
  const { can } = usePermissions();
  const [showDelete, setShowDelete] = useState(false);
  const [now] = useState(Date.now);

  const ticket = ticketQuery.data;
  const { memberOptions } = useMembersController(ticket?.teamId);

  if (ticketQuery.isLoading) return <p className="p-6 text-sm text-content-muted">Loading…</p>;
  if (!ticket) return <p className="p-6 text-sm text-danger">Ticket not found.</p>;

  const teamScope = ticket.teamId ?? undefined;
  const isAssignee = ticket.assigneeIds.includes(user?.uid ?? '');
  const canEdit =
    can('can_edit_all_tickets') ||
    can('can_edit_custom_team_tickets', teamScope) ||
    can('can_edit_own_team_tickets', teamScope);
  const canUpdateStatus =
    canEdit ||
    can('can_change_own_team_ticket_workflow', teamScope) ||
    (isAssignee && can('can_change_assigned_ticket_workflow'));
  const canDelete =
    can('can_delete_all_tickets') ||
    can('can_delete_custom_team_tickets', teamScope) ||
    can('can_delete_own_team_tickets', teamScope);
  const canManageSubTickets =
    canEdit || can('can_add_subtask') || can('can_add_own_team_subtask', teamScope);

  // Comment / reaction capabilities (scope-aware), threaded into the activity feed.
  const canComment =
    can('can_comment') ||
    can('can_comment_own_team_ticket', teamScope) ||
    (isAssignee && can('can_comment_assigned_ticket'));
  const canReply =
    canComment ||
    can('can_reply_own_team_ticket_comment', teamScope) ||
    (isAssignee && can('can_reply_assigned_ticket_comment'));
  const canReact =
    can('can_give_reaction') ||
    can('can_react_own_team_ticket', teamScope) ||
    (isAssignee && can('can_react_assigned_ticket'));

  const handleStatusChange = (status: TicketStatus) => {
    updateStatus.mutate(status);
  };

  const handleDelete = () => {
    softDelete.mutate(undefined, { onSuccess: () => navigate('/tickets') });
  };

  const assigneeNames = ticket.assigneeIds
    .map((uid) => memberOptions.find((m) => m.value === uid)?.label ?? uid)
    .join(', ');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tightest text-content">{ticket.title}</h1>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <DeadlineBadge deadline={ticket.deadline} status={ticket.status} now={now} />
          </div>
          <p className="text-sm text-content-muted">{ticket.description}</p>
          {ticket.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ticket.labels.map((label) => (
                <AppBadge key={label} tone="primary">
                  {label}
                </AppBadge>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <AppButton variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
            Back
          </AppButton>
          {canDelete && (
            <AppButton variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              Delete
            </AppButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Status update */}
          {canUpdateStatus && (
            <AppCard>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-content-muted">
                Update Status
              </h3>
              <AppDropdown
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                options={TICKET_STATUSES.map((s) => ({ label: statusLabels[s], value: s }))}
              />
            </AppCard>
          )}

          {/* Subtasks */}
          <SubTicketList
            ticketId={ticket.id}
            subtasks={ticket.subtasks}
            canCreate={canManageSubTickets}
            currentUserUid={user?.uid ?? ''}
            teamMembers={memberOptions}
          />

          {/* Activity */}
          <ActivityTimeline
            ticketId={ticket.id}
            canComment={canComment}
            canReply={canReply}
            canReact={canReact}
          />
        </div>

        {/* Metadata sidebar */}
        <div className="flex flex-col gap-4">
          <AppCard>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-label text-content-muted">
              Details
            </h3>
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-content-subtle">Created by</dt>
                <dd className="font-medium text-content">{ticket.createdBy}</dd>
              </div>
              <div>
                <dt className="text-content-subtle">Assigned to</dt>
                <dd className="font-medium text-content">{assigneeNames || '—'}</dd>
              </div>
              <div>
                <dt className="text-content-subtle">Team</dt>
                <dd className="font-medium text-content">{ticket.teamId || '—'}</dd>
              </div>
              {ticket.epicId && (
                <div>
                  <dt className="text-content-subtle">Epic</dt>
                  <dd className="font-medium text-content">{ticket.epicId}</dd>
                </div>
              )}
              {ticket.sprintId && (
                <div>
                  <dt className="text-content-subtle">Sprint</dt>
                  <dd className="font-medium text-content">{ticket.sprintId}</dd>
                </div>
              )}
              <div>
                <dt className="text-content-subtle">Start date</dt>
                <dd className="font-medium text-content">
                  {ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-content-subtle">Deadline</dt>
                <dd className="font-medium text-content">
                  {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-content-subtle">Created</dt>
                <dd className="font-medium text-content">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </AppCard>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title={t('dialogs.deleteTicketTitle')}
        message={t('dialogs.deleteTicketMessage')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
