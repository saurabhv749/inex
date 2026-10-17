import { useState } from 'react';
import { ColorTheme, Preferences } from '../models';
import { defaultCurrencies } from '../utils/currency';
import ModalShell from './ModalShell';
import { useModal } from '../context/ModalContext';

const colorThemes: { value: ColorTheme; label: string; swatch: string }[] = [
    { value: 'forest', label: 'Forest', swatch: '#26754f' },
    { value: 'ocean', label: 'Ocean', swatch: '#1e5a96' },
    { value: 'sunset', label: 'Sunset', swatch: '#d97706' },
    { value: 'berry', label: 'Berry', swatch: '#7c3aed' },
    { value: 'slate', label: 'Slate', swatch: '#4b5563' },
    { value: 'emerald', label: 'Emerald', swatch: '#0d9488' },
];

interface PreferencesModalProps {
    preferences: Preferences;
    onSave: (preferences: Preferences) => void;
}

function PreferencesModal({ preferences, onSave }: PreferencesModalProps) {
    const { closeModal } = useModal()
    const [draft, setDraft] = useState(preferences);
    const [apiKey, setApiKey] = useState('')

    return (
        <ModalShell title="Preferences" onClose={closeModal}>
            <form className="form-grid preferences-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSave(draft);
                    closeModal()
                    if (apiKey.length) {
                        localStorage.setItem('GEMINI_API_KEY', apiKey)
                        alert('✅ GEMINI API Key updated.')
                    }
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

                <fieldset className="wide-field theme-picker">
                    <legend>Color theme</legend>
                    <div className="theme-options">
                        {colorThemes.map(({ value, label, swatch }) => (
                            <label className="theme-option" key={value}>
                                <input
                                    checked={(draft.colorTheme ?? 'forest') === value}
                                    name="colorTheme"
                                    onChange={() => setDraft({ ...draft, colorTheme: value })}
                                    type="radio"
                                    value={value}
                                />
                                <span className="theme-swatch" style={{ backgroundColor: swatch }} aria-hidden="true" />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="wide-field">GEMINI API key
                    <input
                        name='gemini api key'
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder='Paste your Google AI studio API key here to update....'
                        autoComplete='off'
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