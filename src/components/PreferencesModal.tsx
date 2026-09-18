import { useState } from 'react';
import { Preferences } from '../models';
import { defaultCurrencies } from '../utils/currency';
import ModalShell from './ModalShell';
import { useModal } from '../context/ModalContext';

interface PreferencesModalProps {
    preferences: Preferences;
    onSave: (preferences: Preferences) => void;
}

function PreferencesModal({ preferences, onSave }: PreferencesModalProps) {
    const { closeModal } = useModal()
    const [draft, setDraft] = useState(preferences);

    return (
        <ModalShell title="Preferences" onClose={closeModal}>
            <form className="form-grid preferences-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSave(draft);
                    closeModal()
                }}>
                <label className="wide-field">
                    Currency
                    <select
                        value={draft.currencySign}
                        onChange={(event) => setDraft({ ...draft, currencySign: event.target.value })}
                    >
                        {Object.entries(defaultCurrencies).map(([name, symbol]) => (
                            <option key={`${name}-${symbol}`} value={symbol}>{name} - {symbol}</option>
                        ))}
                    </select>
                </label>

                <label className="preference-switch">
                    <span>
                        <strong>Dark theme</strong>
                    </span>
                    <input
                        checked={draft.theme === 'dark'}
                        onChange={(event) => setDraft({ ...draft, theme: event.target.checked ? 'dark' : 'light' })}
                        type="checkbox"
                    />
                </label>

                <div className="modal-actions wide-field">
                    <button className="button button-secondary" onClick={closeModal} type="button">Cancel</button>
                    <button className="button button-primary" type="submit">Save</button>
                </div>
            </form>
        </ModalShell>
    );
}

export default PreferencesModal;