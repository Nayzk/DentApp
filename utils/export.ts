
// A generic function to convert an array of objects to a CSV string.
export function jsonToCsv<T extends object>(data: T[]): string {
    if (data.length === 0) {
        return '';
    }

    // Use a Set to get unique headers in case objects have different properties
    const headersSet = new Set<string>();
    data.forEach(item => Object.keys(item).forEach(key => headersSet.add(key)));
    const headers = Array.from(headersSet);

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            // Handle nested objects (like 'items' in Sales) by stringifying them
            const value = (row as any)[header];
            let cellValue = '';
            if (value === null || value === undefined) {
                cellValue = '';
            } else if (typeof value === 'object') {
                cellValue = JSON.stringify(value);
            } else {
                cellValue = String(value);
            }
            
            // Escape double quotes and wrap in double quotes
            const escaped = cellValue.replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// Triggers a browser download for a CSV string.
export function downloadCsv(csvString: string, filename: string): void {
    // Add BOM for Excel to recognize UTF-8
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Helper to create a filename with the current date
export const createExportFilename = (prefix: string): string => {
    const date = new Date();
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return `${prefix}-export-${dateString}.csv`;
}