
export type Event = {
    id: string,
    pubkey: string,
    created_at: number,
    kind: number,
    content: string,
    tags: any,
    sig: string
}

export type Filter = {
    authors: string[],
    kinds: number[],
    limit: number
}

export type UserFriends = {
    pubkey: string,
    friends: number[]
}

export type User = {
    pubkey: string,
    friends: string[]
}
