import { SubmitEvent } from "react";
import { TransactionType, Transaction, Account, Category } from "../models";
import ModalShell from "./ModalShell";


interface TransactionModalProps {
    draft: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
    setDraft: (draft: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
    accounts: Account[];
    categories: Category[];
    error: string;
    editing: boolean;
    onClose: () => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}

function TransactionModal({
    draft, setDraft, accounts, categories, error, editing, onClose, onSubmit }: TransactionModalProps
) {

    return <ModalShell
        title={editing ? 'Edit transaction' : 'Add transaction'}
        onClose={onClose}>
        <form className="form-grid" onSubmit={onSubmit}>
            <label>Date and time
                <input required type="datetime-local" value={draft.date}
                    onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
            </label>
            <label>Type
                <select value={draft.type}
                    onChange={(event) => setDraft({ ...draft, type: event.target.value as TransactionType })}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </label>
            <label>Account
                <select required value={draft.accountId}
                    onChange={(event) => setDraft({ ...draft, accountId: event.target.value })}>
                    <option value="">Select account</option>
                    {
                        accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)
                    }
                </select>
            </label>

            <label>Category
                <select required value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
                    <option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
            </label>
            <label className="wide-field">Amount
                <input required min="0.01" step="0.01" type="number" value={draft.amount || ''} onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })} />
            </label>
            <label className="wide-field">Notes
                <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Optional context, such as lending or repayment" />
            </label>
            {/* error */}
            {error && <p className="form-error wide-field">{error}</p>}

            <div className="modal-actions wide-field">
                <button className="button button-secondary" onClick={onClose} type="button">Cancel</button>
                <button className="button button-primary" type="submit">{editing ? 'Save changes' : 'Add transaction'}</button>
            </div>
        </form>
    </ModalShell>;
}


export default TransactionModal;