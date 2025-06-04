'use server'

// because fast-cvs does not work on the browser, we need to use it on the server side

import { writeToString } from '@fast-csv/format'

export async function array2csv(data: any[]) {
    return await writeToString(data, {
        headers: true,
        delimiter: ',',
        quoteColumns: true,
    })
}
