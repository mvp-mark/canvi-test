/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  allowedDevOrigins: ["59e4-179-183-238-89.ngrok-free.app"],
};

export default config;
