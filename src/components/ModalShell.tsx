import { ReactNode } from "react";

interface ModalShellProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
}
function ModalShell({ title, onClose, children }: ModalShellProps) {
    return <div className="modal-backdrop">
        <section aria-labelledby="modal-title" aria-modal="true" className="modal" role="dialog">
            <div className="modal-header">
                <h2 id="modal-title">{title}</h2>
                <button aria-label="Close" className="modal-close"
                    onClick={onClose} type="button">×</button>
            </div>{children}
        </section>
    </div>;
}

export default ModalShell