import { FileArchiveIcon, FileTextIcon, LucideIcon } from 'lucide-react'
import jutge from './jutge'
import { Document, Download } from './jutge_api_client'

export function isDocumentZip(document: Pick<Document, 'type'>): boolean {
    return document.type.toLowerCase().includes('zip')
}

export function documentFileExtension(document: Pick<Document, 'type'>): string {
    return isDocumentZip(document) ? '.zip' : '.pdf'
}

export function getDocumentFileIcon(type: string): LucideIcon {
    return type.toLowerCase().includes('zip') ? FileArchiveIcon : FileTextIcon
}

export async function getDocumentFile(document: Pick<Document, 'document_nm' | 'type'>): Promise<Download> {
    if (isDocumentZip(document)) {
        return jutge.instructor.documents.getZip(document.document_nm)
    }
    return jutge.instructor.documents.getPdf(document.document_nm)
}

export function documentTypeLabel(document: Pick<Document, 'type'>): 'PDF' | 'Zip' {
    return isDocumentZip(document) ? 'Zip' : 'PDF'
}

export function documentFileAcceptForType(type: string): string[] {
    return type.toLowerCase().includes('zip')
        ? ['application/zip', 'application/x-zip-compressed']
        : ['application/pdf']
}

export const documentFileAccept = ['application/pdf', 'application/zip', 'application/x-zip-compressed']
