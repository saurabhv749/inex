import './App.css';
import { SubmitEvent, useEffect, useState } from 'react';
import { Account, Category, FinanceData, Transaction } from './models';
import { loadFinanceData, saveFinanceData } from './utils/storage';

import TransactionList from './components/TransactionList';
import Overview from './components/Overview';
import { RecordModal, TransactionModal } from './components/Modal'
import EmptyState from './components/EmptyState';
import Transactions from './components/Transactions';
import OptionsManager from './components/OptionsManager';

type View = 'Overview' | 'Transactions' | 'Accounts' | 'Categories';
type Modal = 'transaction' | 'account' | 'category' | null;

const navigationItems: View[] = ['Overview', 'Transactions', 'Categories', 'Accounts'];
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

function emptyTransaction(): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    return { date: new Date().toISOString().slice(0, 16), accountId: '', type: 'expense', categoryId: '', amount: 0, notes: '' };
}

export function App() {
    const [activeView, setActiveView] = useState<View>('Overview');
    const [isDark, setIsDark] = useState(false);
    const [data, setData] = useState<FinanceData>(() => loadFinanceData());
    const [modal, setModal] = useState<Modal>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionDraft, setTransactionDraft] = useState(emptyTransaction);
    const [recordError, setRecordError] = useState('');

    useEffect(() => saveFinanceData(data), [data]);

    const currency = data.preferences.currencySign;
    const totalIncome = data.transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    // map account/category to get name: account.id -> account.name
    const accountName = (id: string) => data.accounts.find((item) => item.id === id)?.name ?? 'Unassigned account';
    const categoryName = (id: string) => data.categories.find((item) => item.id === id)?.name ?? 'Uncategorized';

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
        setRecordError('');
        setModal('transaction');
    }

    function closeModal() {
        setModal(null);
        setRecordError('');
    }

    function saveTransaction(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!transactionDraft.date || !transactionDraft.accountId || !transactionDraft.categoryId || transactionDraft.amount <= 0) {
            setRecordError('Choose a date, account, category, and amount greater than zero.');
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
        closeModal();
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
        closeModal();
    }

    function saveCategory(name: string, icon: string) {
        if (!name.trim()) return;
        setData((current) => ({ ...current, categories: [...current.categories, { id: createId(), name: name.trim(), icon: icon || 'tag' }] }));
        closeModal();
    }

    function deleteAccount(account: Account) {
        if (data.transactions.some((item) => item.accountId === account.id)) {
            setRecordError('This account is used by a transaction and cannot be deleted yet.');
            return;
        }
        if (window.confirm(`Delete ${account.name}?`)) setData((current) => ({ ...current, accounts: current.accounts.filter((item) => item.id !== account.id) }));
    }

    function deleteCategory(category: Category) {
        if (data.transactions.some((item) => item.categoryId === category.id)) {
            setRecordError('This category is used by a transaction and cannot be deleted yet.');
            return;
        }
        if (window.confirm(`Delete ${category.name}?`)) setData((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) }));
    }
    // util
    function renderTransactionList(transactions: Transaction[]) {
        if (transactions.length === 0)
            return <EmptyState onAdd={openTransaction} />

        return <TransactionList
            transactions={transactions}
            accountName={accountName}
            categoryName={categoryName}
            currency={currency}
            onEdit={openTransaction}
            onDelete={deleteTransaction}
        />
    }
    // screens
    function renderOverview() {
        const recentTransactions = data.transactions.slice(0, 5);

        return <Overview
            currency={currency}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            transactionCount={recentTransactions.length}
            viewAllHandler={() => setActiveView('Transactions')}
            transactionListItems={renderTransactionList(recentTransactions)}
        />
    }

    function renderTransactions() {
        const allTransactions = data.transactions
        return <Transactions
            transactionListItems={renderTransactionList(allTransactions)}
            addTransactionHandler={() => openTransaction()}
        />
    }

    function renderOptionsManager(kind: 'accounts' | 'categories') {
        const isAccounts = kind === 'accounts';
        const records = isAccounts ? data.accounts : data.categories;
        const title = isAccounts ? 'Accounts' : 'Categories'

        return <OptionsManager
            section={title}
            records={records}
            recordError={recordError}
            addHandler={() => {
                setRecordError('');
                setModal(isAccounts ? 'account' : 'category');
            }
            }
            addRecordHandler={() => setModal(isAccounts ? 'account' : 'category')}
            removeRecordHandler={() => isAccounts ? deleteAccount : deleteCategory}
        />
    }

    return (
        <div className={isDark ? 'app-shell theme-dark' : 'app-shell'}>
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-mark">IE</span>
                    <span>InEx</span>
                </div>
                <nav className="main-nav" aria-label="Main navigation">
                    <p className="nav-label">Workspace</p>
                    {navigationItems.map(
                        (item) => <button className={activeView === item ? 'nav-item active' : 'nav-item'}
                            key={item} onClick={() => setActiveView(item)} type="button">
                            <span className="nav-icon" aria-hidden="true">
                                {item === 'Overview' ? '+' : item === 'Transactions' ? '=' : item === 'Accounts' ? '[]' : '*'}
                            </span>{item}
                        </button>)
                    }
                </nav>
                <div className="sidebar-footer">
                    <button className="profile-button" type="button">
                        <span className="avatar">YO</span>
                        <span className="profile-copy">
                            <strong>Your account</strong>
                            <small>Personal space</small>
                        </span>
                        <span aria-hidden="true">...</span>
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">Personal finance / Expense Tracker</p>
                        <h1>{activeView}</h1>
                    </div>
                    <div className="topbar-actions">
                        <button aria-label="Toggle colour theme" className="icon-button"
                            onClick={() => setIsDark((current) => !current)}
                            title="Toggle colour theme" type="button">
                            {isDark ? 'L' : 'D'}
                        </button>

                        <button className="button button-primary" onClick={() => openTransaction()} type="button"><span aria-hidden="true">+</span> Add transaction</button>

                    </div>
                </header>

                {
                    activeView === 'Overview' ? renderOverview() : activeView === 'Transactions' ? renderTransactions() : renderOptionsManager(activeView.toLowerCase() as 'accounts' | 'categories')
                }
            </main>
            {
                modal === 'transaction' && <TransactionModal
                    draft={transactionDraft} setDraft={setTransactionDraft}
                    accounts={data.accounts} categories={data.categories}
                    error={recordError} editing={Boolean(editingTransaction)}
                    onClose={closeModal} onSubmit={saveTransaction} />
            }

            {
                modal === 'account' && <RecordModal title="Add account" label="Account name"
                    onClose={closeModal} onSubmit={saveAccount} />
            }
            {
                modal === 'category' && <RecordModal title="Add category" label="Category name"
                    onClose={closeModal} onSubmit={saveCategory} />
            }
        </div>
    )
}