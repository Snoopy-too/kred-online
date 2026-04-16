<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';
require_once __DIR__ . '/lib/render.php';

$id = $_GET['id'] ?? '';
if ($id === '') { http_response_code(400); exit('Missing id'); }

$session = diag_get_session($id);
if ($session === null) { http_response_code(404); exit('Session not found'); }

$events = diag_list_events($id);

diag_html_header('Session ' . $session['pin']);
?>
<a href="/kred/diagnostics/index.php" class="diag-btn ghost">&larr; Back to sessions</a>

<div class="diag-meta">
  <h2 style="margin:0 0 8px 0;">Session <code><?= diag_escape($session['pin']) ?></code></h2>
  <div>Started: <?= diag_escape($session['started_at']) ?></div>
  <div>Ended: <?= diag_escape($session['ended_at'] ?? '(in progress or host disconnected)') ?></div>
  <div>Last phase: <?= diag_escape($session['last_phase'] ?? '—') ?></div>
  <div>Players (<?= diag_escape($session['player_count']) ?>): <?= diag_escape($session['player_names']) ?></div>
  <div>Host: <?= diag_escape($session['host_name']) ?></div>
  <div style="margin-top:8px;">
    <a class="diag-btn" href="/kred/diagnostics/export.php?id=<?= urlencode($id) ?>">Export JSON</a>
  </div>
  <div style="color:#718096;font-size:12px;margin-top:8px;">
    Ordering: <code>sequence_num</code> is per-client monotonic; cross-player order uses <code>received_at</code> as tiebreaker.
    Client clocks may skew.
  </div>
</div>

<div class="diag-filters">
  <label>Player: <select id="filter-player"><option value="">All</option></select></label>
  <label>Phase: <select id="filter-phase"><option value="">All</option></select></label>
  <label>Category: <select id="filter-category"><option value="">All</option></select></label>
  <label>Search: <input type="text" id="filter-search" placeholder="event_type or payload..."></label>
  <span id="filter-count"></span>
</div>

<table class="diag-table" id="events-table">
  <thead>
    <tr>
      <th>Time</th>
      <th>Seq</th>
      <th>Player</th>
      <th>Phase</th>
      <th>Category</th>
      <th>Event</th>
      <th>Payload</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($events as $e):
      $occurred = isset($e['occurred_at']) ? substr($e['occurred_at'], 11, 12) : '';
    ?>
      <tr
        data-player="<?= diag_escape($e['player_name'] ?? '') ?>"
        data-phase="<?= diag_escape($e['phase'] ?? '') ?>"
        data-category="<?= diag_escape($e['category']) ?>"
        data-search="<?= diag_escape(strtolower($e['event_type'] . ' ' . json_encode($e['payload']))) ?>">
        <td><?= diag_escape($occurred) ?></td>
        <td><?= diag_escape($e['sequence_num']) ?></td>
        <td><?= diag_escape($e['player_name'] ?? '—') ?></td>
        <td><?= diag_escape($e['phase'] ?? '—') ?></td>
        <td><?= diag_escape($e['category']) ?></td>
        <td><?= diag_escape($e['event_type']) ?></td>
        <td class="diag-payload"><?= diag_escape(json_encode($e['payload'], JSON_UNESCAPED_SLASHES)) ?></td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php diag_html_footer(); ?>
