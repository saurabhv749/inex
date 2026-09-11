interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <label className="global-search">
            <span className="search-icon" aria-hidden="true">/</span>
            <span className="sr-only">Search transactions</span>
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search transactions..."
                aria-label="Search transactions"
            />
        </label>
    );
}

export default SearchBar;
