function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="empty-state">
            <div className="empty-mark" aria-hidden="true">+</div>
            <h3>No transactions yet</h3>
            <p>Add your first transaction to start seeing your financial picture.</p>
            <button
                className="button button-secondary"
                onClick={onAdd}
                type="button">
                Add first transaction
            </button>
        </div>
    )
}

export default EmptyState