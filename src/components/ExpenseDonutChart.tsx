import { Category, Transaction } from '../models';

interface ExpenseDonutChartProps {
    currency: string;
    transactions: Transaction[];
    categories: Category[];
}

const donutPalette = ['#5c8c6c', '#7bbf9d', '#a9d8bb', '#d0edd7', '#f3c7a9', '#d18a62', '#f4e1cb'];

function ExpenseDonutChart({ currency, transactions, categories }: ExpenseDonutChartProps) {
    const categoryTotals = new Map<string, number>();

    transactions
        .filter((item) => item.type === 'expense')
        .forEach((item) => {
            const current = categoryTotals.get(item.categoryId) ?? 0;
            categoryTotals.set(item.categoryId, current + item.amount);
        });

    const items = Array.from(categoryTotals.entries())
        .map(([categoryId, value]) => {
            const category = categories.find((item) => item.id === categoryId);
            return {
                id: categoryId,
                name: category?.name ?? 'Uncategorized',
                value,
            };
        })
        .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);
    const expensePercentage = (amount: number): string => (amount / total * 100).toFixed(1) + "%"

    if (!total) {
        return (
            <div className="empty-chart-state">
                <div className="empty-mark">+</div>
                <p>No expense categories yet. Add a transaction to populate the chart.</p>
            </div>
        );
    }

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="donut-layout">
            <div className="donut-card">
                <svg className="donut-svg" viewBox="0 0 150 150" role="img" aria-label="Expense category donut chart">
                    <circle cx="75" cy="75" r={radius} fill="none" stroke="var(--surface-muted)" strokeWidth="18" />
                    {items.map((item, index) => {
                        const segmentLength = (item.value / total) * circumference;
                        const dashArray = `${segmentLength} ${circumference - segmentLength}`;
                        const dashOffset = -offset;
                        offset += segmentLength;

                        return (
                            <circle
                                key={item.id}
                                cx="75"
                                cy="75"
                                r={radius}
                                fill="none"
                                stroke={donutPalette[index % donutPalette.length]}
                                strokeWidth="18"
                                strokeLinecap="round"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 75 75)"
                            />
                        );
                    })}
                    <text x="75" y="68" textAnchor="middle" className="donut-total-label">Total</text>
                    <text x="75" y="90" textAnchor="middle" className="donut-total-value">{currency}{total.toFixed(2)}</text>
                </svg>
            </div>

            <div className="expense-legend">
                {items.map((item, index) => (
                    <div key={item.id} className="expense-legend-item">
                        <span className="legend-dot" style={{ background: donutPalette[index % donutPalette.length] }} />
                        <span className="legend-name">{item.name} ({expensePercentage(item.value)})</span>
                        <em>{currency}{item.value.toFixed(2)}</em>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExpenseDonutChart;
