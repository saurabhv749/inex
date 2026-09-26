import { useState } from "react";
import { getCurrentMonthStartInputValue, getDateInputValue } from "../utils/dates";

export function useTransactionFilters() {

    const [typeFilter, setTypeFilter] = useState('');
    const [accountFilter, setAccountFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [fromDate, setFromDate] = useState(() => getCurrentMonthStartInputValue());
    const [toDate, setToDate] = useState(() => getDateInputValue());

    const resetFilters = () => {
        setTypeFilter('');
        setAccountFilter('');
        setCategoryFilter('');
        setFromDate(getCurrentMonthStartInputValue());
        setToDate(getDateInputValue());
    }

    return { resetFilters, typeFilter, setTypeFilter, accountFilter, setAccountFilter, categoryFilter, setCategoryFilter, fromDate, setFromDate, toDate, setToDate };
}