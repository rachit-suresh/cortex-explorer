// CLI Logger utility - writes to terminal/CLI instead of browser console

class CLILogger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Send log to backend/CLI if in development mode
   * Falls back to console in production or if backend unavailable
   */
  private async sendToServer(level: string, ...args: any[]) {
    if (!this.isDevelopment) {
      // In production, still use console
      const consoleMethod = (console as any)[level];
      if (typeof consoleMethod === "function") {
        consoleMethod.apply(console, args);
      }
      return;
    }

    try {
      // Try to send to backend server (if running)
      const response = await fetch("http://localhost:3001/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message: args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" "),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Server logging failed");
      }
    } catch (error) {
      // Fallback to console if server unavailable
      const consoleMethod = (console as any)[level];
      if (typeof consoleMethod === "function") {
        consoleMethod.apply(console, args);
      }
    }
  }

  log(...args: any[]) {
    this.sendToServer("log", ...args);
  }

  info(...args: any[]) {
    this.sendToServer("info", ...args);
  }

  warn(...args: any[]) {
    this.sendToServer("warn", ...args);
  }

  error(...args: any[]) {
    this.sendToServer("error", ...args);
  }
}

// Export singleton instance
export const logger = new CLILogger();

// For convenience, also export as default
export default logger;
