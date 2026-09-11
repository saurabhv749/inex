interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimal_digits: number;
    countries: string[];
}

interface AvailableCurrencies {
    [key: string]: string;
}

async function listCurrencies(): Promise<AvailableCurrencies> {
    try {
        const response = await fetch('https://jsonlint.com/datasets/currencies.json');
        const { currencies } = await response.json();
        const availableCurrencies = currencies.reduce((acc: any, currency: Currency) => {
            const key = `${currency.name} (${currency.code})`;
            acc[key] = currency.symbol;
            return acc;
        }, {});
        return availableCurrencies;

    } catch (error) {
        console.error('Error fetching currencies:', error);
        return { "Indian Rupee (INR)": "₹" }
    }
}