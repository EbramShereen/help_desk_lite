import { Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from '../pages/AboutPage';
import LandingView from '../features/landing/ui/views/LandingView';
import LoginView from '../features/auth/ui/views/LoginView';
import SignUpView from '../features/auth/ui/views/SignUpView';
import ForgotPasswordView from '../features/auth/ui/views/ForgotPasswordView';
import ResetPasswordView from '../features/auth/ui/views/ResetPasswordView';
import AdminUsersView from '../features/auth/ui/views/AdminUsersView';
import PendingApprovalView from '../features/auth/ui/views/PendingApprovalView';
import TicketsListView from '../features/tickets/ui/views/TicketsListView';
import TicketCreateView from '../features/tickets/ui/views/TicketCreateView';
import TicketDetailView from '../features/tickets/ui/views/TicketDetailView';
import TeamsListView from '../features/teams/ui/views/TeamsListView';
import TeamCreateView from '../features/teams/ui/views/TeamCreateView';
import TeamDetailView from '../features/teams/ui/views/TeamDetailView';
import EpicsListView from '../features/epics/ui/views/EpicsListView';
import EpicCreateView from '../features/epics/ui/views/EpicCreateView';
import EpicDetailView from '../features/epics/ui/views/EpicDetailView';
import SprintsListView from '../features/sprints/ui/views/SprintsListView';
import SprintCreateView from '../features/sprints/ui/views/SprintCreateView';
import SprintDetailView from '../features/sprints/ui/views/SprintDetailView';
import BoardView from '../features/tickets/ui/views/BoardView';
import SummaryView from '../features/tickets/ui/views/SummaryView';
import BacklogView from '../features/sprints/ui/views/BacklogView';
import TimelineView from '../features/epics/ui/views/TimelineView';
import ProfileView from '../features/auth/ui/views/ProfileView';
import RolesView from '../features/roles/ui/views/RolesView';
import RoleDetailView from '../features/roles/ui/views/RoleDetailView';
import WorkflowView from '../features/workflow/ui/views/WorkflowView';
import QuotesView from '../features/quotes/ui/views/QuotesView';
import AuthGuard from '../features/auth/ui/guards/AuthGuard';
import RoleGuard from '../features/auth/ui/guards/RoleGuard';
import PermissionGuard from '../features/auth/ui/guards/PermissionGuard';
import { useAppSelector } from '../app/hooks';
import { usePermissions } from '../features/auth/logic/usePermissions';
import { NAV_ACCESS, LANDING_ORDER } from './navAccess';

function DefaultRedirect() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const { canAny, isLoading } = usePermissions();

  if (isLoading) return <p className="p-6 text-content-muted">Loading…</p>;

  // Land on the first destination the user can actually reach.
  const landing = LANDING_ORDER.find((r) => canAny(...r.anyOf));
  if (landing) return <Navigate to={landing.to} replace />;
  if (role === 'admin') return <Navigate to="/admin/users" replace />;
  return <Navigate to="/profile" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<SignUpView />} />
      <Route path="/forgot-password" element={<ForgotPasswordView />} />
      <Route path="/reset-password" element={<ResetPasswordView />} />
      <Route path="/pending" element={<PendingApprovalView />} />

      {/* Protected */}
      <Route element={<AuthGuard />}>
        <Route path="/app" element={<DefaultRedirect />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfileView />} />

        {/* Agile views — permission-gated (additive to role guards) */}
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.board} />}>
          <Route path="/board" element={<BoardView />} />
        </Route>
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.backlog} />}>
          <Route path="/backlog" element={<BacklogView />} />
        </Route>
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.timeline} />}>
          <Route path="/timeline" element={<TimelineView />} />
        </Route>
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.summary} />}>
          <Route path="/summary" element={<SummaryView />} />
        </Route>

        {/* Admin config — permission-gated */}
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.roles} />}>
          <Route path="/admin/roles" element={<RolesView />} />
          <Route path="/admin/roles/:id" element={<RoleDetailView />} />
        </Route>
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.workflow} />}>
          <Route path="/admin/workflow" element={<WorkflowView />} />
        </Route>
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.quotes} />}>
          <Route path="/quotes" element={<QuotesView />} />
        </Route>

        {/* Tickets */}
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.tickets} />}>
          <Route path="/tickets" element={<TicketsListView />} />
          <Route path="/tickets/:id" element={<TicketDetailView />} />
        </Route>
        <Route
          element={<PermissionGuard anyOf={['can_create_ticket', 'can_create_own_team_ticket']} />}
        >
          <Route path="/tickets/new" element={<TicketCreateView />} />
        </Route>

        {/* Epics */}
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.epics} />}>
          <Route path="/epics" element={<EpicsListView />} />
          <Route path="/epics/new" element={<EpicCreateView />} />
          <Route path="/epics/:id" element={<EpicDetailView />} />
        </Route>

        {/* Sprints */}
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.sprints} />}>
          <Route path="/sprints" element={<SprintsListView />} />
          <Route path="/sprints/new" element={<SprintCreateView />} />
          <Route path="/sprints/:id" element={<SprintDetailView />} />
        </Route>

        {/* Teams */}
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.teams} />}>
          <Route path="/teams" element={<TeamsListView />} />
          <Route path="/teams/new" element={<TeamCreateView />} />
          <Route path="/teams/:id" element={<TeamDetailView />} />
        </Route>

        {/* Team Progress
        <Route element={<PermissionGuard anyOf={NAV_ACCESS.teamProgress} />}>
          <Route path="/team-progress" element={<TeamProgressView />} />
        </Route>
        */}

        {/* Admin: users management */}
        <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route path="/admin/users" element={<AdminUsersView />} />
        </Route>
      </Route>

      <Route path="*" element={<p className="text-center">404 — Not Found</p>} />
    </Routes>
  );
}
