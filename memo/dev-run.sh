#!/usr/bin/env bash
# Development launcher for the Spring Boot application.
# Features:
#  - Ensures only one instance binds the target port (default 8080)
#  - Cleans up any previous Spring Boot process listening on that port
#  - Uses dev profile (templates cache disabled) unless overridden
#  - Supports optional PID file usage if configured (spring.pid.file=app.pid)
#  - start/stop/status/restart subcommands
#  - Optional daemon mode (background) with log redirection
#  - Safe, idempotent; no effect if nothing is running
#
# Environment variables (override by exporting before running):
#  PORT=8080                # Port to enforce single instance for
#  SPRING_PROFILE=dev       # Spring profile to activate
#  JAR_MODE=0               # If set to 1, run the built jar instead of mvn spring-boot:run
#  MVN_OPTS=                # Extra Maven options (e.g. -T1C)
#  DAEMON=0                 # 1 => background (only for start/restart)
#  LOG_DIR=logs             # Directory for logs when daemonized
#  OUT_LOG=app.out          # Stdout log file name (daemon)
#  ERR_LOG=app.err          # Stderr log file name (daemon)
#
# Usage (foreground one-shot legacy mode still works):
#   ./dev-run.sh            # same as 'start' in foreground (no daemon)
#
# Subcommands:
#   ./dev-run.sh start      # start (foreground unless DAEMON=1)
#   DAEMON=1 ./dev-run.sh start
#   ./dev-run.sh stop       # stop running instance if any
#   ./dev-run.sh status     # show status & port & PID
#   ./dev-run.sh restart    # stop then start
#
# Examples:
#   PORT=8090 ./dev-run.sh start
#   DAEMON=1 SPRING_PROFILE=dev ./dev-run.sh start
#   JAR_MODE=1 DAEMON=1 ./dev-run.sh restart
#
# Notes:
#  - Intended for local development only; do not use in production.
#  - Requires lsof (most Linux distros have it). If missing: sudo apt install lsof
#  - PID detection prefers pid file; falls back to port scan.

set -euo pipefail

PORT="${PORT:-8080}"
SPRING_PROFILE="${SPRING_PROFILE:-dev}"
JAR_MODE="${JAR_MODE:-0}"
DAEMON="${DAEMON:-0}"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="${PROJECT_ROOT}/app.pid"
LOG_DIR="${LOG_DIR:-logs}"
OUT_LOG="${OUT_LOG:-app.out}"
ERR_LOG="${ERR_LOG:-app.err}"

log() { printf '[dev-run] %s\n' "$*"; }
warn() { printf '[dev-run][WARN] %s\n' "$*" >&2; }

running_pid() {
  # priority: pid file
  if [ -f "${PID_FILE}" ]; then
    local pf
    pf=$(cat "${PID_FILE}" 2>/dev/null || true)
    if [ -n "${pf}" ] && kill -0 "${pf}" 2>/dev/null; then
      echo "${pf}"
      return 0
    fi
  fi
  # fallback: port listener
  local lp
  lp=$(detect_pids_on_port | head -n1 || true)
  if [ -n "${lp}" ]; then
    echo "${lp}"
    return 0
  fi
  return 1
}

detect_pids_on_port() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true
  else
    warn "lsof not found; skipping port scan"
    echo ""
  fi
}

stop_pid_file() {
  if [ -f "${PID_FILE}" ]; then
    local pid
    pid=$(cat "${PID_FILE}" 2>/dev/null || true)
    if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
      log "Stopping PID from pid file: ${pid}"
      kill "${pid}" || true
      wait_for_exit "${pid}" 5 || warn "PID ${pid} did not exit in time (pid file)."
    else
      log "PID file exists but process not running: ${PID_FILE}"
    fi
  fi
}

wait_for_exit() {
  local pid=$1
  local timeout=$2
  local i
  for i in $(seq 1 "${timeout}"); do
    if kill -0 "${pid}" 2>/dev/null; then
      sleep 1
    else
      return 0
    fi
  done
  return 1
}

stop_port_listeners() {
  local pids
  pids=$(detect_pids_on_port)
  if [ -n "${pids}" ]; then
    log "Port ${PORT} in use by: ${pids}"
    log "Sending TERM..."
    kill ${pids} || true
    local pid
    for pid in ${pids}; do
      if ! wait_for_exit "${pid}" 5; then
        warn "Force killing ${pid}"
        kill -9 "${pid}" || true
      fi
    done
  else
    log "No existing process on port ${PORT}" 
  fi
}

start_foreground() {
  log "Preparing to start on port ${PORT} with profile=${SPRING_PROFILE} (JAR_MODE=${JAR_MODE})"
  stop_pid_file
  stop_port_listeners
  [ -f "${PID_FILE}" ] && rm -f "${PID_FILE}" || true
  if [ "${JAR_MODE}" = "1" ]; then
    local jar
    jar=$(ls -1 "${PROJECT_ROOT}"/target/memo-*.jar 2>/dev/null | head -n1 || true)
    if [ -z "${jar}" ]; then
      log "Jar not found. Building..."
      (cd "${PROJECT_ROOT}" && mvn -q -DskipTests package)
      jar=$(ls -1 "${PROJECT_ROOT}"/target/memo-*.jar 2>/dev/null | head -n1 || true)
    fi
    if [ -z "${jar}" ]; then
      warn "Unable to locate jar after build. Aborting."
      exit 1
    fi
    log "Starting jar: ${jar}"
    exec java -jar "${jar}" --spring.profiles.active="${SPRING_PROFILE}" -Dserver.port="${PORT}"
  else
    log "Starting via Maven spring-boot:run"
    exec mvn ${MVN_OPTS:-} spring-boot:run -Dspring-boot.run.profiles="${SPRING_PROFILE}" \
      -Dspring-boot.run.jvmArguments="-Dserver.port=${PORT}"
  fi
}

start_daemon() {
  mkdir -p "${LOG_DIR}"
  log "(daemon) starting... logs: ${LOG_DIR}/${OUT_LOG}, ${LOG_DIR}/${ERR_LOG}"
  # shellcheck disable=SC2086
  if [ "${JAR_MODE}" = "1" ]; then
    local jar
    jar=$(ls -1 "${PROJECT_ROOT}"/target/memo-*.jar 2>/dev/null | head -n1 || true)
    if [ -z "${jar}" ]; then
      log "Jar not found. Building..."
      (cd "${PROJECT_ROOT}" && mvn -q -DskipTests package)
      jar=$(ls -1 "${PROJECT_ROOT}"/target/memo-*.jar 2>/dev/null | head -n1 || true)
    fi
    nohup java -jar "${jar}" --spring.profiles.active="${SPRING_PROFILE}" -Dserver.port="${PORT}" \
      >"${LOG_DIR}/${OUT_LOG}" 2>"${LOG_DIR}/${ERR_LOG}" &
  else
    nohup mvn ${MVN_OPTS:-} spring-boot:run -Dspring-boot.run.profiles="${SPRING_PROFILE}" \
      -Dspring-boot.run.jvmArguments="-Dserver.port=${PORT}" \
      >"${LOG_DIR}/${OUT_LOG}" 2>"${LOG_DIR}/${ERR_LOG}" &
  fi
  echo $! > "${PID_FILE}"
  sleep 1
  if kill -0 $(cat "${PID_FILE}") 2>/dev/null; then
    log "Started (PID $(cat "${PID_FILE}"))"
  else
    warn "Failed to start process; see logs."
    return 1
  fi
}

cmd_start() {
  if running_pid >/dev/null; then
    log "Already running (PID $(running_pid)). Use restart if needed."
    return 0
  fi
  if [ "${DAEMON}" = "1" ]; then
    stop_pid_file; stop_port_listeners; start_daemon
  else
    start_foreground
  fi
}

cmd_stop() {
  local pid
  if pid=$(running_pid); then
    log "Stopping PID ${pid}"
    kill "${pid}" || true
    if ! wait_for_exit "${pid}" 7; then
      warn "Force killing ${pid}"
      kill -9 "${pid}" || true
    fi
    [ -f "${PID_FILE}" ] && rm -f "${PID_FILE}" || true
    log "Stopped"
  else
    log "Not running"
  fi
}

cmd_status() {
  local pid
  if pid=$(running_pid); then
    echo "RUNNING pid=${pid} port=${PORT} profile=${SPRING_PROFILE}"
  else
    echo "STOPPED"
  fi
}

cmd_restart() {
  cmd_stop
  cmd_start
}

usage() {
  cat <<EOF
Usage: $0 [start|stop|status|restart]
Environment vars:
  PORT SPRING_PROFILE JAR_MODE DAEMON LOG_DIR OUT_LOG ERR_LOG MVN_OPTS
Examples:
  $0 start
  DAEMON=1 $0 start
  JAR_MODE=1 PORT=8090 DAEMON=1 $0 restart
EOF
}

main() {
  local subcmd=${1:-start}
  case "${subcmd}" in
    start) shift || true; cmd_start "$@" ;;
    stop) cmd_stop ;;
    status) cmd_status ;;
    restart) cmd_restart ;;
    -h|--help|help) usage ;;
    *) warn "Unknown subcommand: ${subcmd}"; usage; exit 1 ;;
  esac
}

main "$@"
