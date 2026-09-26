import { Transaction } from '../models';
import { formatMonth, getCurrentDate, getDayOfMonth, getDaysInMonth, getPreviousMonthStart, isSameMonth } from '../utils/dates';

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
const padding = { top: 16, right: 16, bottom: 24, left: 80 };
const plotWidth = chartWidth - padding.left - padding.right;
const plotHeight = chartHeight - padding.top - padding.bottom;

function getMonthSeries(transactions: Transaction[], date: Date, label: string): MonthSeries {
    const days = getDaysInMonth(date);
    const values = Array.from({ length: days }, () => 0);

    transactions
        .filter((item) => {
            return item.type === 'expense'
                && isSameMonth(item.date, date);
        })
        .forEach((item) => {
            const day = getDayOfMonth(item.date) - 1;
            values[day] += item.amount;
        });

    return { label, days, values, total: values.reduce((sum, value) => sum + value, 0) };
}

function DailySpendingComparison({ formatAmount, transactions }: DailySpendingComparisonProps) {
    const currentDate = getCurrentDate();
    const previousDate = getPreviousMonthStart(currentDate);
    const currentMonth = getMonthSeries(
        transactions,
        currentDate,
        formatMonth(currentDate),
    );
    const previousMonth = getMonthSeries(
        transactions,
        previousDate,
        formatMonth(previousDate),
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
