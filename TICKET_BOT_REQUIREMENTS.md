# Ticket Management Bot Requirements

Based on your staff handbooks, here's a comprehensive list of what you'll need for a ticket management bot using SapphireJS (TypeScript) and Prisma (MySQL).

## 📋 Ticket Types

Your system handles multiple ticket types:

### Verification Tickets

- **Age Verification (ID)** - Government ID verification
  - Opened by members via button selection
  - Initial handling by Cutie Helpers
  - Final closure by Moderators (different person than initial)
  - Must be completed within 12-24 hours ideally, 36 hours max
  - **Note**: VRChat verification is handled automatically by Hephia Bot and does NOT require tickets or staff intervention

### Staff-Talk Tickets

- **Multi-purpose ticket type** - Can be opened by **both members and staff**
- **Member use cases**:
  - Reporting issues to staff
  - General inquiries
  - Seeking help
- **Staff use cases**:
  - Investigating rule violations
  - Delivering warnings/punishments
  - Communicating with staff applicants
  - Following up on reports
- Handled by Moderators
- When opened by staff for punishment: Must follow professional communication flow
- When opened by members: Staff gathers Who, Where, When details

### Event Report Tickets

- **Event Report** - Reports about incidents during events
  - Opened by members via button
  - Handled by Event Staff and Moderators
  - Used for event-specific incidents

### Server-Specific Report Tickets

- **Unsolicited DMs** - Reports of unwanted direct messages
- **Friend Request** - Reports about inappropriate friend requests
- **Drama** - Reports of drama/conflicts
- **Other** - Catch-all for other server-related issues
  - All opened by members via buttons
  - Handled by Moderators
  - May require gathering additional context

---

## 🗄️ Database Schema (Prisma)

### Core Tables

```prisma
// Ticket Management
model Ticket {
  id            String   @id @default(uuid())
  discordId     String   @unique // Discord thread/channel ID
  guildId       String
  type          TicketType
  status        TicketStatus
  title         String

  // Participants
  creatorId     String   // Discord user ID who created ticket
  memberId      String?  // Discord user ID of member involved (for staff-talk)
  assignedStaffId String? // Discord user ID of assigned staff

  // Metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  closedAt      DateTime?
  closedBy      String?  // Discord user ID
  closeReason   String?

  // Relations
  messages      TicketMessage[]
  logs          TicketLog[]
  assignments   TicketAssignment[]
  verification  VerificationTicket?
  eventReport   EventReportTicket?
  staffTalk     StaffTalkTicket?

  @@index([guildId, status])
  @@index([assignedStaffId])
  @@index([memberId])
}

enum TicketType {
  VERIFICATION_ID      // Only ID verification uses tickets
  STAFF_TALK
  EVENT_REPORT
  UNSOLICITED_DM
  FRIEND_REQUEST
  DRAMA
  OTHER
  // Note: VRChat verification is handled by Hephia Bot automatically, no ticket needed
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  AWAITING_RESPONSE
  CLOSED
  ARCHIVED
}

// Ticket Messages (for history/transcript)
model TicketMessage {
  id          String   @id @default(uuid())
  ticketId    String
  messageId   String   @unique // Discord message ID
  authorId    String   // Discord user ID
  content     String   @db.Text
  attachments String[] // Array of attachment URLs
  createdAt   DateTime

  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([authorId])
}

// Ticket Activity Log
model TicketLog {
  id          String   @id @default(uuid())
  ticketId    String
  action      String   // "created", "assigned", "closed", "renamed", "user_added", "user_removed"
  staffId     String   // Discord user ID who performed action
  details     Json?    // Additional action details
  createdAt   DateTime @default(now())

  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([staffId])
}

// Staff Assignments (tracking who's working on what)
model TicketAssignment {
  id          String   @id @default(uuid())
  ticketId    String
  staffId     String   // Discord user ID
  assignedAt  DateTime @default(now())
  unassignedAt DateTime?

  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([staffId])
}

// Member Records (for GitHub-style tracking)
model MemberRecord {
  id          String   @id @default(uuid())
  discordId   String   @unique
  discordTag  String

  // Relations
  warnings    Warning[]
  moderationActions ModerationAction[]
  // Note: Tickets reference memberId directly, not through relation

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Warnings/Punishments (for GitHub records integration)
model Warning {
  id          String   @id @default(uuid())
  memberId    String
  ticketId    String?  // Link to related ticket

  // Warning type
  type        WarningType

  // Warning details
  when        DateTime
  why         String   // Rule broken / reason
  result      String   // "Warning issued", "Timeout Xh", "Ban vote opened", etc.
  loggedBy    String   // Discord user ID of staff who logged

  // Evidence
  evidenceUrls String[] // Screenshot/evidence links

  // Status
  isActive    Boolean  @default(true) // Active for 1 week (for warnings)
  activeUntil DateTime?

  // Additional notes
  notes       String?  @db.Text // Additional context or notes

  // Relations
  member      MemberRecord @relation(fields: [memberId], references: [id], onDelete: Cascade)
  moderationAction ModerationAction?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([memberId])
  @@index([isActive])
  @@index([type])
  @@index([when])
}

enum WarningType {
  WARNING          // Formal warning
  INFORMAL_WARNING // Informal warning
  WATCHLIST        // Added to watchlist
  BANNED           // Member was banned
}

// Moderation Actions Log (tracks all moderation actions taken by staff)
model ModerationAction {
  id          String   @id @default(uuid())
  memberId    String   // Discord user ID of member action was taken on
  staffId     String   // Discord user ID of staff who took action
  ticketId    String?  // Link to related ticket (if applicable)
  warningId   String?  @unique // Link to warning record (if applicable)

  // Action details
  actionType  ModerationActionType
  when        DateTime // When the action occurred
  reason      String   // Reason for the action
  duration    String?  // Duration (for timeouts, temp bans, etc.)

  // Additional details
  channelId   String?  // Channel where action occurred
  messageId   String?  // Message that triggered action (if applicable)
  evidenceUrls String[] // Screenshot/evidence links

  // Status
  isActive    Boolean  @default(true) // For temporary actions
  expiresAt   DateTime? // When temporary action expires

  // Notes
  notes       String?  @db.Text // Additional notes or context

  // Relations
  warning     Warning? @relation(fields: [warningId], references: [id], onDelete: SetNull)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([memberId])
  @@index([staffId])
  @@index([actionType])
  @@index([when])
  @@index([isActive])
  @@index([ticketId])
}

enum ModerationActionType {
  WARNING_ISSUED
  INFORMAL_WARNING_ISSUED
  TIMEOUT
  KICK
  BAN
  UNBAN
  WATCHLIST_ADDED
  WATCHLIST_REMOVED
  MESSAGE_DELETED
  ROLE_ADDED
  ROLE_REMOVED
  VERIFICATION_REVOKED
  VERIFICATION_GRANTED
  OTHER
}

// Mod on Call Rotation
model ModOnCall {
  id          String   @id @default(uuid())
  staffId     String   // Discord user ID
  weekStart   DateTime // Friday when rotation started
  weekEnd     DateTime // Next Friday
  isActive    Boolean  @default(true)

  // Stats
  ticketsClosed Int    @default(0)
  recordsLogged  Int    @default(0)

  createdAt   DateTime @default(now())

  @@index([isActive])
  @@index([weekStart])
}

// Verification-specific data (ID verification only)
// Note: VRChat verification is handled by Hephia Bot, not tracked in tickets
model VerificationTicket {
  id          String   @id @default(uuid())
  ticketId    String   @unique
  verificationType String @default("ID") // Only "ID" - VRChat handled by Hephia

  // Verification steps
  initialVerifierId String? // Cutie Helper or Moderator who did initial
  finalVerifierId   String? // Moderator who closed (must be different)

  // Status tracking
  idReceivedAt      DateTime?
  initialVerifiedAt DateTime?
  finalVerifiedAt   DateTime?

  // Reminders
  reminderCount     Int      @default(0)
  lastReminderAt    DateTime?

  ticket            Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
}

// Event Report-specific data
model EventReportTicket {
  id          String   @id @default(uuid())
  ticketId    String   @unique

  // Event details
  eventName   String?
  eventDate   DateTime?
  eventHostId String?  // Discord user ID of event host

  // Report details
  reportedUserId String? // Discord user ID of reported member
  incidentType   String? // Type of incident

  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([eventHostId])
  @@index([reportedUserId])
}

// Staff-Talk specific metadata (for tracking purpose)
model StaffTalkTicket {
  id          String   @id @default(uuid())
  ticketId    String   @unique

  // Purpose tracking
  purpose     String?  // "investigation", "warning", "punishment", "staff_applicant", "member_report", etc.
  isPunishmentTicket Boolean @default(false) // True if opened by staff for punishment

  // Related member (if applicable)
  targetMemberId String? // Discord user ID of member being investigated/warned

  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([targetMemberId])
  @@index([isPunishmentTicket])
}
```

---

## 🤖 Commands (SapphireJS)

### User-Facing Commands

```typescript
// Ticket Creation (via button interaction)
/ticket create [type] [user?]
// - Creates a new ticket
// - For staff-talk: requires user parameter
// - For verification: auto-creates when button clicked

// Ticket Management (Staff Only)
/ticket add <user>
// - Adds a user to the ticket
// - Logs the action

/ticket remove <user>
// - Removes a user from ticket
// - For staff-talk: only after member acknowledges punishment

/ticket rename <name>
// - Renames ticket thread
// - For staff-talk: format "Stafftalk-Username"
// - Handles cooldown gracefully

/ticket close <reason>
// - Closes ticket with reason
// - Required reason for all tickets
// - Verification: format "Verification Complete - [Initial] Closed By- [Final]"
// - Logs closure

/ticket assign <staff>
// - Assigns staff member to ticket
// - Tracks assignment history

/ticket transfer <staff>
// - Transfers ticket to another staff member
// - Useful for escalation

/ticket info
// - Shows ticket details, status, participants, timeline

/ticket list [status] [assigned]
// - Lists tickets (filterable by status, assigned staff)
// - Shows open tickets for staff dashboard

/ticket transcript
// - Generates text-only transcript
// - For verification: sends to member before closing
```

### Mod on Call Commands

```typescript
/mod-on-call roll
// - Initiates weekly roll (Friday)
// - Uses D20 roll system
// - Lowest roll wins (with tie-breaker rules)
// - Handles advantage for previous week's logger
// - Allows volunteer option

/mod-on-call current
// - Shows current Mod on Call
// - Displays stats (tickets closed, records logged)

/mod-on-call stats [week]
// - Shows Mod on Call statistics
```

### Warning/Record Commands

```typescript
/warning create <user> <type> <reason> <result> [evidence]
// - Creates warning record
// - Types: warning, informal_warning, watchlist, banned
// - Links to ticket if applicable
// - Sets active status (1 week for warnings)

/warning list <user> [type] [active]
// - Lists all warnings for a user
// - Filter by type (warning, informal_warning, watchlist, banned)
// - Filter by active/inactive status
// - Shows related tickets and moderation actions

/warning view <warningId>
// - View full details of a specific warning
// - Shows all related information, evidence, tickets

/warning update <warningId> [reason] [notes]
// - Update warning details (staff only)
// - Add notes or update reason

/warning deactivate <warningId>
// - Manually deactivate warning (if needed)

/watchlist add <user> <reason> [evidence]
// - Add member to watchlist
// - Creates watchlist entry

/watchlist remove <user> [reason]
// - Remove member from watchlist

/watchlist list [user]
// - List all watchlist entries
// - Or list watchlist entries for specific user
```

### Moderation Action Commands

```typescript
/modlog create <user> <action> <reason> [duration] [evidence]
// - Log a moderation action
// - Actions: warning, informal_warning, timeout, kick, ban, unban, watchlist_added, watchlist_removed, etc.
// - Automatically creates warning record if applicable
// - Links to current ticket if used in ticket channel

/modlog list <user> [action] [limit]
// - List moderation actions for a user
// - Filter by action type
// - Limit number of results

/modlog search <query>
// - Search moderation actions
// - Search by staff member, action type, reason, etc.

/modlog stats <user>
// - Show statistics for a member
// - Total warnings, bans, timeouts, etc.
// - Active vs inactive actions
```

### Utility Commands

```typescript
/ticket reminder [ticket]
// - Sends reminder ping to member
// - For verification: up to 2 reminders (~24h apart)
// - For staff-talk: ping every ~24h if unresponsive

/ticket timeout <ticket> <duration>
// - Sets ticket as awaiting response
// - Auto-escalates if no response after duration
```

---

## 🔧 Features & Functionality

### 1. Button-Based Ticket Creation

- **Verification Button**: "Age Verification" button in `#open-a-ticket`

  - Creates ID verification ticket (only for ID verification)
  - Auto-posts verification instructions
  - Assigns to available Cutie Helper or Moderator
  - **Note**: VRChat verification is handled separately by Hephia Bot (no ticket needed)

- **Staff-Talk Button**: "Talk to a Staff" button

  - Creates staff-talk ticket
  - **Available to both members and staff**
  - Members use for reporting issues/inquiries
  - Staff use for investigations, warnings, staff applicant communication

- **Event Report Button**: "Event Report" button

  - Creates event report ticket
  - For reporting incidents during events
  - Available to members

- **Server-Specific Report Buttons**:
  - **"Unsolicited DMs"** - For DM-related reports
  - **"Friend Request"** - For friend request issues
  - **"Drama"** - For conflict/drama reports
  - **"Other"** - Catch-all for other issues
  - All available to members

### 2. Automatic Ticket Management

- **Auto-rename**:
  - Staff-talk tickets opened by staff for punishment: "Stafftalk-Username"
  - Other tickets: Auto-generate appropriate title based on type
- **Auto-assignment**:
  - Verification tickets auto-assign to available Cutie Helper or Moderator
  - Report tickets auto-assign to available Moderator
- **Status tracking**: Auto-update status based on activity
- **Reminder system**:
  - Verification: Auto-remind (48h)
  - Staff-talk: Auto-remind (24h) if awaiting response
  - Event reports: Auto-remind based on urgency

### 3. Verification Workflow (ID Verification Only)

- **Note**: VRChat verification is handled automatically by Hephia Bot - no staff intervention or tickets required
- **Initial verification**: Cutie Helper or Moderator
- **Final verification**: Different Moderator (enforce mutual exclusivity)
- **Role management**:
  - Remove Unverified role when Verified role added
  - Check VRC Verified vs Verified (mutual exclusivity) - handled by Hephia
- **Reminder system**:
  - Up to 2 reminders after welcome message
  - 48h timeout for role selection
- **Closing reasons**:
  - `"Verification Complete - [Initial] Closed By- [Final]"`
  - `"No Response >72hrs"`
  - `"No Verification in >48hrs"`

### 4. Staff-Talk Workflow

- **Multi-purpose handling**:
  - **Member-opened**: Staff gathers Who, Where, When details
  - **Staff-opened for punishment**: Must follow professional communication flow
    - Never start with punishment
    - Share evidence first
    - Allow member to respond
    - Then discuss consequences
- **Professional communication**: Enforce respectful tone (especially for punishment tickets)
- **Evidence sharing**: Track evidence attachments
- **Acknowledgment requirement**: For punishment tickets, don't remove member until they acknowledge
- **Unresponsive handling**:
  - Ping every ~24h
  - After 2 weeks: request unverified role removal
  - If still unresponsive: close as "unresponsive"
- **One staff at a time**: Prevent dogpiling (enforce single active staff)
- **Purpose tracking**: Track if ticket is for investigation, warning, punishment, staff applicant, etc.

### 5. Mod on Call System

- **Weekly rotation**: Every Friday
- **D20 roll system**: Lowest roll wins
- **Tie-breaker**: Previous week's Mod on Call wins ties
- **Advantage system**: Previous week's GitHub logger rolls with advantage
- **Volunteer option**: Allow volunteers before/during roll
- **Default assignment**: Head Moderator/Server Committee if not started by midnight EST
- **Stats tracking**: Tickets closed, records logged

### 6. Moderation Action Logging

- **Automatic logging**: All moderation actions logged automatically
  - When warning issued (via command or ticket)
  - When timeout/kick/ban applied
  - When watchlist entry added/removed
  - When roles changed (verification, etc.)
- **Ticket integration**:
  - Actions taken in tickets automatically logged
  - Link moderation actions to tickets
  - Track which ticket led to which action
- **Warning creation**:
  - Automatically create warning record when action taken
  - Link warning to moderation action
  - Support different warning types

### 7. GitHub Records Integration

- **Auto-logging**: When ticket closed, create/update GitHub issue
- **Member records**: Create new issue if no record exists
- **Naming format**: `DiscordTag [DiscordID]`
- **Template**: Use standard logging template
- **Label management**: Track active warnings (1 week)
- **Evidence linking**: Link ticket screenshots
- **Moderation action sync**: Sync moderation actions to GitHub records

### 8. Permissions & Roles

Required role checks:

- **Cutie Helper**: Can handle initial verification
- **Moderator**: Can handle all tickets, close verifications, staff-talk, all report types
- **Event Staff**: Can handle event report tickets
- **Server Committee/Head Moderator**: Can initiate Mod on Call roll
- **All Members**: Can create staff-talk tickets (for reporting/inquiries)
- **Staff (general)**: Can create staff-talk tickets (for investigations/warnings/applicants)

### 9. Logging & Audit Trail

- **Ticket logs**: All actions logged (create, assign, close, rename, etc.)
- **Message history**: Store all ticket messages
- **Staff activity**: Track who did what and when
- **Discord logging**: Log to appropriate channels
  - Ticket creation/closure
  - Staff assignments
  - Important actions

---

## 📊 Analytics & Reporting

### Metrics to Track

1. **Ticket Metrics**

   - Average resolution time by type
   - Tickets per staff member
   - Open ticket count
   - Response times

2. **Verification Metrics** (ID Verification Only)

   - Average verification time
   - Initial vs final verifier stats
   - Note: VRChat verification metrics would be tracked by Hephia Bot, not in ticket system

3. **Staff Performance**

   - Tickets handled per staff
   - Average resolution time
   - Mod on Call statistics

4. **Warning & Moderation Metrics**
   - Active warnings count (by type)
   - Warning escalation patterns
   - Repeat offenders
   - Moderation actions per staff
   - Most common action types
   - Watchlist statistics
   - Ban/unban statistics

---

## 🔐 Security & Data Management

### Verification Image Handling

- **Auto-deletion**: Images auto-deleted when ticket closed
- **Deletion detection**: Alert if member deletes images before closure
- **Transcript**: Text-only transcript sent to member

### Data Retention

- **Ticket history**: Keep for audit purposes
- **Message history**: Store for transcripts
- **Warning records**: Permanent (for pattern tracking)

---

## 🎨 UI/UX Considerations

### Ticket Embeds

- Status indicator (Open, In Progress, Awaiting Response, Closed)
- Assigned staff member
- Ticket type badge
- Created/updated timestamps
- Quick action buttons (assign, close, transfer)

### Discord Dashboard (In-Bot)

- Staff dashboard showing:
  - Assigned tickets
  - Open tickets needing attention
  - Verification tickets awaiting closure
  - Mod on Call status

### Notifications

- Staff notifications for:
  - New ticket assignment
  - Ticket awaiting response
  - Verification ticket ready for closure
  - Mod on Call rotation

---

## 🌐 Web Dashboard Requirements

A comprehensive web dashboard for staff to manage tickets with advanced filtering and overview capabilities.

### Core Features

#### 1. Ticket Overview Dashboard

- **Big view of all ticket states** - Visual representation of ticket statuses
- **Real-time updates** - Live updates as tickets change
- **Quick stats cards**:
  - Total open tickets
  - Tickets by type
  - Tickets by status
  - Average response time
  - Tickets assigned to you
  - Overdue tickets

#### 2. Advanced Filtering System

**Filter Options:**

- **By Type**: Verification (ID only - VRChat handled by Hephia), Staff-Talk, Event Report, Unsolicited DM, Friend Request, Drama, Other
- **By Status**: Open, In Progress, Awaiting Response, Closed, Archived
- **By Assigned Staff**: Filter by specific staff member or "Unassigned"
- **By Creator**: Member who opened ticket
- **By Date Range**: Created date, updated date, closed date
- **By Time**: Overdue tickets, tickets older than X hours/days
- **By Purpose** (for Staff-Talk): Investigation, Warning, Punishment, Staff Applicant, Member Report
- **By Event** (for Event Reports): Filter by event name, host, date
- **By Member** (for Staff-Talk): Filter by target member being investigated/warned

**Filter Combinations:**

- Save filter presets (e.g., "My Open Tickets", "Overdue Verifications", "Punishment Tickets")
- Quick filter buttons for common views
- Filter by multiple criteria simultaneously

#### 3. Ticket List View

- **Sortable columns**:
  - Ticket ID
  - Type
  - Status
  - Creator
  - Assigned Staff
  - Created Date
  - Last Updated
  - Age (time since creation)
- **Bulk actions**:
  - Assign multiple tickets
  - Close multiple tickets (with reason)
  - Transfer multiple tickets
- **Quick actions per ticket**:
  - View details
  - Assign/Reassign
  - Close
  - Transfer
  - View transcript
  - View related warnings

#### 4. Ticket Detail View

- **Full ticket information**:
  - Complete message history/transcript
  - All participants
  - Assignment history
  - Activity log
  - Related warnings/records
  - Evidence attachments
- **Quick actions panel**:
  - Assign/Reassign staff
  - Change status
  - Add notes (internal)
  - Close ticket
  - Transfer ticket
  - Generate transcript
- **Timeline view**: Visual timeline of all ticket events
- **Related tickets**: Show related tickets for same member

#### 5. Analytics & Reporting

- **Ticket metrics dashboard**:
  - Tickets created over time (chart)
  - Resolution time by type (chart)
  - Staff performance metrics
  - Ticket type distribution
  - Peak hours/days
- **Staff performance**:
  - Tickets handled per staff
  - Average resolution time
  - Response time statistics
  - Ticket type expertise
- **Export capabilities**:
  - Export filtered tickets to CSV/JSON
  - Generate reports (weekly/monthly)
  - Export transcripts

#### 6. Verification Management (ID Verification Only)

- **Verification queue**:
  - List of ID verification tickets awaiting initial verification
  - List of ID verification tickets awaiting final closure
- **Verification stats**:
  - Average verification time (ID only)
  - Staff verification performance
  - **Note**: VRChat verification is handled by Hephia Bot and not tracked in ticket system

#### 7. Mod on Call Dashboard

- **Current Mod on Call**:
  - Display current Mod on Call
  - Stats for current week (tickets closed, records logged)
  - Time remaining in rotation
- **Mod on Call history**:
  - Past rotations
  - Performance metrics
  - Rotation schedule

#### 8. Warning/Record Management & Moderation Logs

- **Advanced Warning Search & Filter**:

  - **Search by**:
    - Discord ID or tag
    - Warning type (Warning, Informal Warning, Watchlist, Banned)
    - Staff member who issued
    - Date range
    - Active vs inactive status
    - Rule broken / reason keywords
  - **Filter options**:
    - Warning type dropdown
    - Active status toggle
    - Date range picker
    - Staff member filter
    - Rule/reason search
  - **Sort options**:
    - Date (newest/oldest)
    - Type
    - Staff member
    - Active status

- **Member Records View**:

  - **Comprehensive member profile**:
    - All warnings (by type)
    - All moderation actions
    - Watchlist status
    - Ban status
    - Related tickets
    - Timeline view of all actions
  - **Warning details**:
    - When, why, result
    - Evidence attachments
    - Staff member who issued
    - Related ticket
    - Active status and expiration
    - Notes
  - **Quick actions**:
    - View full details
    - Edit notes
    - Deactivate/reactivate
    - Link to ticket
    - View evidence

- **Warning Management**:

  - **Create new warnings**:
    - Select type (Warning, Informal Warning, Watchlist, Banned)
    - Enter reason/rule broken
    - Enter result/outcome
    - Upload evidence
    - Link to ticket (if applicable)
    - Add notes
  - **Bulk operations**:
    - Export warnings to CSV/JSON
    - Bulk deactivate (for expired warnings)
    - Bulk link to tickets

- **Watchlist Management**:

  - **Watchlist view**:
    - List all members on watchlist
    - Search and filter watchlist
    - View watchlist history
    - See when added/removed
  - **Watchlist actions**:
    - Add to watchlist
    - Remove from watchlist
    - View watchlist entries for member
    - Add notes to watchlist entry

- **Moderation Action Logs**:

  - **All moderation actions**:
    - View all actions taken by staff
    - Filter by action type (warning, timeout, kick, ban, etc.)
    - Filter by staff member
    - Filter by date range
    - Search by reason/keywords
  - **Action details**:
    - Action type
    - When it occurred
    - Staff member who took action
    - Member action was taken on
    - Reason
    - Duration (for temporary actions)
    - Evidence
    - Related ticket
    - Related warning
    - Notes
  - **Statistics**:
    - Actions per staff member
    - Actions per member
    - Most common action types
    - Actions over time (charts)
    - Active temporary actions count

- **Analytics & Reporting**:
  - **Warning statistics**:
    - Total warnings by type
    - Active warnings count
    - Warnings per member
    - Most common reasons
    - Warning trends over time
  - **Moderation statistics**:
    - Actions per staff member
    - Actions per day/week/month
    - Action type distribution
    - Average time between actions for repeat offenders
  - **Export capabilities**:
    - Export warnings to CSV/JSON
    - Export moderation logs
    - Generate member reports
    - Generate staff activity reports

#### 9. User Management & Permissions

- **Role-based access**:
  - Cutie Helper: View verification tickets, limited actions, view warnings (read-only)
  - Moderator: Full ticket access, all actions, full warning/moderation log access
  - Event Staff: View event reports, limited to event-related tickets, view warnings (read-only)
  - Server Committee/Head Moderator: All access + Mod on Call management + full warning/moderation management
- **Personal settings**:
  - Notification preferences
  - Default filters
  - Theme preferences
  - Dashboard layout customization

#### 10. Search & Quick Access

- **Global search**:
  - Search by ticket ID
  - Search by Discord user ID or tag
  - Search by ticket content/messages
  - Search by close reason
  - Search by warning ID
  - Search by moderation action ID
  - Search by reason/keywords across warnings and actions
- **Quick access**:
  - Recent tickets
  - Bookmarked tickets
  - Frequently accessed filters

### Technical Requirements

#### Frontend

- **Framework**: React/Next.js recommended (or Vue, Angular)
- **State Management**: Redux/Zustand for ticket state
- **Real-time Updates**: WebSocket connection for live updates
- **UI Library**: Material-UI, Tailwind CSS, or similar
- **Charts**: Chart.js, Recharts, or D3.js for analytics

#### Backend API

- **REST API**: Endpoints for all ticket operations
- **WebSocket Server**: For real-time updates
- **Authentication**: Discord OAuth2 for staff login
- **Rate Limiting**: Prevent abuse
- **Caching**: Redis for frequently accessed data

#### Database Queries

- **Optimized queries**: Indexed fields for fast filtering
- **Pagination**: Handle large ticket lists efficiently
- **Aggregations**: Pre-calculated stats for dashboard
- **Full-text search**: For message content search

#### Security

- **Authentication**: Discord OAuth2 with role verification
- **Authorization**: Role-based access control (RBAC)
- **Data validation**: Input sanitization
- **Audit logging**: Track all dashboard actions
- **HTTPS**: Secure connections only

### Dashboard Layout Suggestions

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Search | Notifications | User Menu      │
├─────────────────────────────────────────────────────────┤
│  Sidebar:                                                │
│  - Dashboard                                             │
│  - Tickets (with badge count)                           │
│  - Verifications                                         │
│  - Event Reports                                         │
│  - Mod on Call                                           │
│  - Warnings/Records (with active count)                  │
│  - Moderation Logs                                       │
│  - Watchlist                                             │
│  - Analytics                                             │
│  - Settings                                              │
├─────────────────────────────────────────────────────────┤
│  Main Content Area:                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Quick Stats Cards                                  │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Filter Bar (collapsible)                          │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Ticket List/Grid View                             │ │
│  │  [Sortable, Filterable, Paginated]                 │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Mobile Responsiveness

- **Responsive design**: Works on tablets and mobile
- **Touch-friendly**: Large buttons, swipe actions
- **Mobile-optimized views**: Simplified layouts for small screens
- **Offline capability**: Cache recent tickets for offline viewing

### Integration Points

- **Discord Bot**: Web dashboard syncs with bot actions
- **Database**: Direct Prisma access or API layer
- **Discord API**: Fetch user info, roles, avatars
- **GitHub API**: (Optional) Direct integration for records

---

## 🚀 Updated Implementation Priority

### Phase 1: Core Functionality

1. Ticket creation (button interactions)
2. Basic commands (add, remove, rename, close)
3. Database schema setup
4. Ticket status tracking
5. All ticket types support (Note: VRChat verification handled by Hephia, not tickets)

### Phase 2: Workflow Automation

1. Verification workflow automation
2. Staff-talk workflow enforcement (member & staff use cases)
3. Event report handling
4. Server-specific report handling
5. Auto-assignment system
6. Reminder system

### Phase 3: Advanced Features

1. Mod on Call system
2. GitHub records integration
3. Warning system with different types
4. Moderation action logging
5. **Web Dashboard (Basic)**:
   - Authentication
   - Ticket list view
   - Basic filtering
   - Ticket detail view
   - Warning list view (basic)

### Phase 4: Dashboard Enhancement

1. **Web Dashboard (Advanced)**:
   - Advanced filtering & presets
   - Analytics & reporting
   - Real-time updates
   - Bulk actions
   - Export capabilities
   - **Warning Management (Advanced)**:
     - Advanced search & filter
     - Watchlist management
     - Warning type filtering
     - Member records view
   - **Moderation Logs (Advanced)**:
     - Full moderation action history
     - Action type filtering
     - Staff activity tracking
     - Timeline views
2. Performance optimization
3. Mobile responsiveness

### Phase 5: Polish & Optimization

1. Advanced analytics
2. Staff training features
3. Dashboard customization
4. Notification system
5. Search optimization

---

## 📝 Additional Notes

### Integration Points

- **Hephia Bot**:
  - Coordinate with existing bot for role management
  - VRChat verification is handled entirely by Hephia (no ticket system integration needed)
  - May need to sync verification status for role management
- **Discord API**: Thread management, role management
- **GitHub API**: For records integration (if automated)
- **MySQL**: Local database in Docker container

### Error Handling

- Handle Discord API rate limits
- Graceful degradation if bot is offline
- Ticket recovery if thread deleted
- Database transaction safety

### Testing Considerations

- Test with different role permissions
- Test ticket creation edge cases
- Test Mod on Call roll scenarios
- Test verification workflow variations
- Test unresponsive member handling

---

## 🔗 Related Documentation References

From your handbooks:

- **Verification Process**: `docs/server-staff-handbook/verification-process/`
- **Staff-Talk Tickets**: `docs/server-staff-handbook/moderator/staff-talk-tickets.md`
- **Mod on Call**: `docs/server-staff-handbook/moderator/mod-on-call.md`
- **GitHub Records**: `docs/server-staff-handbook/moderator/github-records.md`
- **Server Channels**: `docs/server-staff-handbook/server-channels.md`
- **Hephia Commands**: `docs/server-staff-handbook/hephia-commands.md`

---

This document should serve as a comprehensive guide for building your ticket management bot. Adjust priorities and features based on your immediate needs!
