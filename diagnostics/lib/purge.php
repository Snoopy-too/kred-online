<?php
require_once __DIR__ . '/supabase.php';

function diag_maybe_purge(): array {
    $now = time();
    $lastRow = diag_meta_get('last_purge_at');
    $last = null;
    if ($lastRow && isset($lastRow['value']['at'])) {
        $last = strtotime($lastRow['value']['at']);
    }
    $stale = $last === null || ($now - $last) > 86400; // 24h
    if (!$stale) {
        return ['ran' => false];
    }
    $cutoff = gmdate('c', $now - 7 * 86400);
    $deletedEvents = 0;
    $deletedSessions = 0;
    try {
        $deletedEvents = diag_delete_events_before($cutoff);
        $deletedSessions = diag_delete_sessions_before($cutoff);
    } catch (Throwable $e) {
        error_log('[diagnostics] purge failed: ' . $e->getMessage());
        return ['ran' => false, 'error' => $e->getMessage()];
    }
    diag_meta_set('last_purge_at', ['at' => gmdate('c', $now)]);
    return ['ran' => true, 'events' => $deletedEvents, 'sessions' => $deletedSessions, 'cutoff' => $cutoff];
}
