# Diagnostics Tool — Local Setup

The diagnostics tool is a local-only PHP web UI that reads verbose event logs
from Supabase for debugging online KRED sessions. Because it uses the Supabase
service-role key, the entire `/diagnostics/` folder is gitignored and must be
set up on each machine that runs it.

## Prerequisites

- XAMPP running locally (serves PHP at `http://localhost/kred/`).
- Access to the KRED Supabase project dashboard.
- Diagnostics SQL migration already applied (see
  `supabase/migrations/2026-04-16-diagnostics.sql`).

## Setup

1. Create the folder structure under the project root:

   ```
   diagnostics/
   ├── index.php
   ├── session.php
   ├── export.php
   ├── delete.php
   ├── config.php
   ├── lib/
   │   ├── supabase.php
   │   ├── purge.php
   │   ├── guard.php
   │   └── render.php
   └── assets/
       ├── styles.css
       └── app.js
   ```

   The PHP/JS/CSS files are created by the implementation tasks. This step is
   only about `config.php`, which you must create by hand.

2. Create `/diagnostics/config.php` with:

   ```php
   <?php
   return [
       'SUPABASE_URL' => 'https://<project-ref>.supabase.co',
       'SERVICE_ROLE_KEY' => '<paste the service_role key here>',
   ];
   ```

3. Find the service-role key: Supabase dashboard → Project Settings → API →
   "Project API keys" → `service_role` (secret). This key bypasses Row Level
   Security. Never commit it. Never paste it in a public channel.

4. Open `http://localhost/kred/diagnostics/` — you should see the sessions list.
   If you see "403 — Diagnostics tool is local-only", you're not hitting it from
   `127.0.0.1`.

## Enabling logging in a game

In the lobby create screen, tick **"Enable diagnostic logging for this session"**
before clicking Create Game. All players in that lobby will log events. Other
players see a small "⚙ Diagnostics on" indicator.

## Retention

Events older than 7 days are deleted automatically the first time the tool's
index page is opened in any 24-hour window. You can also wipe everything with
the "Delete all logs" button.
