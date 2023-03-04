export declare const init: () => Promise<void>;
export declare const search: (query: string, page?: number, perPage?: number) => Promise<unknown>;
export declare const getMappings: (anilistId: number) => Promise<import(".prisma/client").Manga | {
    message: string;
    error: any;
} | {
    message: string;
    error?: undefined;
} | null>;
export declare const exportDatabase: () => Promise<void>;
export declare const clearDatabase: () => Promise<void>;
