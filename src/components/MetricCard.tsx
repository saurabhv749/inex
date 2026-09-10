interface MetricCardProps {
    label: string;
    value: string;
    hint: string;
    symbol: string;
}

function MetricCard({ label, value, hint, symbol }: MetricCardProps) {
    return (
        <section className="metric-card">
            <div className="card-heading">
                <span>{label}</span>
                <span className="metric-symbol">{symbol}</span>
            </div>
            <strong>{value}</strong>
            <p className="muted-copy">{hint}</p>
        </section>
    )
}

export default MetricCard;