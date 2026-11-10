#!/usr/bin/env bash
# Run the test suites of the Lynchpin project.
#   ./scripts/run_tests.sh          both suites
#   ./scripts/run_tests.sh maxima   the proof chain behind the paper (tests/test-*.mac)
#   ./scripts/run_tests.sh node     the geometry module behind the model (tests/*.test.mjs)
# Exit status is non-zero if any test fails.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUITE="${1:-all}"
case "$SUITE" in all|maxima|node) ;; *) echo "usage: $0 [all|maxima|node]" >&2; exit 2 ;; esac
if [ "$SUITE" != node ]; then
  LOG="$(mktemp)"
  maxima --very-quiet --batch-string="lp_root:\"$ROOT\"\$ batchload(\"$ROOT/tests/run-all.mac\")\$" 2>&1 \
    | grep -v -E 'help system|CL-INFO' | tee "$LOG" \
    | grep -E '^---|PASS|FAIL|LYNCHPIN_TESTS|Failed|error' || true
  if ! grep -q 'LYNCHPIN_TESTS passed=[1-9][0-9]* failed=0' "$LOG"; then
    # Show the end of the full Maxima output, which holds the error message.
    echo "Maxima suite failed. Last lines of its output follow." >&2
    tail -n 15 "$LOG" >&2
    exit 1
  fi
fi
if [ "$SUITE" != maxima ]; then
  node --test "$ROOT"/tests/*.test.mjs
fi
