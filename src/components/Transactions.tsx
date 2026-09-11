import { ReactNode } from "react";
import SectionHeading from "./SectionHeading";

interface FilterOption {
    id: string;
    name: string;
}

interface TransactionsProps {
    addTransactionHandler: () => void;
    transactionListItems: ReactNode;
    searchQuery: string;
    typeFilter: string;
    accountFilter: string;
    categoryFilter: string;
    onTypeFilterChange: (value: string) => void;
    onAccountFilterChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    fromDate: string;
    toDate: string;
    onFromDateChange: (value: string) => void;
    onToDateChange: (value: string) => void;
    accounts: FilterOption[];
    categories: FilterOption[];
    resultCount: number;
    totalIncome: number;
    totalExpense: number;
    onClearFilters: () => void;
}

function Transactions({
    addTransactionHandler,
    transactionListItems,
    searchQuery,
    typeFilter,
    accountFilter,
    categoryFilter,
    onTypeFilterChange,
    onAccountFilterChange,
    onCategoryFilterChange,
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    accounts,
    categories,
    resultCount,
    totalExpense,
    totalIncome,
    onClearFilters,
}: TransactionsProps) {
    const hasFilters = Boolean(searchQuery || typeFilter || accountFilter || categoryFilter);
    const formattedFromDate = fromDate ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${fromDate}T00:00:00`)) : 'Any date';
    const formattedToDate = toDate ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${toDate}T00:00:00`)) : 'Any date';

    return (
        <>
            <section className="page-panel">
                <SectionHeading
                    eyebrow="Money trail"
                    title="Transactions"
                    action={
                        <button className="button button-primary"
                            onClick={addTransactionHandler}
                            type="button">+ Add transaction
                        </button>
                    }
                />

                <div className="transaction-toolbar">
                    <div className="filter-group" aria-label="Transaction filters">
                        <label>
                            <span>From</span>
                            <input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => onFromDateChange(event.target.value)} />
                        </label>
                        <label>
                            <span>To</span>
                            <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => onToDateChange(event.target.value)} />
                        </label>
                        <label>
                            <span>Type</span>
                            <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)}>
                                <option value="">All types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </label>
                        <label>
                            <span>Account</span>
                            <select value={accountFilter} onChange={(event) => onAccountFilterChange(event.target.value)}>
                                <option value="">All accounts</option>
                                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Category</span>
                            <select value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)}>
                                <option value="">All categories</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </label>
                    </div>
                    <div className="result-summary">
                        <span>{resultCount} result{resultCount === 1 ? '' : 's'} · {formattedFromDate} – {formattedToDate}</span>
                        <button className="text-button" onClick={onClearFilters} type="button">Clear filters</button>
                    </div>

                </div>

                {
                    transactionListItems
                }

            </section>
            <section >
                <div className="transactions-summary" >
                    <strong className='amount'>
                        Total income: {totalIncome.toFixed(1)}
                    </strong>
                    <strong className='amount'>
                        Total expense: {totalExpense.toFixed(1)}
                    </strong>
                    <strong className='amount'>
                        Net total: {(totalIncome - totalExpense).toFixed(1)}
                    </strong>
                </div>

            </section>
        </>)
}

export default Transactions