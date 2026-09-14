import { FinanceData } from "./models";

export const defaultFinanceData: FinanceData = {
    transactions: [],
    accounts: [
        { id: 'acc-1', name: 'Cash', icon: 'cash' },
        { id: 'acc-2', name: 'Main Bank Account', icon: 'landmark' },
        { id: 'acc-3', name: 'Credit Card', icon: 'credit-card' },
    ],
    categories: [
        // Income Categories
        { id: 'cat-inc-1', name: 'Salary', icon: 'briefcase', type: 'income' },
        { id: 'cat-inc-2', name: 'Investments', icon: 'trending-up', type: 'income' },
        { id: 'cat-inc-3', name: 'Gifts & Grants', icon: 'gift', type: 'income' },
        { id: 'cat-inc-4', name: 'Carry Over', icon: 'plus-circle', type: 'income' },

        // Expense Categories
        { id: 'cat-exp-1', name: 'Housing', icon: 'home', type: 'expense' },
        { id: 'cat-exp-2', name: 'Food & Groceries', icon: 'shopping-cart', type: 'expense' },
        { id: 'cat-exp-3', name: 'Transportation', icon: 'car', type: 'expense' },
        { id: 'cat-exp-4', name: 'Utilities', icon: 'zap', type: 'expense' },
        { id: 'cat-exp-5', name: 'Entertainment', icon: 'film', type: 'expense' },
        { id: 'cat-exp-6', name: 'Healthcare', icon: 'heart-pulse', type: 'expense' },
        { id: 'cat-exp-7', name: 'Shopping', icon: 'tag', type: 'expense' },
        { id: 'cat-exp-8', name: 'Education', icon: 'book-open', type: 'expense' },
        { id: 'cat-exp-9', name: 'Miscellaneous', icon: 'more-horizontal', type: 'expense' },
    ],
    preferences: {
        theme: 'light',
        decimalPlaces: 2,
        currencySign: "₹",
    },
};