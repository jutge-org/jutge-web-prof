import { clsx, type ClassValue } from 'clsx'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { Download } from './jutge_api_client'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function download2src(download: Download) {
    return URL.createObjectURL(new Blob([new Uint8Array(download.data)], { type: 'image/png' }))
}

/* offer the browser to download a file */
export function offerDownloadFile(download: Download, filename?: string) {
    if (filename === undefined) filename = download.name
    const doc = new Blob([new Uint8Array(download.data)], { type: download.type })
    saveAs(doc, filename)
}

/* convert the contents of a File object to a Uint8Array */
export async function file2array(file: File): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer()
    const array = new Uint8Array(buffer)
    return array
}

export function showError(error: any) {
    if (error instanceof Error) {
        const last = error.message[error.message.length - 1]
        toast.error(`Error: ${error.message}${last === '.' ? '' : '.'}`)
    } else {
        toast.error(`Error`)
    }
}

export function mapmap<V, R>(obj: Record<string, V>, fn: (key: string, value: V) => R) {
    return Object.entries(obj).map(([key, value]) => fn(key, value))
}

export type Dict<T> = Record<string, T>
