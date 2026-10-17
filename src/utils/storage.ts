import { FinanceData, ColorTheme, ThemeMode } from '../models';
import { defaultFinanceData } from '../constants';

const STORAGE_KEY = 'finance-tracker:data:v1';
const THEME_STORAGE_KEY = 'finance-tracker:theme:v1';
const colorThemes = ['forest', 'ocean', 'sunset', 'berry', 'slate', 'emerald'] as const;
const themeClasses = colorThemes.map(c => 'theme-' + c)

function withStoredTheme(data: FinanceData): FinanceData {
    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (!storedTheme) return data;

        const [theme, colorPalette] = storedTheme.split('|');
        if ((theme !== 'light' && theme !== 'dark') || !colorThemes.includes(colorPalette as ColorTheme)) {
            return data;
        }

        return { ...data, preferences: { ...data.preferences, theme, colorTheme: colorPalette as ColorTheme } };
    } catch {
        return data;
    }
}

export function applyTheme(theme: ThemeMode, colorTheme: NonNullable<ColorTheme> = 'forest'): void {
    const root = document.documentElement;
    root.classList.remove(...themeClasses, 'theme-dark');

    root.classList.add(`theme-${colorTheme}`);
    root.setAttribute('data-theme', theme);
}

function isFinanceData(value: unknown): value is FinanceData {
    if (!value || typeof value !== 'object') return false;

    const data = value as Partial<FinanceData>;
    const firstTransaction = data.transactions?.[0];
    const firstAccount = data.accounts?.[0];
    const firstCategory = data.categories?.[0];
    const preferences = data.preferences;

    return (
        Array.isArray(data.transactions) &&
        Array.isArray(data.accounts) &&
        Array.isArray(data.categories) &&
        Boolean(preferences) &&
        (firstTransaction === undefined ||
            (typeof firstTransaction.id === 'string' &&
                typeof firstTransaction.date === 'string' &&
                typeof firstTransaction.accountId === 'string' &&
                (firstTransaction.type === 'income' || firstTransaction.type === 'expense') &&
                typeof firstTransaction.categoryId === 'string' &&
                typeof firstTransaction.amount === 'number' &&
                typeof firstTransaction.notes === 'string' &&
                typeof firstTransaction.createdAt === 'string' &&
                typeof firstTransaction.updatedAt === 'string'
            )
        ) &&
        (firstAccount === undefined ||
            (typeof firstAccount.id === 'string' &&
                typeof firstAccount.name === 'string' &&
                typeof firstAccount.name === 'string'
            )
        ) &&
        (firstCategory === undefined ||
            (typeof firstCategory.id === 'string' &&
                typeof firstCategory.name === 'string' &&
                typeof firstCategory.icon === 'string'
            )
        ) &&
        preferences !== undefined &&
        (preferences.theme === 'light' || preferences.theme === 'dark'
        ) &&
        (preferences.colorTheme === undefined ||
            ['forest', 'ocean', 'sunset', 'berry', 'slate', 'emerald'].some((theme) => theme === preferences.colorTheme)
        ) &&
        typeof preferences.decimalPlaces === 'number' &&
        typeof preferences.currencySign === 'string'
    );
}

export function loadFinanceData(): FinanceData {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) return withStoredTheme(structuredClone(defaultFinanceData));

        const parsed: unknown = JSON.parse(stored);
        return withStoredTheme(isFinanceData(parsed) ? parsed : structuredClone(defaultFinanceData));
    } catch {
        return withStoredTheme(structuredClone(defaultFinanceData));
    }
}

export function saveFinanceData(data: FinanceData): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.localStorage.setItem(THEME_STORAGE_KEY, `${data.preferences.theme}|${data.preferences.colorTheme ?? 'forest'}`);
}

export function clearFinanceData(): void {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(THEME_STORAGE_KEY);
}

export function exportFinanceData(data: FinanceData): string {
    return JSON.stringify(data, null, 2);
}

export function importFinanceData(serializedData: string): boolean {
    const parsed: unknown = JSON.parse(serializedData);
    if (!isFinanceData(parsed)) {
        alert('The selected file is not a valid Finance Tracker export.');
        throw new Error('The selected file is not a valid Finance Tracker export.');
    }
    saveFinanceData(parsed)
    return true
}
