export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    date: string;
    accountId: string;
    type: TransactionType;
    categoryId: string;
    amount: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface Account {
    id: string;
    name: string;
    icon: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    type: TransactionType | string;
}

export interface Preferences {
    theme: 'light' | 'dark';
    decimalPlaces: number;
    currencySign: string;
}

export interface FinanceData {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    preferences: Preferences;
}