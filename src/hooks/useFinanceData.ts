import { useEffect, useState, SubmitEvent } from "react";
import { Account, Category, FinanceData, Preferences, Transaction } from "../models";
import { loadFinanceData, saveFinanceData } from "../utils/storage";

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

function emptyTransaction(): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDateTime: string = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);

    return { date: localDateTime, accountId: '', type: 'expense', categoryId: '', amount: 0, notes: '' };
}

export function useFinanceData() {
    const [data, setData] = useState<FinanceData>(() => loadFinanceData());
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionDraft, setTransactionDraft] = useState(emptyTransaction);

    useEffect(() => saveFinanceData(data), [data]);

    function refreshFinanceData() {
        setData(loadFinanceData());
    }

    function openTransaction(transaction?: Transaction) {
        setEditingTransaction(transaction ?? null);
        setTransactionDraft(transaction ? {
            date: transaction.date.slice(0, 16),
            accountId: transaction.accountId,
            type: transaction.type,
            categoryId: transaction.categoryId,
            amount: transaction.amount,
            notes: transaction.notes
        } : emptyTransaction()
        );
    }

    function savePreferences(preferences: Preferences) {
        setData((current) => ({ ...current, preferences }));
    }

    function saveTransaction(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!transactionDraft.date || !transactionDraft.accountId || !transactionDraft.categoryId || transactionDraft.amount <= 0) {
            window.alert('Choose a date, account, category, and amount greater than zero.');
            return;
        }
        const timestamp = now();
        const transaction: Transaction = {
            ...transactionDraft,
            id: editingTransaction?.id ?? createId(),
            createdAt: editingTransaction?.createdAt ?? timestamp,
            updatedAt: timestamp
        };
        setData((current) => ({
            ...current,
            transactions: editingTransaction ? current.transactions.map(
                (item) => item.id === transaction.id ? transaction : item
            ) : [transaction, ...current.transactions]
        }));
    }

    function deleteTransaction(id: string) {
        if (window.confirm('Delete this transaction?'))
            setData((current) => ({
                ...current,
                transactions: current.transactions.filter((item) => item.id !== id)
            }));
    }

    function saveAccount(name: string, icon: string) {
        if (!name.trim()) return;
        setData((current) => ({ ...current, accounts: [...current.accounts, { id: createId(), name: name.trim(), icon: icon || 'wallet' }] }));
    }

    function saveCategory(name: string, icon: string, type: string) {
        if (!name.trim()) return;
        setData((current) => ({ ...current, categories: [...current.categories, { id: createId(), name: name.trim(), icon: icon || 'tag', type }] }));
    }

    function deleteAccount(account: Account) {
        if (data.transactions.some((item) => item.accountId === account.id)) {
            window.alert('This account is used by a transaction and cannot be deleted yet.');
            return;
        }
        if (window.confirm(`Delete ${account.name}?`)) setData((current) => ({ ...current, accounts: current.accounts.filter((item) => item.id !== account.id) }));
    }

    function deleteCategory(category: Category) {
        if (data.transactions.some((item) => item.categoryId === category.id)) {
            window.alert('This category is used by a transaction and cannot be deleted yet.');
            return;
        }
        if (window.confirm(`Delete ${category.name}?`)) setData((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) }));
    }

    return {
        data, setData, editingTransaction, transactionDraft, setTransactionDraft, openTransaction, savePreferences, saveTransaction, deleteTransaction, saveAccount, deleteAccount, saveCategory, deleteCategory, refreshFinanceData
    };
}