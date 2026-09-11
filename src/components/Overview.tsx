import { ReactNode } from "react";
import MetricCard from "./MetricCard";
import SectionHeading from "./SectionHeading";
import MonthlyCashFlowChart from "./MonthlyCashFlowChart";
import ExpenseDonutChart from "./ExpenseDonutChart";
import DailySpendingComparison from "./DailySpendingComparison";
import { Category, Transaction } from "../models";

interface OverviewProps {
    currency: string;
    totalIncome: number;
    totalExpenses: number;
    viewAllHandler: () => void;
    transactionListItems: ReactNode;
    transactions: Transaction[];
    categories: Category[];
}

function Overview({
    currency,
    totalExpenses,
    totalIncome,
    viewAllHandler,
    transactionListItems,
    transactions,
    categories,
}: OverviewProps) {
    const expenseIncomeRatio = (totalExpenses / totalIncome).toFixed(2)
    const currentDate = new Date();
    const dailyAvgExpense = (totalExpenses / currentDate.getDate())
    const month = new Intl.DateTimeFormat('en', { month: "long", year: '2-digit' }).format()

    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthTransactions = transactions.filter((item) => item.date.slice(0, 7) === monthKey);


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
                value={`${currency}${totalIncome.toFixed(2)}`}
                observations={["All recorded income"]} symbol="+" />

            <MetricCard label="Expenses"
                value={`${currency}${totalExpenses.toFixed(2)}`} type="expense"
                observations={[`Expense/Income ratio: ${expenseIncomeRatio}`, `Average daily spending: ${currency}${dailyAvgExpense}`]} symbol="-" />

            <MetricCard label="Current balance" type="income"
                value={`${currency}${(totalIncome - totalExpenses).toFixed(2)}`} observations={["Your net cash flow across all accounts."]} symbol="" />

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
                <MonthlyCashFlowChart currency={currency} transactions={monthTransactions} />
            </section>

            <section className="insight-panel donut-panel">
                <SectionHeading eyebrow="Spending" title="Category mix"
                    action={
                        <span className="period-label">{month}</span>
                    }
                />
                <ExpenseDonutChart currency={currency} transactions={monthTransactions} categories={categories} />
            </section>
            {/* current + previous month transactions */}
            <DailySpendingComparison currency={currency} transactions={transactions} />
        </div>
    )
}

export default Overview