import { Transaction } from "../models";

interface TransactionListProps {
    transactions: Transaction[];
    accountName: (id: string) => string;
    categoryName: (id: string) => string;
    currency: string;
    onEdit: (item: Transaction) => void;
    onDelete: (id: string) => void
}

const formatDate = (date: string) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

function TransactionList({ transactions, accountName, categoryName, currency, onEdit, onDelete }: TransactionListProps) {
    return <div className="transaction-list">
        {transactions.map((transaction) => <div className="transaction-row" key={transaction.id}>
            <span className={transaction.type === 'income' ? 'transaction-symbol income' : 'transaction-symbol expense'}>
                {transaction.type === 'income' ? '+' : '-'}</span>
            <span className="transaction-main">
                <strong>{categoryName(transaction.categoryId)}</strong>
                <small>{accountName(transaction.accountId)} · {formatDate(transaction.date)}{transaction.notes ? ` · ${transaction.notes}` : ''}</small>
            </span>
            <strong className={transaction.type === 'income' ? 'amount income-text' : 'amount'}>
                {transaction.type === 'income' ? '+' : '-'}{currency}{transaction.amount.toFixed(2)}
            </strong>
            <button className="row-action" onClick={() => onEdit(transaction)} type="button">Edit</button>
            <button className="row-action danger" onClick={() => onDelete(transaction.id)} type="button">Delete</button>
        </div>)
        }
    </div>;
}

export default TransactionList;