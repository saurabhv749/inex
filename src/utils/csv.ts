import { Transaction, TransactionType } from '../models';

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

export function importTransactionsCsv(csv: string): Transaction[] {
    const [headerRow, ...dataRows] = parseCsvRows(csv);
    if (!headerRow || headerRow.join(',') !== transactionHeaders.join(',')) {
        throw new Error('The selected CSV does not contain the expected transaction columns.');
    }

    return dataRows.map((row) => {
        if (row.length !== transactionHeaders.length || !['income', 'expense'].includes(row[3])) {
            throw new Error('The selected CSV contains an invalid transaction.');
        }

        const amount = Number(row[5]);
        if (!Number.isFinite(amount)) {
            throw new Error('The selected CSV contains an invalid amount.');
        }

        return {
            id: row[0],
            date: row[1],
            accountId: row[2],
            type: row[3] as TransactionType,
            categoryId: row[4],
            amount,
            notes: row[6],
            createdAt: row[7],
            updatedAt: row[8],
        };
    });
}
