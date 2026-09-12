import { Transaction } from '../models';

interface DailySpendingComparisonProps {
    formatAmount: (amount: number) => string;
    transactions: Transaction[];
}

interface MonthSeries {
    label: string;
    days: number;
    values: number[];
    total: number;
}

const chartWidth = 760;
const chartHeight = 250;
const padding = { top: 20, right: 18, bottom: 34, left: 42 };
const plotWidth = chartWidth - padding.left - padding.right;
const plotHeight = chartHeight - padding.top - padding.bottom;

function getMonthSeries(transactions: Transaction[], date: Date, label: string): MonthSeries {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const values = Array.from({ length: days }, () => 0);

    transactions
        .filter((item) => {
            const itemDate = new Date(item.date);
            return item.type === 'expense'
                && itemDate.getFullYear() === year
                && itemDate.getMonth() === month;
        })
        .forEach((item) => {
            const day = new Date(item.date).getDate() - 1;
            values[day] += item.amount;
        });

    return { label, days, values, total: values.reduce((sum, value) => sum + value, 0) };
}

function DailySpendingComparison({ formatAmount, transactions }: DailySpendingComparisonProps) {
    const currentDate = new Date();
    const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonth = getMonthSeries(
        transactions,
        currentDate,
        new Intl.DateTimeFormat('en', { month: 'long' }).format(currentDate),
    );
    const previousMonth = getMonthSeries(
        transactions,
        previousDate,
        new Intl.DateTimeFormat('en', { month: 'long' }).format(previousDate),
    );
    const visibleDays = Math.max(currentMonth.days, previousMonth.days);
    const maxValue = Math.max(...currentMonth.values, ...previousMonth.values, 1);
    const x = (day: number) => padding.left + (day / (visibleDays - 1)) * plotWidth;
    const y = (value: number) => padding.top + plotHeight - (value / maxValue) * plotHeight;
    const points = (values: number[]) => values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
    const tickValues = [0, maxValue / 2, maxValue];
    const hasSpending = currentMonth.total > 0 || previousMonth.total > 0;

    return (
        <section className="comparison-panel">
            <div className="comparison-heading">
                <div>
                    <p className="eyebrow">Daily view</p>
                    <h2>Spending comparison</h2>
                    <p className="comparison-copy">Daily expenses compared by calendar day.</p>
                </div>
                <div className="comparison-legend" aria-label="Chart legend">
                    <span><i className="legend-line current-line" />{currentMonth.label} {currentDate.getFullYear()}</span>
                    <span><i className="legend-line previous-line" />{previousMonth.label} {previousDate.getFullYear()}</span>
                </div>
            </div>

            {!hasSpending ? (
                <div className="empty-chart-state comparison-empty">
                    <div className="empty-mark">+</div>
                    <p>Add expenses in this month or last month to compare daily spending.</p>
                </div>
            ) : (
                <div className="comparison-chart-wrap">
                    <svg className="comparison-chart"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        role="img" aria-label="Daily spending comparison for the current and previous month">
                        {tickValues.map((tick) => (
                            <g key={tick}>
                                <line className="chart-grid-line" x1={padding.left} x2={chartWidth - padding.right} y1={y(tick)} y2={y(tick)} />
                                <text className="chart-axis-label" x={padding.left - 10} y={y(tick) + 4} textAnchor="end">
                                    {formatAmount(Math.round(tick))}
                                </text>
                            </g>
                        ))}
                        <polyline className="comparison-line previous-line-stroke" points={points(previousMonth.values)} />
                        <polyline className="comparison-line current-line-stroke" points={points(currentMonth.values)} />

                        {[1, 8, 15, 22, visibleDays].map((day) => (
                            <text key={day} className="chart-axis-label" x={x(day - 1)} y={chartHeight - 8} textAnchor="middle">
                                {day}
                            </text>
                        ))}
                    </svg>
                </div>
            )}

            <div className="comparison-summary">
                <span><strong>{formatAmount(currentMonth.total)}</strong> spent in {currentMonth.label}</span>
                <br />
                <span><strong>{formatAmount(previousMonth.total)}</strong> spent in {previousMonth.label}</span>
            </div>
        </section>
    );
}

export default DailySpendingComparison;
