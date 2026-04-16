<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';
require_once __DIR__ . '/lib/purge.php';
require_once __DIR__ . '/lib/render.php';

$purgeResult = diag_maybe_purge();
$sessions = diag_list_sessions();

diag_html_header('Sessions');
?>
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
  <div>
    <strong><?= count($sessions) ?></strong> sessions (last 7 days)
    <?php if (!empty($purgeResult['ran'])): ?>
      <span style="color:#718096;font-size:12px;margin-left:12px;">
        Purged <?= (int)$purgeResult['events'] ?> events, <?= (int)$purgeResult['sessions'] ?> sessions older than 7 days
      </span>
    <?php endif; ?>
  </div>
  <form method="post" action="/kred/diagnostics/delete.php" onsubmit="return confirm('Delete ALL diagnostic sessions and events? This cannot be undone.');" style="margin:0;">
    <button type="submit" class="diag-btn danger">Delete all logs</button>
  </form>
</div>

<?php if (count($sessions) === 0): ?>
  <div class="diag-empty">
    No sessions recorded in the last 7 days.<br>
    <small>Enable diagnostic logging in the lobby setup to start capturing events.</small>
  </div>
<?php else: ?>
<table class="diag-table">
  <thead>
    <tr>
      <th>Started</th>
      <th>PIN</th>
      <th>Players</th>
      <th>Host</th>
      <th>Last Phase</th>
      <th>Events</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($sessions as $s): ?>
      <tr>
        <td><?= diag_escape($s['started_at']) ?></td>
        <td><code><?= diag_escape($s['pin']) ?></code></td>
        <td><?= diag_escape($s['player_count']) ?></td>
        <td><?= diag_escape($s['host_name']) ?></td>
        <td><?= diag_escape($s['last_phase'] ?? '—') ?></td>
        <td><?= diag_escape($s['event_count']) ?></td>
        <td>
          <a class="diag-btn" href="/kred/diagnostics/session.php?id=<?= urlencode($s['id']) ?>">View</a>
          <a class="diag-btn ghost" href="/kred/diagnostics/export.php?id=<?= urlencode($s['id']) ?>">JSON</a>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php endif; ?>
<?php diag_html_footer(); ?>
