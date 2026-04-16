<?php
function diag_config(): array {
    static $cfg = null;
    if ($cfg === null) {
        $path = __DIR__ . '/../config.php';
        if (!file_exists($path)) {
            http_response_code(500);
            exit('Missing /diagnostics/config.php — see docs/diagnostics-setup.md');
        }
        $cfg = require $path;
    }
    return $cfg;
}

function diag_supabase_request(string $method, string $path, ?array $body = null, array $extraHeaders = []): array {
    $cfg = diag_config();
    $url = rtrim($cfg['SUPABASE_URL'], '/') . '/rest/v1' . $path;
    $headers = array_merge([
        'apikey: ' . $cfg['SERVICE_ROLE_KEY'],
        'Authorization: Bearer ' . $cfg['SERVICE_ROLE_KEY'],
        'Content-Type: application/json',
        'Prefer: return=representation',
    ], $extraHeaders);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new RuntimeException("Supabase request failed: $err");
    }
    $decoded = json_decode($raw ?: 'null', true);
    if ($code >= 400) {
        throw new RuntimeException("Supabase $code: " . ($raw ?: '(empty)'));
    }
    return is_array($decoded) ? $decoded : [];
}

function diag_list_sessions(): array {
    return diag_supabase_request('GET', '/kred_diagnostic_sessions?select=*&order=started_at.desc');
}

function diag_get_session(string $id): ?array {
    $rows = diag_supabase_request('GET', '/kred_diagnostic_sessions?id=eq.' . urlencode($id) . '&select=*');
    return $rows[0] ?? null;
}

function diag_list_events(string $sessionId): array {
    return diag_supabase_request(
        'GET',
        '/kred_diagnostic_events?session_id=eq.' . urlencode($sessionId) . '&select=*&order=sequence_num.asc,received_at.asc'
    );
}

function diag_delete_events_before(string $iso): int {
    $rows = diag_supabase_request('DELETE', '/kred_diagnostic_events?occurred_at=lt.' . urlencode($iso));
    return count($rows);
}

function diag_delete_sessions_before(string $iso): int {
    $rows = diag_supabase_request('DELETE', '/kred_diagnostic_sessions?started_at=lt.' . urlencode($iso));
    return count($rows);
}

function diag_delete_all(): void {
    // Delete events first (explicit, even though CASCADE would cover it)
    diag_supabase_request('DELETE', '/kred_diagnostic_events?id=gte.1');
    diag_supabase_request('DELETE', '/kred_diagnostic_sessions?id=neq.00000000-0000-0000-0000-000000000000');
}

function diag_meta_get(string $key): ?array {
    $rows = diag_supabase_request('GET', '/kred_diagnostic_meta?key=eq.' . urlencode($key) . '&select=*');
    return $rows[0] ?? null;
}

function diag_meta_set(string $key, array $value): void {
    diag_supabase_request(
        'POST',
        '/kred_diagnostic_meta',
        [['key' => $key, 'value' => $value, 'updated_at' => gmdate('c')]],
        ['Prefer: resolution=merge-duplicates']
    );
}
