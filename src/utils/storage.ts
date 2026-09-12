import { defaultFinanceData, FinanceData } from '../models';

const STORAGE_KEY = 'finance-tracker:data:v1';

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
        typeof preferences.decimalPlaces === 'number' &&
        typeof preferences.currencySign === 'string'
    );
}

export function loadFinanceData(): FinanceData {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) return structuredClone(defaultFinanceData);

        const parsed: unknown = JSON.parse(stored);
        return isFinanceData(parsed) ? parsed : structuredClone(defaultFinanceData);
    } catch {
        return structuredClone(defaultFinanceData);
    }
}

export function saveFinanceData(data: FinanceData): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearFinanceData(): void {
    window.localStorage.removeItem(STORAGE_KEY);
}

export function exportFinanceData(data: FinanceData): string {
    return JSON.stringify(data, null, 2);
}

export function importFinanceData(serializedData: string): boolean {
    const parsed: unknown = JSON.parse(serializedData);
    if (!isFinanceData(parsed)) {
        throw new Error('The selected file is not a valid Finance Tracker export.');
    }
    saveFinanceData(parsed)
    return true
}
