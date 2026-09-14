import './App.css';
import { SubmitEvent, useEffect, useState } from 'react';
import { Account, Category, FinanceData, Preferences, Transaction } from './models';
import { loadFinanceData, saveFinanceData } from './utils/storage';

import TransactionList from './components/TransactionList';
import Overview from './components/Overview';
import { PreferencesModal, RecordModal, TransactionModal } from './components/Modal'
import EmptyState from './components/EmptyState';
import Transactions from './components/Transactions';
import OptionsManager from './components/OptionsManager';
import SearchBar from './components/SearchBar';
import { downloadJsonFile, downloadTransactionsCsv, selectImportFile, uploadJsonFile, uploadTransactionsCsv } from './utils/file';
import { currencyDecimalPlaces } from './utils/currency';

type View = 'Overview' | 'Transactions' | 'Accounts' | 'Categories';
type Modal = 'transaction' | 'account' | 'category' | 'preferences' | null;

const navigationItems: View[] = ['Overview', 'Transactions', 'Categories', 'Accounts'];
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();
const dateInputValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function emptyTransaction(): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    return { date: new Date().toISOString().slice(0, 16), accountId: '', type: 'expense', categoryId: '', amount: 0, notes: '' };
}

export function App() {
    const [activeView, setActiveView] = useState<View>('Overview');
    const [data, setData] = useState<FinanceData>(() => loadFinanceData());
    const [modal, setModal] = useState<Modal>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionDraft, setTransactionDraft] = useState(emptyTransaction);
    const [recordError, setRecordError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [accountFilter, setAccountFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [fromDate, setFromDate] = useState(() => dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [toDate, setToDate] = useState(() => dateInputValue(new Date()));

    useEffect(() => saveFinanceData(data), [data]);

    const currency = data.preferences.currencySign;
    const decimalPlaces = currencyDecimalPlaces[currency]
    const formatAmount = (amount: number): string => `${currency}${amount.toFixed(decimalPlaces as number)}`
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthTransactions = data.transactions.filter((item) => item.date.slice(0, 7) === currentMonthKey);
    const totalIncome = currentMonthTransactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = currentMonthTransactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
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

    function savePreferences(preferences: Preferences) {
        setData((current) => ({ ...current, preferences }));
        closeModal();
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

    function saveCategory(name: string, icon: string, type: string) {
        if (!name.trim()) return;
        setData((current) => ({ ...current, categories: [...current.categories, { id: createId(), name: name.trim(), icon: icon || 'tag', type }] }));
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
            return <EmptyState onAdd={() => openTransaction()} />

        // sort by date: newest first
        transactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return <TransactionList
            transactions={transactions}
            accountName={accountName}
            categoryName={categoryName}
            formatAmount={formatAmount}
            onEdit={openTransaction}
            onDelete={deleteTransaction}
        />
    }
    // screens
    function renderOverview() {
        const recentTransactions = currentMonthTransactions.slice(0, 5);
        const exportJSON = () => {
            downloadJsonFile(data);
        };
        const importJSON = async () => {
            const file = await selectImportFile('json');
            if (!file) return;

            try {
                await uploadJsonFile(file);
                setData(loadFinanceData());
            } catch (error) {
                window.alert(error instanceof Error ? error.message : 'The selected JSON file could not be imported.');
            }
        };

        return <Overview
            formatAmount={formatAmount}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            viewAllHandler={() => setActiveView('Transactions')}
            transactionListItems={renderTransactionList(recentTransactions)}
            // all transactions
            transactions={data.transactions}
            categories={data.categories}
            exportJSON={exportJSON}
            importJSON={importJSON}
        />
    }

    function renderTransactions() {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const filteredTransactions = data.transactions.filter((transaction) => {
            const transactionDate = transaction.date.slice(0, 10);
            const searchableText = [
                transaction.notes,
                transaction.type,
                transaction.amount.toString(),
                transaction.date,
                accountName(transaction.accountId),
                categoryName(transaction.categoryId),
            ].join(' ').toLowerCase();

            return transactionDate >= fromDate
                && transactionDate <= toDate
                && (!normalizedQuery || searchableText.includes(normalizedQuery))
                && (!typeFilter || transaction.type === typeFilter)
                && (!accountFilter || transaction.accountId === accountFilter)
                && (!categoryFilter || transaction.categoryId === categoryFilter);
        });

        const totalExpenses = filteredTransactions
            .filter((item) => item.type === 'expense')
            .reduce((sum, item) => sum + item.amount, 0);
        const totalIncome = filteredTransactions
            .filter((item) => item.type === 'income')
            .reduce((sum, item) => sum + item.amount, 0);

        // Transaction Helpers
        const exportCsv = () => {
            downloadTransactionsCsv(filteredTransactions, `transactions-${currentMonthKey}.csv`);
        }
        const importCsv = async () => {
            const file = await selectImportFile('csv');
            if (!file) return;

            try {
                await uploadTransactionsCsv(file);
                setData(loadFinanceData());
            } catch (error) {
                window.alert(error instanceof Error ? error.message : 'The selected CSV could not be imported.');
            }
        }

        return <Transactions
            transactionListItems={renderTransactionList(filteredTransactions)}
            exportCsv={exportCsv}
            importCsv={importCsv}
            formatAmount={formatAmount}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            accountFilter={accountFilter}
            categoryFilter={categoryFilter}
            onTypeFilterChange={setTypeFilter}
            onAccountFilterChange={setAccountFilter}
            onCategoryFilterChange={setCategoryFilter}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            accounts={data.accounts}
            categories={data.categories}
            resultCount={filteredTransactions.length}
            totalExpense={totalExpenses}
            totalIncome={totalIncome}
            onClearFilters={() => {
                setSearchQuery('');
                setTypeFilter('');
                setAccountFilter('');
                setCategoryFilter('');
                setFromDate(dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
                setToDate(dateInputValue(new Date()));
            }}
        />
    }

    function renderOptionsManager(kind: 'accounts' | 'categories') {
        const isAccounts = kind === 'accounts';
        const records = isAccounts ? data.accounts : data.categories;
        const title = isAccounts ? 'Accounts' : 'Categories'
        const deleteFunction = (record: any) => isAccounts ? deleteAccount(record) : deleteCategory(record)
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
            removeRecordHandler={deleteFunction}
        />
    }

    return (
        <div className={data.preferences.theme === 'dark' ? 'app-shell theme-dark' : 'app-shell'}>
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
                    <button className="nav-item display-mobile" onClick={() => setModal('preferences')} type="button">
                        <span className="nav-icon" aria-hidden="true">*</span>
                        <span>Preferences</span>
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button className="preferences-button" onClick={() => setModal('preferences')} type="button">
                        <span className="nav-icon" aria-hidden="true">*</span>
                        <span>Preferences</span>
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
                        <button className="button button-primary" onClick={() => openTransaction()} type="button"><span aria-hidden="true">+</span> Add transaction</button>

                    </div>
                </header>
                <SearchBar
                    value={searchQuery}
                    onChange={(value) => {
                        setSearchQuery(value);
                        if (value.trim()) setActiveView('Transactions');
                    }}
                />

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
                    onClose={closeModal} onSubmit={saveAccount} isCategory={false} />
            }
            {
                modal === 'category' && <RecordModal title="Add category" label="Category name"
                    onClose={closeModal} onSubmit={saveCategory} isCategory={true} />
            }
            {
                modal === 'preferences' && <PreferencesModal
                    preferences={data.preferences}
                    onClose={closeModal}
                    onSave={savePreferences} />
            }
        </div >
    )
}