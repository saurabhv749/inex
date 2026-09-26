export type View = 'Overview' | 'Transactions' | 'Accounts' | 'Categories';
export type Modal = 'transaction' | 'account' | 'category' | 'preferences' | 'ai' | 'sync' | null;
export type OptionsType = 'accounts' | 'categories';
export type OptionTitleType = 'Accounts' | 'Categories';
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