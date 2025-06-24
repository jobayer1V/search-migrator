import { UpstashRecord } from "@/types.js";

export function mapAlgoliaToUpstash(hit: any, contentKeys: string[]): UpstashRecord {
    const content: Record<string, any> = {};
    for (const key of contentKeys) {
        content[key] = hit[key as keyof typeof hit];
    }

    const metadata: Record<string, any> = {};
    for (const [key, value] of Object.entries(hit)) {
        if (key !== 'objectID' && !contentKeys.includes(key)) {
            metadata[key] = value;
        }
    }
    return { id: hit.objectID, content, metadata };
    }

export function mapMeilisearchToUpstash(hit: any, contentKeys: string[]): UpstashRecord {
    const content: Record<string, any> = {};
    for (const key of contentKeys) {
        content[key] = hit[key as keyof typeof hit];
    }
    const metadata: Record<string, any> = {};
    for (const [key, value] of Object.entries(hit)) {
        if (key !== 'id' && !contentKeys.includes(key)) {
            metadata[key] = value;
        }
    }
    return { id: hit.id, content, metadata };
}