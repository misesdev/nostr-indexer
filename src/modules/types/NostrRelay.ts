export type NostrRelay = {
    url: string;
    name?: string;
    pubkey?: string;
    description?: string;
    contact?: string;
    supported_nips?: string;
    software?: string;
    version?: string;
    active: boolean;
    ref_count: number;
}
