import { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from '../models';

interface ModalContextType {
    modal: Modal;
    setModal: (modal: Modal) => void;
    recordError: string;
    setRecordError: (error: string) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<Modal>(null);
    const [recordError, setRecordError] = useState('');

    function closeModal() {
        setModal(null);
        setRecordError('');
    }

    return (
        <ModalContext.Provider value={{
            modal,
            recordError,
            setModal,
            setRecordError,
            closeModal
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
}