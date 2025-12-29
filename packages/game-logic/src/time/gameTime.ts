import { GameTime, Season } from '../types';

// Game time constants
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_SEASON = 28;
export const SEASONS_PER_YEAR = 4;

// Real time to game time ratio (1 real second = X game minutes)
export const TIME_SCALE = 10; // 1 real second = 10 game minutes

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

/**
 * Create initial game time (Day 1 of Spring, Year 1, 6:00 AM)
 */
export function createInitialGameTime(): GameTime {
    return {
        day: 1,
        hour: 6,
        minute: 0,
        season: 'spring',
        year: 1,
    };
}

/**
 * Advance game time by a number of real seconds
 */
export function advanceTime(time: GameTime, realSeconds: number): GameTime {
    const gameMinutesElapsed = realSeconds * TIME_SCALE;

    let { day, hour, minute, season, year } = time;

    minute += gameMinutesElapsed;

    // Roll over minutes to hours
    while (minute >= MINUTES_PER_HOUR) {
        minute -= MINUTES_PER_HOUR;
        hour++;
    }

    // Roll over hours to days
    while (hour >= HOURS_PER_DAY) {
        hour -= HOURS_PER_DAY;
        day++;
    }

    // Roll over days to seasons
    while (day > DAYS_PER_SEASON) {
        day -= DAYS_PER_SEASON;
        const seasonIndex = SEASON_ORDER.indexOf(season);
        const nextSeasonIndex = (seasonIndex + 1) % SEASONS_PER_YEAR;
        season = SEASON_ORDER[nextSeasonIndex];

        // Roll over seasons to years
        if (nextSeasonIndex === 0) {
            year++;
        }
    }

    return { day, hour, minute: Math.floor(minute), season, year };
}

/**
 * Get total game hours elapsed
 */
export function getTotalGameHours(time: GameTime): number {
    const seasonIndex = SEASON_ORDER.indexOf(time.season);
    const totalDays =
        (time.year - 1) * DAYS_PER_SEASON * SEASONS_PER_YEAR +
        seasonIndex * DAYS_PER_SEASON +
        time.day;

    return totalDays * HOURS_PER_DAY + time.hour;
}

/**
 * Check if it's daytime (6:00 AM - 8:00 PM)
 */
export function isDaytime(time: GameTime): boolean {
    return time.hour >= 6 && time.hour < 20;
}

/**
 * Format time for display
 */
export function formatTime(time: GameTime): string {
    const hour12 = time.hour % 12 || 12;
    const ampm = time.hour < 12 ? 'AM' : 'PM';
    const minuteStr = time.minute.toString().padStart(2, '0');

    return `${hour12}:${minuteStr} ${ampm}`;
}

/**
 * Format date for display
 */
export function formatDate(time: GameTime): string {
    const seasonCapitalized = time.season.charAt(0).toUpperCase() + time.season.slice(1);
    return `Day ${time.day} of ${seasonCapitalized}, Year ${time.year}`;
}
