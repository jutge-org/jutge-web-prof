'use server'
// because fast-cvs does not work on the browser, we need to use it on the server side

import { writeToString } from '@fast-csv/format'
import { parseString } from '@fast-csv/parse'

export async function array2csv(data: any[]) {
    return await writeToString(data, {
        headers: true,
        delimiter: ',',
        quoteColumns: true,
    })
}

export interface CsvRow {
    [key: string]: string
}

function parse(csvString: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
        const results: CsvRow[] = []

        parseString(csvString, {
            headers: true,
            delimiter: ';',
        })
            .on('data', (row: CsvRow) => results.push(row))
            .on('end', () => resolve(results))
            .on('error', (error: Error) => reject(error))
    })
}

export async function csv2array(csvString: string): Promise<CsvRow[]> {
    return await parse(csvString)
}
