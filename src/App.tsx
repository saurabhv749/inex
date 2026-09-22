import './App.css';
import React, { useState } from 'react';
import { OptionsType, Transaction, View } from './models';
import { useModal } from './context/ModalContext';
import { useFinanceData } from './hooks/useFinanceData';
import { currencyDecimalPlaces } from './utils/currency';

import TransactionList from './components/TransactionList';
import { PreferencesModal, RecordModal, TransactionModal } from './components/Modal'
import EmptyState from './components/EmptyState';
import SearchBar from './components/SearchBar';

import OverviewPage from './pages/OverviewPage';
import TransactionsPage from './pages/TransactionsPage';
import OptionsManagerPage from './pages/OptionsManagerPage';
import { SettingsIcon, AccountsIcon, CategoriesIcon, OverviewIcon, TransactionsIcon, GeminiAIIcon } from './icons';
import AskGemini from './gemini/AskGemini';

// nav & icons
interface navIconMapping {
    [key: string]: React.ReactElement
}
const navigationItems: View[] = ['Overview', 'Transactions', 'Categories', 'Accounts'];
const navigationIcons: navIconMapping = {
    'Overview': <OverviewIcon />,
    'Transactions': <TransactionsIcon />,
    'Categories': <CategoriesIcon />,
    'Accounts': <AccountsIcon />
}

export function App() {
    const [activeView, setActiveView] = useState<View>('Overview');
    const [searchQuery, setSearchQuery] = useState<string>("")

    const { modal, setModal, setRecordError } = useModal();
    const { data, refreshFinanceData, openTransaction, saveTransaction, deleteTransaction, deleteAccount, deleteCategory, saveAccount, saveCategory, savePreferences, transactionDraft, setTransactionDraft, editingTransaction } = useFinanceData()

    const currency = data.preferences.currencySign;
    const decimalPlaces = currencyDecimalPlaces[currency]
    const formatAmount = (amount: number): string => {
        const formattedValue = Math.abs(amount).toFixed(decimalPlaces as number)
        return amount < 0 ? `-${currency}${formattedValue}` : `${currency}${formattedValue}`
    };

    const handleEditTransaction = (transaction?: Transaction) => {
        openTransaction(transaction)
        setRecordError('');
        setModal('transaction');
    }

    // map account/category to get name: account.id -> account.name
    const accountName = (id: string) => data.accounts.find((item) => item.id === id)?.name ?? 'Unassigned account';
    const categoryName = (id: string) => data.categories.find((item) => item.id === id)?.name ?? 'Uncategorized';
    const allAccounts = data.accounts.map(a => a.name)
    const allCategories = data.categories.map(c => c.name)

    function renderTransactionList(transactions: Transaction[]) {
        if (transactions.length === 0)
            return <EmptyState onAdd={() => handleEditTransaction()} />

        // sort by date: newest first
        transactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return <TransactionList
            transactions={transactions}
            accountName={accountName}
            categoryName={categoryName}
            formatAmount={formatAmount}
            onEdit={handleEditTransaction}
            onDelete={deleteTransaction}
        />
    }
    // screens/pages
    function renderOverview() {
        return <OverviewPage
            data={data}
            formatAmount={formatAmount}
            onNavigate={setActiveView}
            refreshData={refreshFinanceData}
            renderTransactions={renderTransactionList}
        />
    }

    function renderTransactions() {
        return <TransactionsPage
            data={data}
            refreshData={refreshFinanceData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            formatAmount={formatAmount}
            renderTransactions={renderTransactionList}
            accountName={accountName}
            categoryName={categoryName}
        />
    }

    function renderOptionsManager(kind: OptionsType) {
        return <OptionsManagerPage
            kind={kind}
            data={data}
            deleteAccount={deleteAccount}
            deleteCategory={deleteCategory}
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
                                {
                                    navigationIcons[item]
                                }
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
                        <span className='icon nav-icon' aria-hidden="true">
                            <SettingsIcon />
                        </span>
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
                        <button className="button button-primary" onClick={() => handleEditTransaction()} type="button"><span aria-hidden="true">+</span> Add transaction</button>

                    </div>
                </header>
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    changeView={setActiveView}
                />
                {
                    activeView === 'Overview' ? renderOverview() : activeView === 'Transactions' ? renderTransactions() : renderOptionsManager(activeView.toLowerCase() as OptionsType)
                }
            </main>
            {/* floating AI asssitant button */}
            <button className="button button-primary button-floating"
                type="button"
                onClick={() => setModal('ai')}
            > <span className="nav-icon"><GeminiAIIcon /> </span>Ask AI</button>
            {
                modal === 'ai' && <AskGemini data={data} currency={currency} accountNames={allAccounts} categoryNames={allCategories} />
            }
            {
                modal === 'transaction' && <TransactionModal
                    draft={transactionDraft}
                    setDraft={setTransactionDraft}
                    accounts={data.accounts}
                    categories={data.categories}
                    editing={Boolean(editingTransaction)}
                    onSubmit={saveTransaction}
                />
            }

            {
                modal === 'account' && <RecordModal
                    title="Add account"
                    label="Account name"
                    onSubmit={saveAccount}
                    isCategory={false}
                />
            }
            {
                modal === 'category' && <RecordModal
                    title="Add category"
                    label="Category name"
                    onSubmit={saveCategory}
                    isCategory={true}
                />
            }
            {
                modal === 'preferences' && <PreferencesModal
                    preferences={data.preferences}
                    onSave={savePreferences}
                />
            }
        </div >
    )
}