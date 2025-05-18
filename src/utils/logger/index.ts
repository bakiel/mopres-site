/**
 * Logger utility for the Mopres admin system
 * Provides consistent logging for admin activities with different log levels
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  ADMIN = 'ADMIN', // Special level for admin actions
}

// Whether to enable logging to server console
const ENABLE_CONSOLE_LOGGING = true;

// Whether to store logs in localStorage for debugging
const ENABLE_LOCAL_STORAGE = true;

// Max number of logs to keep in localStorage
const MAX_LOCAL_LOGS = 100;

// Log colors for console output
const LOG_COLORS = {
  [LogLevel.DEBUG]: '#9CA3AF', // gray
  [LogLevel.INFO]: '#3B82F6',  // blue
  [LogLevel.WARN]: '#F59E0B',  // amber
  [LogLevel.ERROR]: '#EF4444', // red
  [LogLevel.ADMIN]: '#8B5CF6', // purple
};

// Log emojis for easy recognition
const LOG_EMOJIS = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌',
  [LogLevel.ADMIN]: '👑',
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

// Check if window is defined (client-side) or not (server-side)
const isClient = typeof window !== 'undefined';

/**
 * Main logger class
 */
class Logger {
  /**
   * Log a message with DEBUG level
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log a message with INFO level
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a message with WARN level
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log a message with ERROR level
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log admin-specific actions with ADMIN level
   */
  admin(message: string, data?: any): void {
    this.log(LogLevel.ADMIN, message, data);
  }

  /**
   * Main logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      data: data || undefined,
    };

    // Console logging
    if (ENABLE_CONSOLE_LOGGING) {
      this.consoleLog(logEntry);
    }

    // localStorage logging (client-side only)
    if (ENABLE_LOCAL_STORAGE && isClient) {
      this.storeLog(logEntry);
    }
  }

  /**
   * Output log to console with nice formatting
   */
  private consoleLog(entry: LogEntry): void {
    const { level, message, data, timestamp } = entry;
    const emoji = LOG_EMOJIS[level];
    const color = LOG_COLORS[level];
    const timeStr = timestamp.split('T')[1].split('.')[0];

    // Format: [EMOJI] [TIME] [LEVEL] Message
    const logMessage = `${emoji} [${timeStr}] [${level}] ${message}`;

    // Only use color formatting in client-side
    if (isClient) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`%c${logMessage}`, `color: ${color}`, data || '');
          break;
        case LogLevel.INFO:
          console.info(`%c${logMessage}`, `color: ${color}`, data || '');
          break;
        case LogLevel.WARN:
          console.warn(`%c${logMessage}`, `color: ${color}`, data || '');
          break;
        case LogLevel.ERROR:
          console.error(`%c${logMessage}`, `color: ${color}`, data || '');
          break;
        case LogLevel.ADMIN:
          console.log(`%c${logMessage}`, `color: ${color}; font-weight: bold`, data || '');
          break;
        default:
          console.log(`%c${logMessage}`, `color: ${color}`, data || '');
      }
    } else {
      // Server-side logging (no color)
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, data || '');
          break;
        case LogLevel.INFO:
          console.info(logMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, data || '');
          break;
        case LogLevel.ERROR:
          console.error(logMessage, data || '');
          break;
        case LogLevel.ADMIN:
          console.log(logMessage, data || '');
          break;
        default:
          console.log(logMessage, data || '');
      }
    }
  }

  /**
   * Store log in localStorage for debugging (client-side only)
   */
  private storeLog(entry: LogEntry): void {
    if (!isClient) return;
    
    try {
      const key = 'mopres_admin_logs';
      let logs: LogEntry[] = [];

      // Get existing logs
      const existingLogsJson = localStorage.getItem(key);
      if (existingLogsJson) {
        logs = JSON.parse(existingLogsJson);
      }

      // Add new log
      logs.push(entry);

      // Keep only the most recent logs
      if (logs.length > MAX_LOCAL_LOGS) {
        logs = logs.slice(-MAX_LOCAL_LOGS);
      }

      // Save back to localStorage
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      // Silently fail for cases where localStorage might be unavailable
      console.error('Failed to store log to localStorage:', error);
    }
  }

  /**
   * Get all stored logs from localStorage (for debugging UI)
   */
  getLogs(): LogEntry[] {
    if (!isClient) {
      return [];
    }

    try {
      const key = 'mopres_admin_logs';
      const logsJson = localStorage.getItem(key);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Failed to retrieve logs from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    if (!isClient) {
      return;
    }

    try {
      localStorage.removeItem('mopres_admin_logs');
    } catch (error) {
      console.error('Failed to clear logs from localStorage:', error);
    }
  }
}

// Export a singleton instance for global use
export const logger = new Logger();
