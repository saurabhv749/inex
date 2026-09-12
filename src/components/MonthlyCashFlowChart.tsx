import { Transaction } from '../models';

interface MonthlyCashFlowChartProps {
    formatAmount: (amount: number) => string;
    transactions: Transaction[];
}

function MonthlyCashFlowChart({ formatAmount, transactions }: MonthlyCashFlowChartProps) {

    const income = transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const expense = transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

    const saving = Math.max(income - expense, 0);

    if (!income && !expense) {
        return (
            <div className="empty-chart-state">
                <div className="empty-mark">+</div>
                <p>Add income and expense entries to see this month’s balance.</p>
            </div>
        );
    }

    const total = Math.max(income, expense || income, 1);
    const expenseShare = ((expense / total) * 100).toFixed(1);
    const savingShare = ((saving / total) * 100).toFixed(1);

    return (
        <div className="cashflow-panel">
            <div className="cashflow-visual">
                <div className="cashflow-bar" aria-label="Income equals savings plus expenses">
                    <div className="cashflow-stack">
                        {expense > 0 && (
                            <span
                                className="cashflow-segment expense-segment"
                                style={{ height: `${Math.max((expense / total) * 100, 12)}%` }}
                                title={`Expenses ${formatAmount(expense)}`}
                            />
                        )}
                        {saving > 0 && (
                            <span
                                className="cashflow-segment saving-segment"
                                style={{ height: `${Math.max((saving / total) * 100, 12)}%` }}
                                title={`Savings ${formatAmount(saving)}`}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="cashflow-summary">
                <div className="cashflow-total-row">
                    <span className="legend-dot income-dot" />
                    <span>Income</span>
                    <em>{formatAmount(income)}</em>
                </div>
                <div className="cashflow-total-row">
                    <span className="legend-dot expense-dot" />
                    <span>Expense ({expenseShare}%)</span>
                    <em>{formatAmount(expense)}</em>
                </div>
                <br />
                <div className="cashflow-total-row">
                    <span className="legend-dot saving-dot" />
                    <span>Saved ({savingShare}%)</span>
                    <em>{formatAmount(saving)}</em>
                </div>
            </div>
        </div>
    );
}

export default MonthlyCashFlowChart;
