<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('POST required');
}

try {
    diag_delete_all();
} catch (Throwable $e) {
    http_response_code(500);
    exit('Delete failed: ' . htmlspecialchars($e->getMessage()));
}

header('Location: /kred/diagnostics/index.php');
