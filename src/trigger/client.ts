import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
    id: "trigger-client",
    apiKey: process.env.TRIGGER_API_KEY, // coloque essa variável no .env
    apiUrl: "https://api.trigger.dev",
});
