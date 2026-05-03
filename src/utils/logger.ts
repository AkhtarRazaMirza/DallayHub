type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  userId?: string;
  action?: string;
  details?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  /**
   * Format log entry as JSON for structured logging
   */
  private formatLog(entry: Omit<LogEntry, "timestamp">): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log authentication-related events
   */
  auth(action: string, userId?: string, details?: any) {
    const entry = {
      level: "info" as const,
      message: `[AUTH] ${action}`,
      action,
      ...(userId ? { userId } : {}),
      ...(details ? { details } : {}),
    };

    console.log(this.formatLog(entry));
  }

  /**
   * Log failed authentication attempts
   */
  authFailure(action: string, reason: string, email?: string, details?: any) {
    const entry = {
      level: "warn" as const,
      message: `[AUTH FAILURE] ${action}: ${reason}`,
      action,
      ...(email ? { userId: email } : {}),
      details: { reason, ...(details || {}) },
    };

    console.warn(this.formatLog(entry));
  }

  /**
   * Log token operations (refresh, generation)
   */
  token(action: string, userId: string, details?: any) {
    const entry = {
      level: "info" as const,
      message: `[TOKEN] ${action}`,
      action,
      userId,
      ...(details ? { details } : {}),
    };

    console.log(this.formatLog(entry));
  }

  /**
   * Log errors
   */
  error(message: string, error?: any, userId?: string) {
    const entry = {
      level: "error" as const,
      message: `[ERROR] ${message}`,
      ...(userId ? { userId } : {}),
      ...(error
        ? {
            details:
              error instanceof Error ? error.message : error,
          }
        : {}),
    };

    console.error(this.formatLog(entry));
  }

  /**
   * Log info messages
   */
  info(message: string, details?: any) {
    const entry = {
      level: "info" as const,
      message: `[INFO] ${message}`,
      ...(details ? { details } : {}),
    };

    console.log(this.formatLog(entry));
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, details?: any) {
    if (!this.isDevelopment) return;

    const entry = {
      level: "debug" as const,
      message: `[DEBUG] ${message}`,
      ...(details ? { details } : {}),
    };

    console.log(this.formatLog(entry));
  }
}

export const logger = new Logger();