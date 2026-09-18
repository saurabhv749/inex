import { ChangeEvent } from "react";
import { View } from "../models";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    changeView: (view: View) => void;
}

function SearchBar({ changeView, searchQuery, setSearchQuery }: SearchBarProps) {

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchQuery(value);
        if (value.trim().length >= 1) changeView('Transactions');
    }
    return (
        <label className="global-search">
            <span className="search-icon" aria-hidden="true">/</span>
            <span className="sr-only">Search transactions</span>
            <input
                type="search"
                value={searchQuery}
                onChange={handleChange}
                placeholder="Search transactions..."
                aria-label="Search transactions"
            />
        </label>
    );
}

export default SearchBar;
