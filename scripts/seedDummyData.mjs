/**
 * Seed realistic e-commerce support data into Firestore.
 *
 * Creates:
 *   - Admin owner at users/{adminUid}
 *   - 3 custom roles (Manager, Team Leader, Team Member) from permissionCatalogue
 *   - 5 teams (UI/UX, Backend, Frontend, Mobile, QA) with 5 members + 1 leader each
 *   - 2 managers across all teams
 *   - Employee profiles at users/{adminUid}/employeesData/{uid}
 *   - Pointer docs at users/{uid} for auth resolution
 *   - Workflow statuses, labels, epics, sprints, tickets with comments
 *
 * Run:  node scripts/seedDummyData.mjs
 * Wipe: node scripts/seedDummyData.mjs --force
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAUK8H7SXkLwmagmceSi1Ta3G_8p0RWzXU',
  authDomain: 'help-desk-lite.firebaseapp.com',
  projectId: 'help-desk-lite',
  storageBucket: 'help-desk-lite.firebasestorage.app',
  messagingSenderId: '837842550235',
  appId: '1:837842550235:web:edbcdf8e8c5683007f3bfe',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ts = (daysAgo) => Date.now() - daysAgo * 86400000 + Math.floor(Math.random() * 86400000);
const daysBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const PASSWORD = 'ShopNova2026!';

// ─── Role Definitions (permissions selected from permissionCatalogue) ───────

const MANAGER_PERMISSIONS = [
  'can_create_ticket', 'can_view_all_tickets', 'can_edit_all_tickets', 'can_delete_all_tickets', 'can_move_ticket',
  'can_view_board', 'can_view_board_all_teams', 'can_view_backlog',
  'can_view_timeline', 'can_view_summary',
  'can_create_epic', 'can_edit_epic', 'can_remove_epic',
  'can_assign_teams_to_epic', 'can_add_all_tickets_to_epic', 'can_remove_all_tickets_from_epic',
  'can_create_sprint', 'can_edit_sprint', 'can_delete_sprint',
  'can_add_tickets_to_sprint', 'can_remove_tickets_from_sprint',
  'can_manage_teams',
  'can_comment', 'can_view_all_comments', 'can_delete_all_comments',
  'can_give_reaction',
  'can_create_workflow', 'can_edit_workflow', 'can_remove_workflow',
  'can_manage_statuses', 'can_manage_labels',
];

const TEAM_LEADER_PERMISSIONS = [
  'can_create_ticket', 'can_view_all_tickets', 'can_edit_own_team_tickets', 'can_move_own_team_ticket',
  'can_view_board', 'can_view_board_custom_teams',
  'can_view_timeline',
  'can_create_own_team_sprint', 'can_edit_own_team_sprint', 'can_delete_own_team_sprint',
  'can_manage_own_team_members', 'can_view_own_team_progress',
  'can_comment', 'can_view_all_comments',
  'can_give_reaction',
  'can_view_own_team_tickets',
  'can_create_own_team_ticket',
  'can_change_own_team_ticket_workflow',
];

const TEAM_MEMBER_PERMISSIONS = [
  'can_view_assigned_ticket',
  'can_change_assigned_ticket_workflow',
  'can_comment_assigned_ticket',
  'can_give_reaction',
  'can_view_own_tickets',
];

const MANAGER_FEATURES = {
  summary: true, timeline: true, kanban: true, backlog: true,
  sprints: true, epics: true, members: true, settings: false,
};
const LEADER_FEATURES = {
  summary: false, timeline: true, kanban: true, backlog: false,
  sprints: true, epics: false, members: true, settings: false,
};
const MEMBER_FEATURES = {
  summary: false, timeline: false, kanban: false, backlog: false,
  sprints: false, epics: false, members: false, settings: false,
};

// ─── Team Members Data (realistic names) ────────────────────────────────────

const MANAGERS = [
  { email: 'omar.hassan@devteam.io', name: 'Omar Hassan' },
  { email: 'diana.chen@devteam.io', name: 'Diana Chen' },
];

const TEAMS_DEF = [
  {
    label: 'UI/UX',
    leader: { email: 'sarah.martinez@devteam.io', name: 'Sarah Martinez' },
    members: [
      { email: 'liam.foster@devteam.io', name: 'Liam Foster' },
      { email: 'yuki.tanaka@devteam.io', name: 'Yuki Tanaka' },
      { email: 'alex.petrov@devteam.io', name: 'Alex Petrov' },
      { email: 'fatima.ali@devteam.io', name: 'Fatima Ali' },
      { email: 'noah.wright@devteam.io', name: 'Noah Wright' },
    ],
  },
  {
    label: 'Backend',
    leader: { email: 'marcus.johnson@devteam.io', name: 'Marcus Johnson' },
    members: [
      { email: 'priya.sharma@devteam.io', name: 'Priya Sharma' },
      { email: 'jake.wilson@devteam.io', name: 'Jake Wilson' },
      { email: 'nina.volkov@devteam.io', name: 'Nina Volkov' },
      { email: 'carlos.rivera@devteam.io', name: 'Carlos Rivera' },
      { email: 'emma.thompson@devteam.io', name: 'Emma Thompson' },
    ],
  },
  {
    label: 'Frontend',
    leader: { email: 'ravi.patel@devteam.io', name: 'Ravi Patel' },
    members: [
      { email: 'sofia.andersson@devteam.io', name: 'Sofia Andersson' },
      { email: 'tom.baker@devteam.io', name: 'Tom Baker' },
      { email: 'lina.park@devteam.io', name: 'Lina Park' },
      { email: 'david.morales@devteam.io', name: 'David Morales' },
      { email: 'chen.wei@devteam.io', name: 'Chen Wei' },
    ],
  },
  {
    label: 'Mobile',
    leader: { email: 'james.kim@devteam.io', name: 'James Kim' },
    members: [
      { email: 'anna.kowalski@devteam.io', name: 'Anna Kowalski' },
      { email: 'ben.okafor@devteam.io', name: 'Ben Okafor' },
      { email: 'maya.singh@devteam.io', name: 'Maya Singh' },
      { email: 'lucas.schmidt@devteam.io', name: 'Lucas Schmidt' },
      { email: 'zara.ahmed@devteam.io', name: 'Zara Ahmed' },
    ],
  },
  {
    label: 'QA',
    leader: { email: 'elena.popov@devteam.io', name: 'Elena Popov' },
    members: [
      { email: 'ryan.murphy@devteam.io', name: 'Ryan Murphy' },
      { email: 'mei.liu@devteam.io', name: 'Mei Liu' },
      { email: 'oliver.brown@devteam.io', name: 'Oliver Brown' },
      { email: 'isha.gupta@devteam.io', name: 'Isha Gupta' },
      { email: 'samuel.jackson@devteam.io', name: 'Samuel Jackson' },
    ],
  },
];

const LABELS_DEF = [
  { name: 'bug', color: '#EF4444' },
  { name: 'feature', color: '#3B82F6' },
  { name: 'improvement', color: '#8B5CF6' },
  { name: 'hotfix', color: '#DC2626' },
  { name: 'refactor', color: '#F59E0B' },
  { name: 'documentation', color: '#6B7280' },
  { name: 'performance', color: '#14B8A6' },
  { name: 'security', color: '#B91C1C' },
  { name: 'design', color: '#EC4899' },
  { name: 'testing', color: '#0EA5E9' },
  { name: 'blocked', color: '#F97316' },
  { name: 'tech-debt', color: '#6366F1' },
];

const STATUSES = [
  { id: 'todo', name: 'To Do', color: '#6B7280', order: 0, isDone: false },
  { id: 'inProgress', name: 'In Progress', color: '#2563EB', order: 1, isDone: false },
  { id: 'blocked', name: 'Blocked', color: '#B4232A', order: 2, isDone: false },
  { id: 'done', name: 'Done', color: '#059669', order: 3, isDone: true },
];

const EPICS_DEF = [
  {
    title: 'Checkout Flow Redesign',
    description: 'Complete redesign of the checkout experience. Reduce cart abandonment by 30% through streamlined 3-step checkout, saved payment methods, and guest checkout improvements.',
    color: '#3B82F6',
    teamLabels: ['UI/UX', 'Frontend', 'Backend'],
    daysAgo: 45, durationDays: 60,
  },
  {
    title: 'Product Search & Discovery V2',
    description: 'Replace Algolia with Typesense, add faceted search, AI-powered recommendations, and "shop the look" feature. Target: <50ms p95 search latency across 47K SKUs.',
    color: '#14B8A6',
    teamLabels: ['Backend', 'Frontend'],
    daysAgo: 30, durationDays: 50,
  },
  {
    title: 'Mobile App Launch (iOS + Android)',
    description: 'Native mobile apps with React Native. Core features: browse catalog, wishlist, checkout, order tracking, push notifications for order updates and flash sales.',
    color: '#8B5CF6',
    teamLabels: ['Mobile', 'Backend', 'QA'],
    daysAgo: 60, durationDays: 90,
  },
  {
    title: 'Payment Gateway Migration (Stripe → Adyen)',
    description: 'Migrate to Adyen for EU markets. Support Apple Pay, Google Pay, Klarna, iDEAL. Zero-downtime cutover. Must maintain PCI DSS Level 1 compliance.',
    color: '#EF4444',
    teamLabels: ['Backend', 'Frontend', 'QA'],
    daysAgo: 25, durationDays: 45,
  },
  {
    title: 'Design System Unification',
    description: 'Consolidate 3 separate component libraries (web, mobile, admin) into one design system with shared tokens, components, and documentation. Figma → Code pipeline.',
    color: '#EC4899',
    teamLabels: ['UI/UX', 'Frontend', 'Mobile'],
    daysAgo: 40, durationDays: 70,
  },
];

const SPRINTS_DEF = [
  { name: 'Sprint 18 — Checkout UI Polish', teamLabel: 'UI/UX', epicIdx: 0, daysAgo: 21, duration: 14, state: 'completed' },
  { name: 'Sprint 19 — Design Tokens Migration', teamLabel: 'UI/UX', epicIdx: 4, daysAgo: 7, duration: 14, state: 'active' },
  { name: 'Sprint 22 — Search API & Indexing', teamLabel: 'Backend', epicIdx: 1, daysAgo: 14, duration: 14, state: 'completed' },
  { name: 'Sprint 23 — Adyen Sandbox Integration', teamLabel: 'Backend', epicIdx: 3, daysAgo: 0, duration: 14, state: 'active' },
  { name: 'Sprint 14 — Checkout Components', teamLabel: 'Frontend', epicIdx: 0, daysAgo: 7, duration: 14, state: 'active' },
  { name: 'Sprint 10 — App Navigation & Auth', teamLabel: 'Mobile', epicIdx: 2, daysAgo: 14, duration: 14, state: 'completed' },
  { name: 'Sprint 11 — Product Catalog Screen', teamLabel: 'Mobile', epicIdx: 2, daysAgo: 0, duration: 14, state: 'active' },
  { name: 'Sprint 8 — Checkout E2E Tests', teamLabel: 'QA', epicIdx: 0, daysAgo: 7, duration: 14, state: 'active' },
];

// ─── Tickets (realistic e-commerce dev work) ────────────────────────────────

const TICKETS_DEF = [
  // ── UI/UX ──
  {
    title: 'Redesign cart summary component for 3-step checkout',
    description: '<p>Current cart summary takes too much vertical space on mobile. Need a collapsible version that shows item count + total at a glance, expandable to full line items. Must follow new checkout design specs in Figma.</p><p>Acceptance criteria:</p><ul><li>Collapsed: show "{n} items · ${total}" with expand chevron</li><li>Expanded: full item list with thumbnails, qty, price</li><li>Smooth 200ms animation on expand/collapse</li><li>Sticky on mobile viewport</li></ul>',
    teamLabel: 'UI/UX', epicIdx: 0, sprintIdx: 0, labels: ['design', 'improvement'],
    priority: 'high', statusId: 'done', score: 8, daysAgo: 18,
    leaderAssigned: true, memberIdxs: [0, 1],
    subtasks: [
      { title: 'Create Figma mockup for collapsed state', done: true },
      { title: 'Design expanded state with item thumbnails', done: true },
      { title: 'Mobile responsive breakpoints', done: true },
      { title: 'Handoff specs to Frontend team', done: true },
    ],
    comments: [
      { role: 'leader', msg: 'Figma link: checkout-v2/cart-summary. Using the new spacing tokens from the design system.', daysAgo: 16 },
      { role: 'member', idx: 0, msg: 'Added micro-interaction for expand — spring animation feels better than linear. Updated specs.', daysAgo: 14 },
      { type: 'system', msg: 'Status changed from In Progress → Done', daysAgo: 12 },
    ],
  },
  {
    title: 'Create unified color token system across web and mobile',
    description: '<p>We have 3 separate color palettes: web uses Tailwind custom colors, mobile uses RN StyleSheet constants, admin uses CSS variables. Unify into one token source (JSON/Figma variables) that generates platform-specific outputs.</p>',
    teamLabel: 'UI/UX', epicIdx: 4, sprintIdx: 1, labels: ['design', 'refactor'],
    priority: 'high', statusId: 'inProgress', score: 13, daysAgo: 5,
    leaderAssigned: true, memberIdxs: [2, 3],
    subtasks: [
      { title: 'Audit all color values across platforms', done: true },
      { title: 'Define semantic color tokens in Figma Variables', done: true },
      { title: 'Build token export pipeline (Style Dictionary)', done: false },
      { title: 'Generate Tailwind config from tokens', done: false },
      { title: 'Generate RN theme from tokens', done: false },
    ],
    comments: [
      { role: 'leader', msg: 'Audit found 47 unique hex values across web, 31 in mobile, 22 in admin. Only 12 are shared. Major cleanup needed.', daysAgo: 4 },
      { role: 'member', idx: 2, msg: 'Figma Variables set up with light/dark modes. 24 semantic tokens: primary, secondary, surface, error, warning, success, plus text/border/bg variants.', daysAgo: 2 },
    ],
  },
  {
    title: 'User testing report — checkout flow usability issues',
    description: '<p>Ran moderated usability tests with 8 participants on the new checkout prototype. Key findings:</p><ol><li>6/8 users missed the "Apply Coupon" field (too small, below fold)</li><li>5/8 confused by shipping estimate appearing after address entry</li><li>3/8 abandoned at payment step due to lack of Apple Pay</li><li>All users wanted order summary visible during payment</li></ol><p>Recommend: move coupon field inline, show shipping estimate earlier, add Apple Pay (Adyen epic), keep cart summary sticky.</p>',
    teamLabel: 'UI/UX', epicIdx: 0, sprintIdx: null, labels: ['documentation'],
    priority: 'medium', statusId: 'done', score: 3, daysAgo: 10,
    leaderAssigned: false, memberIdxs: [4],
    subtasks: [],
    comments: [
      { role: 'member', idx: 4, msg: 'Full report with session recordings uploaded to Notion: /research/checkout-usability-june-2026', daysAgo: 9 },
    ],
  },

  // ── Backend ──
  {
    title: 'Implement Typesense product search indexing pipeline',
    description: '<p>Build the ETL pipeline to index 47K product SKUs into Typesense. Requirements:</p><ul><li>Full re-index on demand + incremental updates via Postgres CDC</li><li>Schema: title, description, brand, category_path, price, sale_price, rating, review_count, in_stock, image_url, variants</li><li>Custom ranking: in_stock products first, then by rating × review_count</li><li>Synonym dictionary for common search terms (e.g., "tee" → "t-shirt")</li></ul>',
    teamLabel: 'Backend', epicIdx: 1, sprintIdx: 2, labels: ['feature', 'performance'],
    priority: 'urgent', statusId: 'done', score: 13, daysAgo: 12,
    leaderAssigned: true, memberIdxs: [0, 1],
    subtasks: [
      { title: 'Define Typesense collection schema', done: true },
      { title: 'Write Postgres → JSON ETL script', done: true },
      { title: 'Implement bulk indexer (batch 1000 docs)', done: true },
      { title: 'CDC listener for real-time updates', done: true },
      { title: 'Benchmark: verify <50ms p95 latency', done: true },
    ],
    comments: [
      { role: 'leader', msg: 'Schema done. Using `default_sorting_field: computed_rank` (rating * log(review_count)). Facets on brand, category, price_range.', daysAgo: 11 },
      { role: 'member', idx: 0, msg: '47,231 docs indexed in 42 seconds. p95 search latency: 23ms. Well under target.', daysAgo: 9 },
      { role: 'member', idx: 1, msg: 'CDC working via Postgres LISTEN/NOTIFY. Latency from DB write to search index: ~800ms.', daysAgo: 8 },
      { type: 'system', msg: 'Status changed from In Progress → Done', daysAgo: 7 },
    ],
  },
  {
    title: 'Adyen payment gateway — sandbox setup and card flow',
    description: '<p>Set up Adyen test environment for the Stripe → Adyen migration. Tasks:</p><ul><li>Create test merchant account + API credentials</li><li>Implement authorize → capture → refund flow</li><li>Handle 3DS2 challenge flow</li><li>Document all test card numbers</li></ul>',
    teamLabel: 'Backend', epicIdx: 3, sprintIdx: 3, labels: ['feature'],
    priority: 'high', statusId: 'inProgress', score: 8, daysAgo: 6,
    leaderAssigned: true, memberIdxs: [2],
    subtasks: [
      { title: 'Create Adyen test merchant account', done: true },
      { title: 'Configure API credentials in vault', done: true },
      { title: 'Implement authorize → capture flow', done: false },
      { title: 'Handle 3DS2 challenge redirect', done: false },
      { title: 'Document test cards in wiki', done: false },
    ],
    comments: [
      { role: 'member', idx: 2, msg: 'Sandbox up. Test card 4111...1111 works for EUR/USD. One issue: partial refunds need `modificationAmount` field not `amount`.', daysAgo: 4 },
      { role: 'leader', msg: 'Added 3DS2 test cards to the board. Make sure we test the challenge flow on both desktop and mobile browsers.', daysAgo: 2 },
    ],
  },
  {
    title: 'Rate limiter middleware for public API endpoints',
    description: '<p>Public endpoints (search, product detail, reviews) need rate limiting before Black Friday. Implement token-bucket rate limiter:</p><ul><li>Default: 100 req/min per IP</li><li>Authenticated users: 300 req/min</li><li>Search endpoint: 60 req/min (Typesense has its own limits)</li><li>Return 429 with Retry-After header</li></ul>',
    teamLabel: 'Backend', epicIdx: null, sprintIdx: null, labels: ['security', 'performance'],
    priority: 'medium', statusId: 'todo', score: 5, daysAgo: 3,
    leaderAssigned: false, memberIdxs: [3],
    subtasks: [
      { title: 'Implement token bucket algorithm', done: false },
      { title: 'Redis-backed store for distributed rate limiting', done: false },
      { title: 'Add Retry-After header to 429 responses', done: false },
      { title: 'Load test with k6', done: false },
    ],
    comments: [],
  },
  {
    title: 'Order service: duplicate charge bug — missing idempotency key',
    description: '<p>Customer <strong>Robert Nguyen</strong> charged $167.50 twice for order #SN-41089. Root cause: we generate a new UUID per payment API call. If the customer double-clicks "Pay", two charges go through. Fix: use <code>order_{orderId}</code> as idempotency key.</p>',
    teamLabel: 'Backend', epicIdx: null, sprintIdx: null, labels: ['bug', 'hotfix'],
    priority: 'urgent', statusId: 'done', score: 3, daysAgo: 8,
    leaderAssigned: false, memberIdxs: [4],
    subtasks: [
      { title: 'Reverse duplicate charge via Stripe', done: true },
      { title: 'Fix idempotency key generation', done: true },
      { title: 'Add regression test', done: true },
    ],
    comments: [
      { role: 'member', idx: 4, msg: 'Reversed charge. Root cause confirmed: UUID per call, not per order. Fixed to `order_{orderId}`. Deployed.', daysAgo: 7 },
      { type: 'system', msg: 'Status changed from In Progress → Done', daysAgo: 7 },
    ],
  },

  // ── Frontend ──
  {
    title: 'Build checkout step indicator component',
    description: '<p>3-step progress indicator for new checkout flow: Cart → Shipping → Payment. Requirements:</p><ul><li>Show completed/current/upcoming state</li><li>Clickable to navigate back (not forward)</li><li>Animated transition between steps</li><li>Mobile: compact horizontal, desktop: with step labels</li></ul>',
    teamLabel: 'Frontend', epicIdx: 0, sprintIdx: 4, labels: ['feature', 'design'],
    priority: 'high', statusId: 'inProgress', score: 5, daysAgo: 5,
    leaderAssigned: true, memberIdxs: [0],
    subtasks: [
      { title: 'Build StepIndicator component', done: true },
      { title: 'Add step transition animations', done: true },
      { title: 'Mobile responsive layout', done: false },
      { title: 'Integration with checkout router', done: false },
    ],
    comments: [
      { role: 'member', idx: 0, msg: 'Component done with Framer Motion animations. Using the new design tokens for colors and spacing.', daysAgo: 3 },
      { role: 'leader', msg: 'Looks good. Make sure we handle browser back button — it should go to previous checkout step, not previous page.', daysAgo: 2 },
    ],
  },
  {
    title: 'Implement product search results page with Typesense',
    description: '<p>Replace Algolia InstantSearch with Typesense integration. Features:</p><ul><li>Instant search with debounced input (300ms)</li><li>Faceted filtering: brand, category, price range, rating</li><li>Sort by: relevance, price (asc/desc), newest, rating</li><li>Infinite scroll with skeleton loading</li><li>Search analytics: track queries with zero results</li></ul>',
    teamLabel: 'Frontend', epicIdx: 1, sprintIdx: null, labels: ['feature'],
    priority: 'high', statusId: 'todo', score: 13, daysAgo: 4,
    leaderAssigned: true, memberIdxs: [1, 2],
    subtasks: [
      { title: 'Set up Typesense InstantSearch adapter', done: false },
      { title: 'Build search input with autocomplete', done: false },
      { title: 'Implement faceted filter sidebar', done: false },
      { title: 'Infinite scroll with virtualization', done: false },
      { title: 'Zero-results fallback UI', done: false },
    ],
    comments: [
      { role: 'leader', msg: 'Backend search API is ready (Sprint 22 done). Typesense has an InstantSearch.js adapter — should be mostly plug-and-play.', daysAgo: 3 },
    ],
  },
  {
    title: 'Fix: coupon code field invisible on dark mode',
    description: '<p>Coupon input field has white text on white background in dark mode. The <code>bg-white</code> Tailwind class is hardcoded instead of using theme token <code>bg-surface</code>. Quick fix but symptomatic of broader dark mode issues.</p>',
    teamLabel: 'Frontend', epicIdx: null, sprintIdx: null, labels: ['bug'],
    priority: 'medium', statusId: 'done', score: 1, daysAgo: 2,
    leaderAssigned: false, memberIdxs: [3],
    subtasks: [],
    comments: [
      { role: 'member', idx: 3, msg: 'Fixed. Also found 14 other hardcoded color classes in checkout flow. Created follow-up ticket for dark mode audit.', daysAgo: 1 },
      { type: 'system', msg: 'Status changed from To Do → Done', daysAgo: 1 },
    ],
  },

  // ── Mobile ──
  {
    title: 'Implement bottom tab navigation with auth-gated routes',
    description: '<p>React Native bottom tabs: Home, Search, Cart, Orders, Profile. Routes after login only. Guest users see Home + Search + login prompt on Cart/Orders/Profile tap.</p>',
    teamLabel: 'Mobile', epicIdx: 2, sprintIdx: 5, labels: ['feature'],
    priority: 'high', statusId: 'done', score: 8, daysAgo: 12,
    leaderAssigned: true, memberIdxs: [0, 1],
    subtasks: [
      { title: 'Set up React Navigation bottom tabs', done: true },
      { title: 'Implement auth context + guest/user states', done: true },
      { title: 'Build login prompt modal', done: true },
      { title: 'Deep linking support', done: true },
    ],
    comments: [
      { role: 'leader', msg: 'Using @react-navigation/bottom-tabs v7. Auth state managed via React Context + SecureStore for token persistence.', daysAgo: 10 },
      { role: 'member', idx: 0, msg: 'Navigation working. Deep links tested: shopnova://product/123 opens product detail correctly.', daysAgo: 8 },
      { type: 'system', msg: 'Status changed from In Progress → Done', daysAgo: 7 },
    ],
  },
  {
    title: 'Product catalog screen — grid view with infinite scroll',
    description: '<p>Product listing screen with:</p><ul><li>2-column grid (adjustable to 1-column list view)</li><li>Product card: image, title, price, rating stars, "Add to Cart" button</li><li>Infinite scroll with FlatList optimization</li><li>Pull-to-refresh</li><li>Category filter chips at top</li></ul>',
    teamLabel: 'Mobile', epicIdx: 2, sprintIdx: 6, labels: ['feature'],
    priority: 'high', statusId: 'inProgress', score: 8, daysAgo: 5,
    leaderAssigned: false, memberIdxs: [2, 3],
    subtasks: [
      { title: 'Build ProductCard component', done: true },
      { title: 'FlatList with 2-column grid', done: true },
      { title: 'Infinite scroll pagination', done: false },
      { title: 'Category filter chips', done: false },
      { title: 'List/grid view toggle', done: false },
    ],
    comments: [
      { role: 'member', idx: 2, msg: 'ProductCard done. Using FastImage for cached image loading. Rating component uses react-native-ratings.', daysAgo: 3 },
      { role: 'member', idx: 3, msg: 'FlatList renders 200 items smoothly. Using getItemLayout for fixed-height optimization.', daysAgo: 1 },
    ],
  },
  {
    title: 'Push notification setup — Firebase Cloud Messaging',
    description: '<p>Set up FCM for iOS + Android. Notification types: order status updates, flash sale alerts, abandoned cart reminders, back-in-stock alerts.</p>',
    teamLabel: 'Mobile', epicIdx: 2, sprintIdx: null, labels: ['feature'],
    priority: 'medium', statusId: 'todo', score: 5, daysAgo: 8,
    leaderAssigned: false, memberIdxs: [4],
    subtasks: [
      { title: 'Configure FCM in Firebase console', done: false },
      { title: 'iOS APNs certificate setup', done: false },
      { title: 'Implement notification handler', done: false },
      { title: 'Deep link from notification tap', done: false },
    ],
    comments: [],
  },

  // ── QA ──
  {
    title: 'E2E test suite — checkout flow (happy path + edge cases)',
    description: '<p>Playwright E2E tests for the new checkout flow. Cover:</p><ul><li>Happy path: add item → cart → shipping → payment → order confirmation</li><li>Guest checkout vs logged-in user</li><li>Coupon application (valid, expired, minimum not met)</li><li>Out-of-stock item during checkout</li><li>Payment failure → retry</li><li>Browser back/forward navigation</li></ul>',
    teamLabel: 'QA', epicIdx: 0, sprintIdx: 7, labels: ['testing'],
    priority: 'high', statusId: 'inProgress', score: 13, daysAgo: 6,
    leaderAssigned: true, memberIdxs: [0, 1],
    subtasks: [
      { title: 'Set up Playwright test infrastructure', done: true },
      { title: 'Write happy path E2E test', done: true },
      { title: 'Guest checkout test', done: false },
      { title: 'Coupon edge case tests', done: false },
      { title: 'Payment failure + retry test', done: false },
      { title: 'Navigation (back/forward) tests', done: false },
    ],
    comments: [
      { role: 'leader', msg: 'Playwright 1.45 configured with Chrome + WebKit. Using test fixtures for seeded product data and user accounts.', daysAgo: 5 },
      { role: 'member', idx: 0, msg: 'Happy path passing. Found a bug: order confirmation page doesn\'t show shipping address. Filed ticket for Frontend.', daysAgo: 3 },
      { role: 'member', idx: 1, msg: 'Added Page Object Model for checkout steps. Makes tests much more readable.', daysAgo: 2 },
    ],
  },
  {
    title: 'Performance testing — search API under load',
    description: '<p>k6 load tests for the new Typesense-backed search API. Scenarios:</p><ul><li>Steady state: 500 concurrent users, 5 min</li><li>Spike: ramp from 100 → 2000 users in 30 sec</li><li>Soak: 200 users for 1 hour</li><li>Target: p95 < 100ms, error rate < 0.1%, no memory leaks</li></ul>',
    teamLabel: 'QA', epicIdx: 1, sprintIdx: null, labels: ['testing', 'performance'],
    priority: 'medium', statusId: 'todo', score: 8, daysAgo: 3,
    leaderAssigned: false, memberIdxs: [2],
    subtasks: [
      { title: 'Write k6 search load test script', done: false },
      { title: 'Configure Grafana dashboard for metrics', done: false },
      { title: 'Run steady state test', done: false },
      { title: 'Run spike test', done: false },
      { title: 'Document results + bottlenecks', done: false },
    ],
    comments: [],
  },
  {
    title: 'Mobile app — crash on Android 12 when opening camera for barcode scan',
    description: '<p>App crashes on Android 12 (API 31) when user taps "Scan Barcode" in product comparison feature. Works on Android 13+. Logcat shows <code>SecurityException: Permission denied (missing CAMERA permission in manifest)</code>. Need to add runtime permission request for Android 12.</p>',
    teamLabel: 'QA', epicIdx: 2, sprintIdx: null, labels: ['bug'],
    priority: 'high', statusId: 'blocked', score: 3, daysAgo: 4,
    leaderAssigned: false, memberIdxs: [3],
    subtasks: [
      { title: 'Reproduce on Android 12 emulator', done: true },
      { title: 'Fix: add runtime permission request', done: false },
      { title: 'Regression test on Android 12, 13, 14', done: false },
    ],
    comments: [
      { role: 'member', idx: 3, msg: 'Reproduced. Android 12 requires runtime camera permission even if declared in manifest. Need Mobile team to fix — blocking QA for barcode feature tests.', daysAgo: 3 },
      { type: 'system', msg: 'Status changed from In Progress → Blocked', daysAgo: 3 },
    ],
  },

  // ── Cross-team ──
  {
    title: 'Security audit: XSS vulnerability in product review HTML rendering',
    description: '<p>Penetration test found stored XSS in product reviews. User-submitted review HTML is rendered with <code>dangerouslySetInnerHTML</code> without sanitization. Attacker can inject <code>&lt;script&gt;</code> tags via the review submission form.</p><p>Fix: sanitize with DOMPurify before rendering. Also audit all other `dangerouslySetInnerHTML` usages across the codebase.</p>',
    teamLabel: 'Frontend', epicIdx: null, sprintIdx: null, labels: ['security', 'hotfix'],
    priority: 'urgent', statusId: 'inProgress', score: 5, daysAgo: 2,
    leaderAssigned: true, memberIdxs: [4],
    subtasks: [
      { title: 'Add DOMPurify to review rendering', done: true },
      { title: 'Audit all dangerouslySetInnerHTML usages', done: false },
      { title: 'Add CSP headers as defense-in-depth', done: false },
    ],
    comments: [
      { role: 'member', idx: 4, msg: 'DOMPurify added to ReviewCard. Found 7 other `dangerouslySetInnerHTML` usages — 3 in product description, 2 in email templates, 2 in CMS content blocks.', daysAgo: 1 },
      { role: 'leader', msg: 'Prioritize the product description ones — they\'re customer-facing. CMS blocks are admin-only, lower risk.', daysAgo: 0 },
    ],
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const force = process.argv.includes('--force');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in as admin...');
  const adminCred = await signInWithEmailAndPassword(auth, 'admin@helpdesk.local', 'ChangeMe_Admin#2026');
  const adminUid = adminCred.user.uid;
  const ws = adminUid;

  // Check existing data
  const teamsCol = collection(db, `users/${ws}/teams`);
  const existingTeams = await getDocs(teamsCol);
  if (!existingTeams.empty && !force) {
    console.log(`Workspace has ${existingTeams.size} teams. Use --force to wipe.`);
    process.exit(0);
  }

  if (force) {
    console.log('Wiping existing data...');
    for (const col of ['teams', 'labels', 'statuses', 'epics', 'sprints', 'roles', 'employeesData']) {
      await wipeCollection(db, `users/${ws}/${col}`);
    }
    await wipeTickets(db, ws);
    // Wipe pointer docs (not admin's own doc)
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const d of usersSnap.docs) {
      if (d.id !== adminUid) await deleteDoc(d.ref);
    }
    console.log('Wiped.');
  }

  // ── Recreate admin doc at users/{adminUid} ──
  console.log('\nCreating admin profile...');
  await setDoc(doc(db, 'users', adminUid), {
    uid: adminUid,
    email: 'admin@helpdesk.local',
    displayName: 'Admin',
    role: 'admin',
    workspaceId: adminUid,
    customRoleId: null,
    active: true,
    createdBy: null,
    teamAddedBy: null,
    teamId: null,
    teamIds: [],
    assignedTicketIds: [],
    assignedSprintIds: [],
    features: {
      summary: true, timeline: true, kanban: true, backlog: true,
      sprints: true, epics: true, members: true, settings: true,
    },
    workflowPermissions: [],
    teamPermissions: [],
    epicPermissions: [],
    labelPermissions: [],
    sprintPermissions: [],
    createdAt: Date.now(),
  });
  console.log('  ✓ Admin profile');

  // ── Create custom roles ──
  console.log('\nCreating custom roles...');
  const toGrants = (keys) => keys.map((k) => ({ key: k, scopeIds: [] }));

  const managerRoleRef = await addDoc(collection(db, `users/${ws}/roles`), {
    name: 'Manager',
    permissions: toGrants(MANAGER_PERMISSIONS),
    permissionScopes: Object.fromEntries(MANAGER_PERMISSIONS.map((k) => [k, []])),
    createdBy: adminUid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  console.log(`  ✓ Manager role (${managerRoleRef.id})`);

  const leaderRoleRef = await addDoc(collection(db, `users/${ws}/roles`), {
    name: 'Team Leader',
    permissions: toGrants(TEAM_LEADER_PERMISSIONS),
    permissionScopes: Object.fromEntries(TEAM_LEADER_PERMISSIONS.map((k) => [k, []])),
    createdBy: adminUid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  console.log(`  ✓ Team Leader role (${leaderRoleRef.id})`);

  const memberRoleRef = await addDoc(collection(db, `users/${ws}/roles`), {
    name: 'Team Member',
    permissions: toGrants(TEAM_MEMBER_PERMISSIONS),
    permissionScopes: Object.fromEntries(TEAM_MEMBER_PERMISSIONS.map((k) => [k, []])),
    createdBy: adminUid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  console.log(`  ✓ Team Member role (${memberRoleRef.id})`);

  // ── Create Firebase Auth accounts + employee docs ──
  console.log('\nCreating employees...');

  async function createEmployee(person, roleId, features) {
    let uid;
    try {
      await signOut(auth);
      const cred = await createUserWithEmailAndPassword(auth, person.email, PASSWORD);
      await updateProfile(cred.user, { displayName: person.name });
      uid = cred.user.uid;
      console.log(`  ✓ ${person.name} (${uid})`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, person.email, PASSWORD);
        uid = cred.user.uid;
        console.log(`  ⏭ ${person.name} exists (${uid})`);
      } else throw err;
    }

    // Re-sign as admin for Firestore
    await signOut(auth);
    await signInWithEmailAndPassword(auth, 'admin@helpdesk.local', 'ChangeMe_Admin#2026');

    // Pointer doc at users/{uid}
    await setDoc(doc(db, 'users', uid), { workspaceId: ws, role: 'pending' });

    // Full profile at users/{ws}/employeesData/{uid}
    await setDoc(doc(db, `users/${ws}/employeesData`, uid), {
      uid,
      email: person.email,
      displayName: person.name,
      role: 'pending',
      workspaceId: ws,
      customRoleId: roleId,
      active: true,
      createdBy: adminUid,
      teamAddedBy: adminUid,
      teamId: null,
      teamIds: [],
      assignedTicketIds: [],
      assignedSprintIds: [],
      features,
      workflowPermissions: [],
      teamPermissions: [],
      epicPermissions: [],
      labelPermissions: [],
      sprintPermissions: [],
      createdAt: Date.now(),
    });

    return uid;
  }

  // Managers
  const managerUids = [];
  for (const mgr of MANAGERS) {
    managerUids.push(await createEmployee(mgr, managerRoleRef.id, MANAGER_FEATURES));
  }

  // Team leaders + members
  const teamMemberUids = {}; // teamLabel → { leaderUid, memberUids[] }
  for (const team of TEAMS_DEF) {
    const leaderUid = await createEmployee(team.leader, leaderRoleRef.id, LEADER_FEATURES);
    const memberUids = [];
    for (const member of team.members) {
      memberUids.push(await createEmployee(member, memberRoleRef.id, MEMBER_FEATURES));
    }
    teamMemberUids[team.label] = { leaderUid, memberUids };
  }

  // ── Seed statuses ──
  console.log('\nSeeding workflow statuses...');
  for (const status of STATUSES) {
    await setDoc(doc(db, `users/${ws}/statuses`, status.id), { ...status, createdAt: Date.now() });
    console.log(`  ✓ ${status.name}`);
  }

  // ── Seed labels ──
  console.log('\nSeeding labels...');
  const labelIds = {};
  for (const label of LABELS_DEF) {
    const ref = await addDoc(collection(db, `users/${ws}/labels`), { ...label, createdAt: Date.now() });
    labelIds[label.name] = ref.id;
    console.log(`  ✓ ${label.name}`);
  }

  // ── Seed teams ──
  console.log('\nSeeding teams...');
  const teamIds = {};
  for (const teamDef of TEAMS_DEF) {
    const { leaderUid, memberUids } = teamMemberUids[teamDef.label];
    const allUids = [leaderUid, ...memberUids];
    const employees = {};

    employees[leaderUid] = { name: teamDef.leader.name, photoUrl: null, role: 'team_leader' };
    teamDef.members.forEach((m, i) => {
      employees[memberUids[i]] = { name: m.name, photoUrl: null, role: 'member' };
    });

    const ref = await addDoc(collection(db, `users/${ws}/teams`), {
      label: teamDef.label,
      managerId: managerUids[0],
      teamLeaderId: leaderUid,
      memberCount: allUids.length,
      employees,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    teamIds[teamDef.label] = ref.id;
    console.log(`  ✓ ${teamDef.label} (${ref.id})`);

    // Update employee teamIds
    for (const uid of allUids) {
      await setDoc(doc(db, `users/${ws}/employeesData`, uid), {
        teamId: ref.id,
        teamIds: [ref.id],
      }, { merge: true });
    }
    // Managers belong to all teams
    for (const mgrUid of managerUids) {
      const existing = await getDocData(db, `users/${ws}/employeesData/${mgrUid}`);
      const existingTeamIds = existing?.teamIds || [];
      await setDoc(doc(db, `users/${ws}/employeesData`, mgrUid), {
        teamId: existingTeamIds[0] || ref.id,
        teamIds: [...new Set([...existingTeamIds, ref.id])],
      }, { merge: true });
    }
  }

  // ── Seed epics ──
  console.log('\nSeeding epics...');
  const epicIds = [];
  for (const epicDef of EPICS_DEF) {
    const start = ts(epicDef.daysAgo);
    const ref = await addDoc(collection(db, `users/${ws}/epics`), {
      title: epicDef.title,
      description: epicDef.description,
      teamIds: epicDef.teamLabels.map((l) => teamIds[l]),
      ticketIds: [],
      createdBy: adminUid,
      color: epicDef.color,
      startDate: start,
      endDate: start + epicDef.durationDays * 86400000,
      createdAt: start,
      updatedAt: Date.now(),
    });
    epicIds.push(ref.id);
    console.log(`  ✓ ${epicDef.title}`);
  }

  // ── Seed sprints ──
  console.log('\nSeeding sprints...');
  const sprintIds = [];
  for (const sprintDef of SPRINTS_DEF) {
    const start = ts(sprintDef.daysAgo);
    const end = start + sprintDef.duration * 86400000;
    const { leaderUid, memberUids } = teamMemberUids[sprintDef.teamLabel];
    const ref = await addDoc(collection(db, `users/${ws}/sprints`), {
      name: sprintDef.name,
      startDate: start,
      endDate: end,
      teamId: teamIds[sprintDef.teamLabel],
      createdBy: adminUid,
      sprintGoal: `Goals for ${sprintDef.name}`,
      state: sprintDef.state,
      ticketIds: [],
      assignedMemberIds: [leaderUid, ...memberUids],
      createdAt: start,
      updatedAt: Date.now(),
    });
    sprintIds.push(ref.id);
    console.log(`  ✓ ${sprintDef.name}`);
  }

  // ── Seed tickets ──
  console.log('\nSeeding tickets...');
  const ticketsByEpic = {};
  const ticketsBySprint = {};

  for (const t of TICKETS_DEF) {
    const { leaderUid, memberUids } = teamMemberUids[t.teamLabel];
    const assigneeIds = [];
    if (t.leaderAssigned) assigneeIds.push(leaderUid);
    for (const idx of t.memberIdxs) assigneeIds.push(memberUids[idx]);

    const created = ts(t.daysAgo);
    const startDate = created;
    const endDate = created + daysBetween(3, 14) * 86400000;
    const resolvedLabels = t.labels.map((l) => labelIds[l]).filter(Boolean);

    const subtasks = t.subtasks.map((st, i) => ({
      id: `sub_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      title: st.title,
      assigneeId: assigneeIds[i % assigneeIds.length],
      isDone: st.done,
      priority: t.priority,
      statusId: st.done ? 'done' : t.statusId,
      startDate,
      endDate,
    }));

    const ticketData = {
      title: t.title,
      description: t.description,
      assigneeIds,
      teamId: teamIds[t.teamLabel],
      createdBy: adminUid,
      epicId: t.epicIdx !== null ? epicIds[t.epicIdx] : null,
      sprintId: t.sprintIdx !== null ? sprintIds[t.sprintIdx] : null,
      labels: resolvedLabels,
      startDate,
      endDate,
      deadline: endDate,
      statusId: t.statusId,
      status: t.statusId === 'done' ? 'done' : t.statusId === 'inProgress' ? 'inProgress' : 'todo',
      priority: t.priority,
      ticketScore: t.score,
      linkedTickets: [],
      subtasks,
      isDeleted: false,
      createdAt: created,
      updatedAt: Date.now(),
    };

    const ticketRef = await addDoc(collection(db, `users/${ws}/tickets`), ticketData);
    console.log(`  ✓ ${t.title.substring(0, 60)}...`);

    if (t.epicIdx !== null) {
      if (!ticketsByEpic[t.epicIdx]) ticketsByEpic[t.epicIdx] = [];
      ticketsByEpic[t.epicIdx].push(ticketRef.id);
    }
    if (t.sprintIdx !== null) {
      if (!ticketsBySprint[t.sprintIdx]) ticketsBySprint[t.sprintIdx] = [];
      ticketsBySprint[t.sprintIdx].push(ticketRef.id);
    }

    // Activity / comments
    if (t.comments?.length) {
      const actCol = collection(db, `users/${ws}/tickets/${ticketRef.id}/activity`);
      for (const c of t.comments) {
        const isSystem = c.type === 'system';
        let actorUid, authorName;
        if (isSystem) {
          actorUid = 'system';
          authorName = 'System';
        } else if (c.role === 'leader') {
          actorUid = leaderUid;
          authorName = TEAMS_DEF.find((td) => td.label === t.teamLabel).leader.name;
        } else {
          actorUid = memberUids[c.idx];
          authorName = TEAMS_DEF.find((td) => td.label === t.teamLabel).members[c.idx].name;
        }

        await addDoc(actCol, {
          type: isSystem ? 'system' : 'comment',
          actorUid,
          authorName,
          message: c.msg,
          createdAt: ts(c.daysAgo),
          editedAt: null,
          isEditable: !isSystem,
          replies: [],
          reactions: isSystem ? [] : (Math.random() > 0.6
            ? [{ emoji: pick(['👍', '🔥', '✅', '👀', '💯']), actorUids: [assigneeIds[0]] }]
            : []),
        });
      }
    }
  }

  // ── Update back-references ──
  console.log('\nUpdating epic/sprint ticket references...');
  for (const [idx, tIds] of Object.entries(ticketsByEpic)) {
    await setDoc(doc(db, `users/${ws}/epics`, epicIds[idx]), { ticketIds: tIds }, { merge: true });
  }
  for (const [idx, tIds] of Object.entries(ticketsBySprint)) {
    await setDoc(doc(db, `users/${ws}/sprints`, sprintIds[idx]), { ticketIds: tIds }, { merge: true });
  }

  console.log('\n✅ Seed complete!');
  console.log(`  - 1 admin`);
  console.log(`  - ${MANAGERS.length} managers`);
  console.log(`  - ${TEAMS_DEF.length} teams × (1 leader + 5 members) = ${TEAMS_DEF.length * 6} team employees`);
  console.log(`  - 3 custom roles (Manager, Team Leader, Team Member)`);
  console.log(`  - ${LABELS_DEF.length} labels`);
  console.log(`  - ${STATUSES.length} workflow statuses`);
  console.log(`  - ${EPICS_DEF.length} epics`);
  console.log(`  - ${SPRINTS_DEF.length} sprints`);
  console.log(`  - ${TICKETS_DEF.length} tickets with comments & subtasks`);
  console.log(`\n  Employee profiles stored at: users/${ws}/employeesData/{uid}`);
  console.log(`  Pointer docs at: users/{uid} (for auth resolution)`);
  console.log(`  Password for all accounts: ${PASSWORD}`);
  process.exit(0);
}

// ─── Utility ─────────────────────────────────────────────────────────────────

async function getDocData(db, path) {
  const { getDoc } = await import('firebase/firestore');
  const ref = doc(db, path);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

async function wipeCollection(db, path) {
  const snap = await getDocs(collection(db, path));
  for (const d of snap.docs) await deleteDoc(d.ref);
}

async function wipeTickets(db, ws) {
  const snap = await getDocs(collection(db, `users/${ws}/tickets`));
  for (const t of snap.docs) {
    const actSnap = await getDocs(collection(db, `users/${ws}/tickets/${t.id}/activity`));
    for (const a of actSnap.docs) await deleteDoc(a.ref);
    await deleteDoc(t.ref);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
