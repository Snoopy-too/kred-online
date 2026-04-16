<?php
function diag_html_header(string $title): void {
    ?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($title) ?> — KRED Diagnostics</title>
  <link rel="stylesheet" href="/kred/diagnostics/assets/styles.css">
</head>
<body>
  <header class="diag-header">
    <h1>KRED Diagnostics</h1>
    <nav><a href="/kred/diagnostics/index.php">Sessions</a></nav>
  </header>
  <main>
<?php
}

function diag_html_footer(): void {
    ?>
  </main>
  <script src="/kred/diagnostics/assets/app.js" defer></script>
</body>
</html>
<?php
}

function diag_escape($v): string {
    if (is_array($v) || is_object($v)) return htmlspecialchars(json_encode($v, JSON_UNESCAPED_SLASHES), ENT_QUOTES);
    return htmlspecialchars((string)$v, ENT_QUOTES);
}
