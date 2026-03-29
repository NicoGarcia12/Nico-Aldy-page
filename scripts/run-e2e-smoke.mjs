import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const SERVER_URL = "http://localhost:4200";
const SERVER_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 1_000;

const runCommand = (command, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: "inherit",
      ...options,
    });

    child.once("error", reject);
    child.once("close", (code, signal) => {
      resolve({ code, signal });
    });
  });

const isServerReachable = async () => {
  try {
    const response = await fetch(SERVER_URL);
    return response.ok;
  } catch {
    return false;
  }
};

const waitForServer = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SERVER_TIMEOUT_MS) {
    if (await isServerReachable()) {
      return;
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(`Timeout esperando ${SERVER_URL} en ${SERVER_TIMEOUT_MS}ms`);
};

const stopServer = async (serverProcess) => {
  if (!serverProcess || serverProcess.exitCode !== null || !serverProcess.pid) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill",
        ["/PID", String(serverProcess.pid), "/T", "/F"],
        {
          stdio: "inherit",
        },
      );
      killer.once("close", () => resolve());
      killer.once("error", () => resolve());
    });
    return;
  }

  serverProcess.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => serverProcess.once("close", () => resolve())),
    delay(5_000),
  ]);

  if (serverProcess.exitCode === null) {
    serverProcess.kill("SIGKILL");
  }
};

let serverProcess;
let serverStartedByScript = false;

let stopping = false;

const shutdown = async (code = 0) => {
  if (stopping) {
    return;
  }
  stopping = true;
  if (serverStartedByScript) {
    await stopServer(serverProcess);
  }
  process.exit(code);
};

process.on("SIGINT", () => {
  void shutdown(130);
});

process.on("SIGTERM", () => {
  void shutdown(143);
});

try {
  if (!(await isServerReachable())) {
    serverProcess = spawn("npm run start", {
      shell: true,
      stdio: "inherit",
    });
    serverStartedByScript = true;

    serverProcess.once("error", (error) => {
      throw error;
    });

    await waitForServer();
  }

  const result = await runCommand(
    "npm run cypress:run -- --spec cypress/e2e/login-flow.cy.js --browser electron",
  );

  await shutdown(result.code ?? 1);
} catch (error) {
  console.error(error);
  await shutdown(1);
}
