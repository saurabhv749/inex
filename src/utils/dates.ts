const transactionDateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const filterDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const assistantDateFormatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const filenameDateFormatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

export function getCurrentDate(): Date {
    return new Date();
}

export function getDateInputValue(date: Date = getCurrentDate()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getCurrentMonthStartInputValue(date: Date = getCurrentDate()): string {
    return getDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function getCurrentMonthKey(date: Date = getCurrentDate()): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getLocalDateTimeInputValue(date: Date = getCurrentDate()): string {
    return `${getDateInputValue(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function getIsoTimestamp(date: Date = getCurrentDate()): string {
    return date.toISOString();
}

export function getFilenameTimestamp(date: Date = getCurrentDate()): string {
    return date.toISOString().replace(/[:.]/g, '-');
}

export function getDateFromValue(value: string): Date {
    return new Date(value);
}

export function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getPreviousMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function isSameMonth(value: string, date: Date): boolean {
    const valueDate = getDateFromValue(value);
    return valueDate.getFullYear() === date.getFullYear()
        && valueDate.getMonth() === date.getMonth();
}

export function getDayOfMonth(value: string): number {
    return getDateFromValue(value).getDate();
}

export function sortByDateDescending<T extends { date: string }>(items: readonly T[]): T[] {
    return [...items].sort((left, right) => (
        getDateFromValue(right.date).getTime() - getDateFromValue(left.date).getTime()
    ));
}

export function formatTransactionDate(value: string): string {
    return transactionDateFormatter.format(getDateFromValue(value));
}

export function formatFilterDate(value: string): string {
    return filterDateFormatter.format(getDateFromValue(`${value}T00:00:00`));
}

export function formatAssistantDate(date: Date = getCurrentDate()): string {
    return assistantDateFormatter.format(date);
}

export function formatDateForFilename(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    return filenameDateFormatter.formatToParts(date)
        .filter((part) => part.type === 'month' || part.type === 'day' || part.type === 'year')
        .map((part) => part.value)
        .join('-');
}

export function formatMonth(date: Date, includeYear = false): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        ...(includeYear ? { year: 'numeric' } : {}),
    }).format(date);
}
