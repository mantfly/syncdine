// Limits how many API calls can be made in a day. Also tracks how many calls have been made in the last hour to prevent glitches.

const MAX_CALLS_PER_HOUR = 150;

export const checkRateLimit = (apiName, maxCallsPerDay) => {
    const now = Date.now();

    const DAY_KEY = `${apiName}_day_count`;
    const DAY_RESET_KEY = `${apiName}_day_reset`;
    const HOUR_KEY = `${apiName}_hour_timestamps`;

    // --- Per-hour check (localStorage) ---
    let hourlyCallTimestamps = JSON.parse(localStorage.getItem(HOUR_KEY) || '[]');
    hourlyCallTimestamps = hourlyCallTimestamps.filter(t => now - t < 3_600_000);

    if (hourlyCallTimestamps.length >= MAX_CALLS_PER_HOUR) {
        throw new Error(`[${apiName}] Slow down — max ${MAX_CALLS_PER_HOUR} requests per hour.`);
    }
    hourlyCallTimestamps.push(now);
    localStorage.setItem(HOUR_KEY, JSON.stringify(hourlyCallTimestamps));

    // --- Per-day check (localStorage) ---
    const resetTime = parseInt(localStorage.getItem(DAY_RESET_KEY) || '0');
    if (now > resetTime) {
        localStorage.setItem(DAY_KEY, '0');
        localStorage.setItem(DAY_RESET_KEY, String(now + 86_400_000));
    }

    const dayCount = parseInt(localStorage.getItem(DAY_KEY) || '0');
    if (dayCount >= maxCallsPerDay) {
        throw new Error(`[${apiName}] Daily limit reached (${maxCallsPerDay} calls). Try again tomorrow.`);
    }

    localStorage.setItem(DAY_KEY, String(dayCount + 1));
};