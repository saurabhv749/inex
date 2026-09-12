import { Transaction, TransactionType } from '../models';
import { loadFinanceData, saveFinanceData } from './storage'

const transactionHeaders = [
    'id',
    'date',
    'accountId',
    'type',
    'categoryId',
    'amount',
    'notes',
    'createdAt',
    'updatedAt',
] as const;

function escapeCsvValue(value: string | number): string {
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsvRows(csv: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = '';
    let inQuotes = false;

    for (let index = 0; index < csv.length; index += 1) {
        const character = csv[index];
        const nextCharacter = csv[index + 1];

        if (character === '"' && inQuotes && nextCharacter === '"') {
            value += '"';
            index += 1;
        } else if (character === '"') {
            inQuotes = !inQuotes;
        } else if (character === ',' && !inQuotes) {
            row.push(value);
            value = '';
        } else if ((character === '\n' || character === '\r') && !inQuotes) {
            if (character === '\r' && nextCharacter === '\n') index += 1;
            row.push(value);
            if (row.some((cell) => cell !== '')) rows.push(row);
            row = [];
            value = '';
        } else {
            value += character;
        }
    }

    row.push(value);
    if (row.some((cell) => cell !== '')) rows.push(row);
    return rows;
}

export function exportTransactionsCsv(transactions: Transaction[]): string {
    const rows = transactions.map((transaction) =>
        transactionHeaders.map((header) => escapeCsvValue(transaction[header])),
    );

    return [transactionHeaders.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function importTransactionsCsv(csv: string): boolean {
    const [headerRow, ...dataRows] = parseCsvRows(csv);
    if (!headerRow || headerRow.join(',') !== transactionHeaders.join(',')) {
        throw new Error('The selected CSV does not contain the expected transaction columns.');
    }

    const { accounts, categories, transactions, preferences } = loadFinanceData();
    const importedTransactions: Transaction[] = [];
    const importedAccountIds = new Set<string>();
    const transactionIds = new Set(transactions.map((transaction) => transaction.id));

    dataRows.forEach((row) => {
        if (row.length !== transactionHeaders.length || !['income', 'expense'].includes(row[3])) {
            throw new Error('The selected CSV contains an invalid transaction.');
        }

        if (transactionIds.has(row[0])) {
            return; // no duplicate transaction
        }

        const accountId = row[2];
        const categoryId = row[4];
        const accountExists = accounts.some((account) => account.id === accountId);
        const accountAlreadyImported = importedAccountIds.has(accountId);
        const category = categories.find((item) => item.id === categoryId);
        const transactionType = row[3] as TransactionType;

        // insert new account or categories
        if (!accountExists && !accountAlreadyImported) {
            accounts.push({ id: accountId, name: accountId, icon: 'landmark' });
            importedAccountIds.add(accountId);
        }

        if (!category) {
            categories.push({
                id: categoryId,
                name: categoryId,
                icon: 'tag',
                type: transactionType,
            });
        }

        const amount = Number(row[5]);
        if (!Number.isFinite(amount)) {
            throw new Error('The selected CSV contains an invalid amount.');
        }

        const transaction = {
            id: row[0],
            date: row[1],
            accountId: row[2],
            type: transactionType,
            categoryId: row[4],
            amount,
            notes: row[6],
            createdAt: row[7],
            updatedAt: row[8],
        };
        transactionIds.add(transaction.id);
        importedTransactions.push(transaction);
    });

    // save updated
    saveFinanceData({
        transactions: [...transactions, ...importedTransactions],
        accounts,
        categories,
        preferences,
    });
    return true;
}
