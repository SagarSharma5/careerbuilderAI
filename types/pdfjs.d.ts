declare module 'pdfjs' {
    export function parseBuffer(buffer: Buffer): Promise<{ text: string }>
} 