const axios = require("axios");
const fs = require('fs');

let token = "";
try {
  const envFile = fs.readFileSync('../.env', 'utf8');
  const lines = envFile.split('\n');
  for(let i=0; i<lines.length; i++) {
    if(lines[i].startsWith('TOKEN=')) token = lines[i].split('=')[1].trim();
  }
} catch(e) {}

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

const VALID_STACKS = ["backend", "frontend"];

const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];

const BACKEND_PACKAGES = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service"
];

const FRONTEND_PACKAGES = [
  "api", "component", "hook", "page", "state", "style"
];

const SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];

function getValidPackages(stack) {
  if (stack === "backend") {
    return [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
  }
  if (stack === "frontend") {
    return [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
  }
  return SHARED_PACKAGES;
}

function validate(stack, level, pkg) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack: "${stack}". Must be one of: ${VALID_STACKS.join(", ")}`);
  }

  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level: "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`);
  }

  const allowed = getValidPackages(stack);
  if (!allowed.includes(pkg)) {
    throw new Error(`Invalid package: "${pkg}" for stack "${stack}". Must be one of: ${allowed.join(", ")}`);
  }
}

async function Log(stack, level, pkg, message) {
  stack = String(stack).toLowerCase();
  level = String(level).toLowerCase();
  pkg = String(pkg).toLowerCase();

  validate(stack, level, pkg);

  const body = {
    stack: stack,
    level: level,
    package: pkg,
    message: message
  };

  try {
    const response = await axios.post(LOG_API_URL, body, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      timeout: 5000
    });
    return response.data;
  } catch (err) {
    const detail = err.response ? err.response.data : err.message;
    console.error("Logging failed:", detail);
    return null;
  }
}

module.exports = { Log };
