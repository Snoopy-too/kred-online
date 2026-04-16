<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';

$id = $_GET['id'] ?? '';
if ($id === '') { http_response_code(400); exit('Missing id'); }

$session = diag_get_session($id);
if ($session === null) { http_response_code(404); exit('Session not found'); }

$events = diag_list_events($id);

$payload = [
    'exported_at' => gmdate('c'),
    'ordering_note' => 'sequence_num is per-client monotonic. Cross-player order uses received_at as tiebreaker. Clocks may skew between players.',
    'session' => $session,
    'events' => $events,
];

$pin = preg_replace('/[^A-Z0-9]/', '', strtoupper($session['pin']));
$date = gmdate('Ymd', strtotime($session['started_at']));
$filename = "kred-diag-{$pin}-{$date}.json";

header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
