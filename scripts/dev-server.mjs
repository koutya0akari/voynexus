import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

function isPortFree(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();
    tester.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
      } else {
        reject(error);
      }
    });
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (port <= 65535) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) {
      return port;
    }
    port += 1;
  }
  throw new Error(`No open port found starting from ${startPort}`);
}

async function selectPort() {
  const requestedPort = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
  if (Number.isNaN(requestedPort) || requestedPort <= 0) {
    console.error(`[dev] Invalid PORT value: ${process.env.PORT}`);
    process.exit(1);
  }

  const userSpecifiedPort = Boolean(process.env.PORT);
  if (await isPortFree(requestedPort)) {
    return requestedPort;
  }

  if (userSpecifiedPort) {
    console.error(`[dev] Port ${requestedPort} is already in use. Free it or set PORT to another value.`);
    process.exit(1);
  }

  const fallback = await findAvailablePort(requestedPort + 1);
  console.warn(`[dev] Port ${requestedPort} busy. Falling back to ${fallback}. Set PORT to override.`);
  return fallback;
}

async function start() {
  const port = await selectPort();
  const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

  const devProcess = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) }
  });

  const handleSignal = (signal) => {
    if (!devProcess.killed) {
      devProcess.kill(signal);
    }
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);

  devProcess.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  devProcess.on("error", (error) => {
    console.error("[dev] Failed to start Next.js:", error);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error("[dev] Unexpected error while starting dev server:", error);
  process.exit(1);
});
