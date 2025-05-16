import { paymentRepository } from "@/server/repository/payment.repository";
import { logger, schedules, wait, } from "@trigger.dev/sdk/v3";
import { client } from "./client";

export const firstScheduledTask = schedules.task({
  id: "first-scheduled-task",
  // Every hour
  cron: "0 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run
    const distanceInMs =
      payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("First scheduled tasks", { payload, distanceInMs });

    // Wait for 5 seconds
    await wait.for({ seconds: 5 });

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    logger.log(formatted);
  },
});

export const verifyPaymentTask = schedules.task({
  id: "verify-payment-task",
  // Every hour
  cron: "0 * * * *",
  maxDuration: 300,
  run: async (
    payload: {
      type: "DECLARATIVE" | "IMPERATIVE";
      timestamp: Date;
      timezone: string;
      scheduleId: string;
      upcoming: Date[];
      lastTimestamp?: Date;
      externalId?: string;
    },
    { ctx }
  ) => {
    console.log("Payload:", payload);

    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run
    const distanceInMs =
      payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("Verify payment task", { payload, distanceInMs });

    // Wait for 5 seconds
    await wait.for({ seconds: 5 });

    // Format the timestamp using the timezone from the payload
    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    // Use externalId as paymentId if available
    const paymentId = payload.externalId;
    if (!paymentId) {
      logger.error("Payment ID (externalId) is missing from payload", { payload });
      return;
    }
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (payment?.status !== "credited") {
      logger.error("Payment not found", { paymentId });
      return;
    }

    logger.log(formatted);
  },
});