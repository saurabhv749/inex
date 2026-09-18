import OptionsManager from "../components/OptionsManager";
import { Account, Category, FinanceData, OptionsType, OptionTitleType } from "../models";

interface OptionsManagerPageProps {
    kind: OptionsType;
    data: FinanceData;
    deleteAccount: (account: Account) => void;
    deleteCategory: (category: Category) => void;
}

function OptionsManagerPage({ kind, data, deleteAccount, deleteCategory }: OptionsManagerPageProps) {
    const isCategories = kind === 'categories';
    const title: OptionTitleType = isCategories ? 'Categories' : 'Accounts'
    const records = isCategories ? data.categories : data.accounts;

    // `save` functions are forwarded to the `OptionsManagerModal`
    const deleteFunction = (record: any) => isCategories ? deleteCategory(record) : deleteAccount(record)

    return <OptionsManager
        section={title}
        isCategories={isCategories}
        records={records}
        removeRecordHandler={deleteFunction}
    />
}

export default OptionsManagerPage