import { ReactNode } from "react";
import MetricCard from "./MetricCard";
import SectionHeading from "./SectionHeading";

interface OverviewProps {
    currency: string;
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
    viewAllHandler: () => void;
    transactionListItems: ReactNode;
}

function Overview({ currency, totalExpenses, totalIncome, transactionCount, viewAllHandler, transactionListItems }: OverviewProps) {

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

            <MetricCard label="Current balance" value={`${currency}${(totalIncome - totalExpenses).toFixed(2)}`} hint="Across all accounts" symbol="" />
            <MetricCard label="Income" value={`${currency}${totalIncome.toFixed(2)}`} hint="All recorded income" symbol="+" />
            <MetricCard label="Expenses" value={`${currency}${totalExpenses.toFixed(2)}`} hint="All recorded expenses" symbol="-" />

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
                        <span className="period-label">Now</span>
                    }
                />
                <div className="chart-placeholder">
                    <div className="chart-lines">
                        <span /><span /><span /><span />
                    </div>
                    <p>{
                        transactionCount ?
                            `${transactionCount} transaction${transactionCount === 1 ? '' : 's'} recorded.` :
                            <span> Start adding transactions<br />to see your rhythm.</span>
                    }</p>
                </div>
            </section>
        </div>
    )
}

export default Overview