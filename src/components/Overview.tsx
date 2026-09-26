import { ReactNode } from "react";
import MetricCard from "./MetricCard";
import SectionHeading from "./SectionHeading";
import MonthlyCashFlowChart from "./MonthlyCashFlowChart";
import ExpenseDonutChart from "./ExpenseDonutChart";
import DailySpendingComparison from "./DailySpendingComparison";
import { Category, Transaction } from "../models";
import { formatMonth, getCurrentDate } from "../utils/dates";

interface OverviewProps {
    totalIncome: number;
    totalExpenses: number;
    viewAllHandler: () => void;
    transactionListItems: ReactNode;
    transactions: Transaction[];
    currentMonthTransactions: Transaction[];
    categories: Category[];
    exportJSON: () => void;
    importJSON: () => void;
    formatAmount: (amount: number) => string;
}

function Overview({
    totalExpenses,
    totalIncome,
    viewAllHandler,
    transactionListItems,
    transactions,
    currentMonthTransactions,
    categories,
    exportJSON,
    importJSON,
    formatAmount
}: OverviewProps) {
    const expenseIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome).toFixed(2) : "Undefined"
    const currentDate = getCurrentDate();
    const dailyAvgExpense = (totalExpenses / currentDate.getDate())
    const month = formatMonth(currentDate, true);

    return (
        <div className="content-grid">
            <section className="welcome-panel">
                <div>
                    <p className="eyebrow">Personal finance</p>
                    <h2>Make every rupee<br />feel accounted for.</h2>
                    <p className="panel-copy">Your financial picture, kept simple and clear.</p>
                </div>
                <div className="panel-accent" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                </div>
            </section>
            <MetricCard label=""
                value={`Metrices for ${month}`}
                observations={[]} symbol="" />

            <MetricCard label="Income" type="income"
                value={formatAmount(totalIncome)}
                observations={["All recorded income"]} symbol="+" />

            <MetricCard label="Expenses"
                value={formatAmount(totalExpenses)} type="expense"
                observations={[`Expense/Income ratio: ${expenseIncomeRatio}`, `Average daily spending: ${formatAmount(dailyAvgExpense)}`]} symbol="-" />

            <MetricCard label="Current balance" type="income"
                value={formatAmount(totalIncome - totalExpenses)} observations={["Your net cash flow across all accounts."]} symbol="" />

            {/* recent transactions */}
            <section className="activity-panel">
                <SectionHeading eyebrow="Your money trail" title="Recent transactions"
                    action={
                        <button className="text-button"
                            onClick={viewAllHandler}
                            type="button">View all -&gt;</button>
                    } />

                {
                    transactionListItems
                }
            </section>

            <section className="insight-panel">
                <SectionHeading eyebrow="At a glance" title="Monthly rhythm"
                    action={
                        <span className="period-label">{month}</span>
                    }
                />
                {/* current month transactions */}
                <MonthlyCashFlowChart formatAmount={formatAmount} transactions={currentMonthTransactions} />
            </section>

            <section className="insight-panel donut-panel">
                <SectionHeading eyebrow="Spending" title="Category mix"
                    action={
                        <span className="period-label">{month}</span>
                    }
                />
                {/* current month transactions */}
                <ExpenseDonutChart formatAmount={formatAmount} transactions={currentMonthTransactions} categories={categories} />
            </section>
            {/* current + previous month transactions */}
            <DailySpendingComparison formatAmount={formatAmount} transactions={transactions} />
            <section className="export-import">
                <span className="row-spacer">Download or upload app data in `json` format.</span>
                <div>
                    <button type="button" className="button button-primary" onClick={exportJSON}>Export data</button>
                    <button type="button" className="button button-secondary" onClick={importJSON}>Import data</button>
                </div>
            </section>
        </div>
    )
}

export default Overview