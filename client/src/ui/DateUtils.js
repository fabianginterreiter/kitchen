export function getDayName(date) {
    return date.toLocaleString('de', { weekday: 'long' });
}

export function getMonthName(date) {
    return date.toLocaleString('de', { month: 'long' });
}

export function formatDate(date) {
return getDayName(date) + ", " + date.getDate() + ". " + getMonthName(date) + " " + date.getFullYear();
}