<?php
// Localhost-only guardrail. Reject any request not from 127.0.0.1 or ::1.
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($ip, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Diagnostics tool is local-only. Your IP: {$ip}");
}
