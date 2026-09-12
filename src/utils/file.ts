import { FinanceData } from '../models';
import { exportTransactionsCsv, importTransactionsCsv } from './csv';
import { exportFinanceData, importFinanceData } from './storage';

const fileMimeTypes = {
    json: 'application/json;charset=utf-8',
    csv: 'text/csv;charset=utf-8',
} as const;
type FileType = "json" | "csv"

function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('The selected file could not be read.'));
        reader.onabort = () => reject(new Error('Reading the selected file was cancelled.'));
        reader.readAsText(file);
    });
}

export function selectImportFile(accept: FileType): Promise<File | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept == "csv" ? '.csv,text/csv' : ".json,application/json";
        input.hidden = true;

        const cleanup = () => {
            input.remove();
        };

        input.onchange = () => {
            const file = input.files?.[0] ?? null;
            cleanup();
            resolve(file);
        };
        input.oncancel = () => {
            cleanup();
            resolve(null);
        };

        document.body.appendChild(input);
        input.click();
    });
}

// Download
export function downloadTextFile(
    content: string,
    filename: string,
    mimeType: string,
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadJsonFile(data: FinanceData, filename = 'InEx-finance-tracker.json'): void {
    downloadTextFile(exportFinanceData(data), filename, fileMimeTypes.json);
}

export function downloadTransactionsCsv(
    transactions: Parameters<typeof exportTransactionsCsv>[0],
    filename = 'transactions.csv',
): void {
    downloadTextFile(exportTransactionsCsv(transactions), filename, fileMimeTypes.csv);
}

// Uploads
export async function uploadJsonFile(file: File): Promise<boolean> {
    return importFinanceData(await readFileAsText(file));
}

export async function uploadTransactionsCsv(file: File): Promise<boolean> {
    return importTransactionsCsv(await readFileAsText(file));
}
