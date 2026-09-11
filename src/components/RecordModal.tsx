import { useState } from "react";
import ModalShell from "./ModalShell";

interface RecordModalProps {
    title: string;
    label: string;
    isCategory: boolean;
    onClose: () => void;
    onSubmit: (name: string, icon: string, type: string) => void;
}

function RecordModal({ title, label, onClose, onSubmit, isCategory }: RecordModalProps) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [categoryType, setCategoryType] = useState('expense');

    return (
        <ModalShell title={title} onClose={onClose}>
            <form
                className="form-grid"
                onSubmit={(event) => { event.preventDefault(); onSubmit(name, icon, categoryType); }}>
                {isCategory && <select name="type"
                    defaultValue={categoryType} className="wide-field"
                    onChange={e => setCategoryType(e.target.value)}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                }
                <label className="wide-field">{label}
                    <input
                        autoFocus required
                        value={name}
                        onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="wide-field">Icon name
                    <input
                        placeholder="wallet, food, home..."
                        value={icon}
                        onChange={(event) => setIcon(event.target.value)} />
                </label>
                <div className="modal-actions wide-field">
                    <button
                        className="button button-secondary"
                        onClick={onClose} type="button">
                        Cancel
                    </button>
                    <button
                        className="button button-primary"
                        type="submit">Create
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}

export default RecordModal;