import { Account, Category } from "../models";
import SectionHeading from "./SectionHeading";

interface OptionsManagerProps {
    section: string;
    records: Account[] | Category[];
    addHandler: () => void;
    addRecordHandler: () => void;
    removeRecordHandler: (record: Account | Category) => void;
    recordError: string
}

function OptionsManager({ section, records, recordError, addHandler, addRecordHandler, removeRecordHandler }: OptionsManagerProps) {
    const types = ["expense", "income"]
    let groupedRecords: (Account | Category)[] = []

    const isCategories = section.toLowerCase() === "categories"
    if (isCategories) {
        types.forEach(categoryType => {
            (records as Category[]).forEach(record => { if (record.type === categoryType) groupedRecords.push(record) })
        })
    }
    else
        groupedRecords = records as Account[]


    return (
        <section className="page-panel">
            <SectionHeading eyebrow="Manage" title={section}
                action={<button
                    className="button button-primary"
                    onClick={addHandler}
                    type="button">+ Add {section.toLowerCase()}
                </button>
                }
            />
            {recordError && <p className="form-error">{recordError}</p>}
            <div className="manage-list">
                {records.length === 0 ? (
                    <div className="manager-empty"><p>No {section.toLowerCase()} yet.</p>
                        <button className="button button-secondary"
                            onClick={addRecordHandler}
                            type="button">Create your first
                        </button>
                    </div>
                ) : groupedRecords.map((record) => (
                    <div className="manage-row" key={record.id}>
                        <span className={"record-icon " + (isCategories ? (record as Category).type : "")}>
                            {record.name.charAt(0).toUpperCase()}
                        </span>
                        <strong>{record.name}</strong>
                        <span className="row-spacer" />
                        <button
                            className="row-action"
                            onClick={() => removeRecordHandler(record)}
                            type="button">
                            Delete
                        </button>
                    </div>
                )
                )
                }
            </div>
        </section>
    )
}

export default OptionsManager