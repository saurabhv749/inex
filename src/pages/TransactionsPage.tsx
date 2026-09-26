import Transactions from "../components/Transactions";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import { FinanceData, Transaction } from "../models";
import { downloadTransactionsCsv, selectImportFile, uploadTransactionsCsv } from "../utils/file";
import { formatDateForFilename } from "../utils/dates";

interface TransactionsPageProps {
    data: FinanceData;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    formatAmount: (amount: number) => string;
    accountName: (id: string) => string;
    categoryName: (id: string) => string;
    renderTransactions: (transactions: Transaction[]) => React.JSX.Element
    refreshData: () => void;
}

function TransactionsPage({ data, searchQuery, setSearchQuery, accountName, categoryName, renderTransactions, formatAmount, refreshData }: TransactionsPageProps) {
    const { fromDate, toDate, typeFilter, accountFilter, categoryFilter, setFromDate, setToDate, setTypeFilter, setAccountFilter, setCategoryFilter, resetFilters
    } = useTransactionFilters()

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
        const startDate = fromDate ? formatDateForFilename(fromDate) : 'any-date';
        const endDate = toDate ? formatDateForFilename(toDate) : 'any-date';
        downloadTransactionsCsv(filteredTransactions, `transactions-${startDate}-to-${endDate}.csv`);
    }
    const importCsv = async () => {
        const file = await selectImportFile('csv');
        if (!file) return;

        try {
            await uploadTransactionsCsv(file);
            refreshData()
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'The selected CSV could not be imported.');
        }
    }
    const clearFilters = () => {
        resetFilters()
        setSearchQuery("")
    }

    return <Transactions
        transactionListItems={renderTransactions(filteredTransactions)}
        exportCsv={exportCsv}
        importCsv={importCsv}
        formatAmount={formatAmount}
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
        onClearFilters={clearFilters}
    />
}

export default TransactionsPage