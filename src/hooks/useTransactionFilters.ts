import { useState } from "react";

const dateInputValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function useTransactionFilters() {

    const [typeFilter, setTypeFilter] = useState('');
    const [accountFilter, setAccountFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [fromDate, setFromDate] = useState(() => dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [toDate, setToDate] = useState(() => dateInputValue(new Date()));

    const resetFilters = () => {
        setTypeFilter('');
        setAccountFilter('');
        setCategoryFilter('');
        setFromDate(dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
        setToDate(dateInputValue(new Date()));
    }

    return { resetFilters, typeFilter, setTypeFilter, accountFilter, setAccountFilter, categoryFilter, setCategoryFilter, fromDate, setFromDate, toDate, setToDate };
}