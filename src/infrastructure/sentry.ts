import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { config } from "../config";

export const initializeSentry = () => {
  const dsn = config.sentry.dns;

  if (!dsn) {
    console.warn(
      "⚠️  SENTRY_DSN not configured. Sentry will not be initialized."
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: config.env,
    integrations: [nodeProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  console.log("✅ Sentry initialized successfully");
};

export { Sentry };
