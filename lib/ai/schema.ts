// lib/ai/schema.ts

export const DATABASE_SCHEMA = `
## Database Schema

### members
- id (uuid): Primary key
- first_name (text): Member's first name
- last_name (text): Member's last name
- gender (text): 'male' or 'female'
- phone (text): Phone number
- phone_country (text): Country code
- place_of_stay (text): Location/area
- house_number (text): House number
- member_position (text): 'elder', 'deacon', 'member'
- address_comments (text): Additional address info
- member_group (text): 'mens_fellowship', 'womens_fellowship', 'youth_fellowship'
- occupation_type (text): 'health', 'business', 'construction', 'student', 'fashion', 'others'
- role_comments (text): Role notes
- email (text): Email address
- avatar_url (text): Profile image URL
- membership_id (text): Unique membership ID
- nickname (text): Member nickname
- gps_lat (numeric): GPS latitude
- gps_lng (numeric): GPS longitude
- created_by (uuid): Admin who created
- created_at (timestamp): Registration date
- deleted_at (timestamp): Soft delete timestamp

### member_payments
- id (uuid): Primary key
- member_id (uuid): References members
- year (integer): Payment year
- month (integer): Payment month (1-12)
- amount (numeric): Payment amount
- status (text): 'paid' or 'unpaid'
- paid_at (timestamp): When paid
- notes (text): Payment notes
- created_by (uuid): Admin who recorded

### tasks
- id (uuid): Primary key
- slug (text): URL-friendly name
- name (text): Task name
- purpose (text): 'payments', 'monitoring', 'roles', 'groups', 'records', 'other'
- description (text): Task description
- start_date (timestamp): Start date
- end_date (timestamp): End date
- has_duration (boolean): Has duration tracking
- duration_type (text): 'weekly', 'monthly', 'quarterly', 'custom'
- status (text): 'active', 'completed', 'expired', 'archived'
- completion_rate (integer): 0-100
- created_by (uuid): Admin who created
- created_at (timestamp): Creation date
- updated_at (timestamp): Last update
- completed_at (timestamp): Completion date

### task_members
- id (uuid): Primary key
- task_id (uuid): References tasks
- member_id (uuid): References members
- progress (integer): 0-100 progress
- status (text): 'pending', 'in_progress', 'completed'
- assigned_at (timestamp): Assignment date
- completed_at (timestamp): Completion date

### task_activities
- id (uuid): Primary key
- task_id (uuid): References tasks
- member_id (uuid): References members
- activity_type (text): 'payment', 'record', 'role', 'group', 'monitor', 'other'
- title (text): Activity title
- description (text): Activity description
- amount (numeric): Amount (for payments)
- created_by (uuid): Admin who created
- created_at (timestamp): Creation date

### branches
- id (uuid): Primary key
- slug (text): URL-friendly name
- name (text): Branch name
- location (text): Location
- address (text): Full address
- gps_lat (numeric): GPS latitude
- gps_lng (numeric): GPS longitude
- membership_size (integer): Member count
- helpline (text): Contact number
- year_established (integer): Year founded
- leader_position (text): 'pastor_rev', 'elder', 'deacon', 'deaconess', 'member'
- leader_full_name (text): Leader's full name
- leader_contact (text): Leader's phone
- leader_email (text): Leader's email
- leader_avatar_url (text): Leader's photo
- created_by (uuid): Admin who created
- created_at (timestamp): Creation date

### workflows
- id (uuid): Primary key
- slug (text): URL-friendly name
- name (text): Workflow name
- type (text): 'records', 'payments', 'roles', 'monitor'
- start_date (timestamp): Start date
- end_date (timestamp): End date
- created_by (uuid): Admin who created
- created_at (timestamp): Creation date

### workflow_entries
- id (uuid): Primary key
- workflow_id (uuid): References workflows
- member_id (uuid): References members
- title (text): Entry title
- description (text): Entry description
- amount (numeric): Amount
- entry_type (text): 'record', 'payment', 'role', 'monitor'
- status (text): 'pending', 'completed', 'cancelled'
- created_by (uuid): Admin who created
- created_at (timestamp): Creation date

### sms_messages
- id (uuid): Primary key
- sender_id (uuid): Admin who sent
- subject (text): Message subject
- message (text): Message content
- recipient_type (text): 'all', 'group', 'individual', 'filtered'
- recipient_group (text): 'mens_fellowship', 'womens_fellowship', 'youth_fellowship'
- recipient_ids (uuid[]): Specific member IDs
- status (text): 'pending', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'
- scheduled_for (timestamp): Schedule time
- sent_at (timestamp): When sent
- total_recipients (integer): Total recipients
- delivered_count (integer): Delivered count
- failed_count (integer): Failed count
- created_at (timestamp): Creation date

### sms_templates
- id (uuid): Primary key
- name (text): Template name
- subject (text): Template subject
- message (text): Template content
- category (text): 'welcome', 'payment_reminder', 'event', 'general', 'custom'
- created_by (uuid): Admin who created
- created_at (timestamp): Creation date
- is_shared (boolean): Shared across admins

### sms_delivery_logs
- id (uuid): Primary key
- message_id (uuid): References sms_messages
- member_id (uuid): References members
- phone (text): Recipient phone
- status (text): 'pending', 'sent', 'delivered', 'failed', 'read'
- provider_response (text): Provider response
- sent_at (timestamp): When sent
- delivered_at (timestamp): When delivered
- error_message (text): Error message

### profiles
- id (uuid): Primary key (references auth.users)
- first_name (text): Admin first name
- last_name (text): Admin last name
- email (text): Admin email
- role (text): 'admin', 'member'
- avatar_url (text): Admin avatar
- onboarding_completed (boolean): Onboarding status
- created_at (timestamp): Creation date

### audit_logs
- id (uuid): Primary key
- user_id (uuid): User who performed action
- action (text): Action performed
- entity (text): Entity type
- entity_id (uuid): Entity ID
- metadata (jsonb): Additional data
- created_at (timestamp): Creation date
`;

export const QUERY_EXAMPLES = `
## Example Queries and Expected Responses

### Member Queries
Q: "How many members do we have?"
A: Query the members table for active members (deleted_at is null) and return count.

Q: "Show me all members from Santasi"
A: Query members where place_of_stay ILIKE '%Santasi%' and return the list.

Q: "Who are the elders in the church?"
A: Query members where member_position = 'elder' and return the list.

Q: "Find members who joined this month"
A: Query members where created_at is in the current month.

### Payment Queries
Q: "How many members have paid this month?"
A: Query member_payments where month = current month and status = 'paid', count distinct member_id.

Q: "Show me payment trends for this year"
A: Query member_payments for current year, group by month, sum amounts.

Q: "Who hasn't paid for 3 months?"
A: Query members who don't have paid status in the last 3 months.

Q: "What's the total payment collected this year?"
A: Sum amount from member_payments where year = current year and status = 'paid'.

### Task Queries
Q: "What tasks are overdue?"
A: Query tasks where end_date < current_date and status != 'completed'.

Q: "Show me all active tasks"
A: Query tasks where status = 'active' and return the list.

Q: "How many tasks are completed?"
A: Count tasks where status = 'completed'.

### Analytics Queries
Q: "Give me a summary of this month's activities"
A: Provide counts of new members, payments, tasks, and activities.

Q: "Show me member growth trends"
A: Query members grouped by month for the last 12 months.

Q: "What's the payment compliance rate?"
A: Calculate (paid members / total members) * 100 for current month.

### Search Queries
Q: "Find John's membership ID"
A: Search members where first_name ILIKE '%John%' or last_name ILIKE '%John%'.

Q: "Search for member with phone number 024"
A: Search members where phone ILIKE '%024%'.
`;