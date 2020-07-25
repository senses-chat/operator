export default {
  port: Number(process.env.PORT || 3000),
  gracefulShutdownTimeout: Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || 0),
};
