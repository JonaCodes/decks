import pino from 'pino';

// In dev: set this to filter logs by message substring. Empty string = show all.
const DEV_LOG_FILTER = '';

const isDev = process.env.NODE_ENV === 'development';

const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isDev && DEV_LOG_FILTER ? 'trace' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined, // raw JSON in prod
});

const logger: pino.Logger =
  isDev && DEV_LOG_FILTER
    ? new Proxy(baseLogger, {
        get(target, prop) {
          const value = (target as any)[prop];
          if (
            typeof value === 'function' &&
            ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(
              prop as string
            )
          ) {
            return (msgOrObj: unknown, ...args: unknown[]) => {
              const msg =
                typeof msgOrObj === 'string' ? msgOrObj : (args[0] as string);
              if (typeof msg === 'string' && msg.includes(DEV_LOG_FILTER)) {
                return value.call(target, msgOrObj, ...args);
              }
            };
          }
          return value;
        },
      })
    : baseLogger;

export default logger;
