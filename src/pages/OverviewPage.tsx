import Overview from "../components/Overview";
import { FinanceData, Transaction, View } from "../models";
import { downloadJsonFile, selectImportFile, uploadJsonFile } from "../utils/file";
import { getCurrentMonthKey } from "../utils/dates";

interface OverviewPageProps {
    data: FinanceData;
    formatAmount: (amount: number) => string;
    onNavigate: (view: View) => void;
    renderTransactions: (transactions: Transaction[]) => React.JSX.Element;
    refreshData: () => void;
}

function OverviewPage({ data, formatAmount, onNavigate, renderTransactions, refreshData }: OverviewPageProps) {

    const currentMonthKey = getCurrentMonthKey();
    const currentMonthTransactions = data.transactions.filter((item) => item.date.slice(0, 7) === currentMonthKey);
    const totalIncome = currentMonthTransactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = currentMonthTransactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

    const recentTransactions = currentMonthTransactions.slice(0, 5);
    const exportJSON = () => {
        downloadJsonFile(data);
    };
    const importJSON = async () => {
        const file = await selectImportFile('json');
        if (!file) return;

        try {
            await uploadJsonFile(file);
            refreshData()
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'The selected JSON file could not be imported.');
        }
    };

    return <Overview
        formatAmount={formatAmount}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        viewAllHandler={() => onNavigate('Transactions')}
        transactionListItems={renderTransactions(recentTransactions)}
        // all transactions
        currentMonthTransactions={currentMonthTransactions}
        transactions={data.transactions}
        categories={data.categories}
        exportJSON={exportJSON}
        importJSON={importJSON}
    />
}

export default OverviewPage