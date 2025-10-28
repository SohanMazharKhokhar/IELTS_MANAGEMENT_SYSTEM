// src/utils/activityLogger.ts

const ACTIVITY_LOG_KEY = 'ielts_activity_log';
const MAX_LOG_ENTRIES = 5; // Keep only the latest 5 activities

interface ActivityEntry {
    timestamp: string;
    message: string;
}

/**
 * Logs a new activity message to localStorage.
 * Keeps only the latest MAX_LOG_ENTRIES.
 * @param message The activity description.
 */
export const logActivity = (message: string): void => {
    const now = new Date();
    const newEntry: ActivityEntry = {
        timestamp: now.toISOString(),
        message: `${message} at ${now.toLocaleTimeString()}`
    };
    console.log("[ActivityLogger] Attempting to log activity:", newEntry); // <-- DEBUG LOG

    let currentLog: ActivityEntry[] = [];
    const storedLog = localStorage.getItem(ACTIVITY_LOG_KEY);

    if (storedLog) {
        try {
            const parsedLog = JSON.parse(storedLog);
            if (Array.isArray(parsedLog)) {
                currentLog = parsedLog;
            } else {
                 console.warn("[ActivityLogger] Stored log data was not an array. Resetting log.");
                 currentLog = [];
            }
        } catch (error) {
            console.error("[ActivityLogger] Error parsing existing log:", error);
            currentLog = []; // Reset on error
        }
    }

    // Add new entry to the beginning
    currentLog.unshift(newEntry);

    // Trim the log to the maximum size
    currentLog = currentLog.slice(0, MAX_LOG_ENTRIES);

    // Save back to localStorage
    try {
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(currentLog));
        console.log("[ActivityLogger] Successfully saved activity log to localStorage."); // <-- DEBUG LOG
    } catch (error) {
        console.error("[ActivityLogger] Error saving activity log:", error);
    }
};

/**
 * Retrieves the activity log from localStorage.
 * @returns An array of activity entries, or an empty array if none exist or an error occurs.
 */
export const getActivityLog = (): ActivityEntry[] => {
    const storedLog = localStorage.getItem(ACTIVITY_LOG_KEY);
    console.log("[ActivityLogger] Reading activity log from localStorage:", storedLog); // <-- DEBUG LOG
    if (storedLog) {
        try {
            const log = JSON.parse(storedLog);
            const result = Array.isArray(log) ? log : [];
            console.log("[ActivityLogger] Parsed activity log:", result); // <-- DEBUG LOG
            return result;
        } catch (error) {
            console.error("[ActivityLogger] Error parsing activity log on read:", error);
            return [];
        }
    }
    console.log("[ActivityLogger] No activity log found in localStorage."); // <-- DEBUG LOG
    return [];
};