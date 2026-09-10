import { ReactNode } from "react";
import SectionHeading from "./SectionHeading";


interface TransactionsProps {
    addTransactionHandler: () => void;
    transactionListItems: ReactNode;
}

function Transactions({ addTransactionHandler, transactionListItems }: TransactionsProps) {
    return (
        <section className="page-panel">
            <SectionHeading
                eyebrow="Money trail"
                title="Transactions"
                action={
                    <button className="button button-primary"
                        onClick={addTransactionHandler}
                        type="button">+ Add transaction
                    </button>
                }
            />

            {
                transactionListItems
            }
        </section>)
}

export default Transactions