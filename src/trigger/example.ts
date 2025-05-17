import { paymentRepository } from "@/server/repository/payment.repository";
import { logger, schedules, wait, } from "@trigger.dev/sdk/v3";
import { client } from "./client";
import axios from "axios";

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
    const distanceInMs =
      payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    logger.log("Verify payment task", { payload, distanceInMs });

    await wait.for({ seconds: 5 });

    const formatted = payload.timestamp.toLocaleString("en-US", {
      timeZone: payload.timezone,
    });

    const paymentId = payload.externalId;
    if (!paymentId) {
      logger.error("Payment ID (externalId) is missing from payload", { payload });
      return;
    }
    const payment = await paymentRepository.getPaymentById(paymentId);

    const canviPayment = await axios.post(
      `${process.env.NEXTAUTH_URL}/api/payment/pix/dynamic/consult`,
      {
        id_invoice_pix: payment?.id_invoice_pix,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }

    ).catch((error) => {
      logger.error("refund not work", { error: error?.response?.data || error.message });
    });
    console.log("Payment Trigger:", payment);

    if (!payment?.id_invoice_pix || !payment?.purchase?.id) {
      logger.error("Dados do pagamento incompletos para refund", { payment });
      return;
    }

    if (canviPayment?.data?.status !== payment?.status) {
      await axios.post(
        `${process.env.NEXTAUTH_URL}/api/payment/pix/dynamic/update`, {
        paymentId: payment.id,
        status: canviPayment?.data?.status,
        purchaseId: payment?.purchase?.id,
      },
        {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(async (res) => {
          logger.log("update payment", { res: res.data });
        })

        .catch((error) => {
          logger.error("update does not work", { error: error?.response?.data || error.message });
        });
    }


    return;
  }
  // if (payment?.status !== "credited") {
  //   logger.error("Payment not found", { paymentId });
  //   await fetch(`${process.env.NEXTAUTH_URL}/api/payment/pix/dynamic/refund`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       id_invoice_pix: `${payment?.id_invoice_pix}`,
  //       identificador_externo: payment?.purchase?.id,
  //       descricao: "Devolução de teste",
  //       texto_instrucao: "Instrução..."
  //     }),
  //   }).then(async (res) => {
  //     if (!res.ok) {
  //       const error = await res.text();
  //       logger.error("refund not work", { error });
  //     }
  //   }).catch((error) => {
  //     logger.error("refund not work", { error });
  //   });


  //       return;
  // }

  //     logger.log(formatted);
  //   },
});

export const helloWorldTask = schedules.task({
  id: "hello-world-task",
  cron: "0 * * * *",
  maxDuration: 300,
  run: async (payload, { ctx
  }) => {
    logger.log("Hello world task", { payload });
    await wait.for({ seconds: 5 });
    const formatted = new Date().toLocaleString("en-US", {
      timeZone: "America/Manaus",
    });
    logger.log(formatted);
  }
});
// if (payment?.status !== "credited") {