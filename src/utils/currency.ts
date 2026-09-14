interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimal_digits: number;
}

const CURRENCIES: Currency[] = [
    {
        code: "INR", name: "Indian Rupee", symbol: "₹", decimal_digits: 2,
    },
    {
        code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2,
    },
    {
        code: "EUR", name: "Euro", symbol: "€", decimal_digits: 2,
    },
    {
        code: "GBP", name: "British Pound", symbol: "£", decimal_digits: 2,
    },
    {
        code: "JPY", name: "Japanese Yen", symbol: "¥", decimal_digits: 0,
    },
    {
        code: "CHF", name: "Swiss Franc", symbol: "CHF", decimal_digits: 2,
    },
    {
        code: "AUD", name: "Australian Dollar", symbol: "A$", decimal_digits: 2,
    },
    {
        code: "CAD", name: "Canadian Dollar", symbol: "C$", decimal_digits: 2,
    },
    {
        code: "CNY", name: "Chinese Yuan", symbol: "CN¥", decimal_digits: 2,
    },
    {
        code: "MXN", name: "Mexican Peso", symbol: "$", decimal_digits: 2,
    },
    {
        code: "BRL", name: "Brazilian Real", symbol: "R$", decimal_digits: 2,
    },
    {
        code: "KRW", name: "South Korean Won", symbol: "₩", decimal_digits: 0,
    },
    {
        code: "SGD", name: "Singapore Dollar", symbol: "S$", decimal_digits: 2,
    },
    {
        code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimal_digits: 2,
    },
    {
        code: "NOK", name: "Norwegian Krone", symbol: "kr", decimal_digits: 2,
    },
    {
        code: "SEK", name: "Swedish Krona", symbol: "kr", decimal_digits: 2,
    },
    {
        code: "DKK", name: "Danish Krone", symbol: "kr", decimal_digits: 2,
    },
    {
        code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimal_digits: 2,
    },
    {
        code: "ZAR", name: "South African Rand", symbol: "R", decimal_digits: 2,
    },
    {
        code: "RUB", name: "Russian Ruble", symbol: "₽", decimal_digits: 2,
    },
    {
        code: "TRY", name: "Turkish Lira", symbol: "₺", decimal_digits: 2,
    },
    {
        code: "PLN", name: "Polish Zloty", symbol: "zł", decimal_digits: 2,
    },
    {
        code: "THB", name: "Thai Baht", symbol: "฿", decimal_digits: 2,
    },
    {
        code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", decimal_digits: 0,
    },
    {
        code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimal_digits: 2,
    },
    {
        code: "PHP", name: "Philippine Peso", symbol: "₱", decimal_digits: 2,
    },
    {
        code: "CZK", name: "Czech Koruna", symbol: "Kč", decimal_digits: 2,
    },
    {
        code: "ILS", name: "Israeli Shekel", symbol: "₪", decimal_digits: 2,
    },
    {
        code: "AED", name: "UAE Dirham", symbol: "د.إ", decimal_digits: 2,
    },
    {
        code: "SAR", name: "Saudi Riyal", symbol: "﷼", decimal_digits: 2,
    }
]

interface CurrencyMapping {
    [key: string]: string | number;
}
const defaultCurrencies: CurrencyMapping = {}
const currencyDecimalPlaces: CurrencyMapping = {}

for (let i = 0; i < CURRENCIES.length; i++) {
    const currency = CURRENCIES[i]
    const key = `${currency.name} (${currency.code})`
    defaultCurrencies[key] = currency.symbol
    currencyDecimalPlaces[currency.symbol] = currency.decimal_digits
}

export { defaultCurrencies, currencyDecimalPlaces }