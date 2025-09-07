export type NostrEvent = {
    id: string,
    pubkey: string,
    created_at: number,
    kind: number,
    content: string,
    tags: any,
    sig: string
}
