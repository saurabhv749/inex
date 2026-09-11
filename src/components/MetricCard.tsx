type metricType = 'income' | 'expense' | '';

interface MetricCardProps {
    label: string;
    value: string;
    observations: string[];
    symbol: string;
    type?: metricType;
}

function MetricCard({ label, value, observations, symbol, type = "" }: MetricCardProps) {
    return (
        <section className={`metric-card ${type}`}>
            <div className="card-heading">
                <span>{label}</span>
                <span className="metric-symbol">{symbol}</span>
            </div>
            <strong>{value}</strong>
            {
                observations.map((observation, id) => <p key={`obs_${id}`} className="muted-copy">{observation}</p>)
            }
        </section>
    )
}

export default MetricCard;