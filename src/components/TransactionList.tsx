import { useState } from "react";
import { Transaction } from "../models";

interface TransactionListProps {
    transactions: Transaction[];
    accountName: (id: string) => string;
    categoryName: (id: string) => string;
    onEdit: (item: Transaction) => void;
    onDelete: (id: string) => void;
    formatAmount: (amount: number) => string;
}

const formatDate = (date: string) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

function TransactionList({ transactions, accountName, categoryName, onEdit, onDelete, formatAmount }: TransactionListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    return <div className="transaction-list"
    >
        {
            transactions.map((transaction) => {

                const isExpanded = transaction.id === expandedId
                return <div key={transaction.id} className="transaction-wrapper"
                    onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
                >
                    <div className="transaction-row">
                        <span className={transaction.type === 'income' ? 'transaction-symbol income' : 'transaction-symbol expense'}>
                            {transaction.type === 'income' ? '+' : '-'}</span>
                        <span className="transaction-main">
                            <strong>{categoryName(transaction.categoryId)}</strong>
                            <small>{accountName(transaction.accountId)} · {formatDate(transaction.date)}{transaction.notes ? ` · ${transaction.notes}` : ''}</small>
                        </span>
                        <strong className={transaction.type === 'income' ? 'amount income-text' : 'amount expense-text'}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatAmount(transaction.amount)}
                        </strong>
                    </div>
                    <div className={`mobile-collapsible ${isExpanded ? "open" : ""}`}>
                        <button className="row-action" onClick={() => onEdit(transaction)} type="button">Edit</button>
                        <button className="row-action danger" onClick={() => onDelete(transaction.id)} type="button">Delete</button>
                    </div>
                </div>
            })
        }
    </div>;
}

export default TransactionList;