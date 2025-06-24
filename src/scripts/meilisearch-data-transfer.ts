import { Meilisearch } from "meilisearch";
import { Search } from "@upstash/search";
import { UpstashRecord } from "../types.js";
import { mapMeilisearchToUpstash } from "../utils/mapper.js";
import { logger } from "../utils/logger.js";


async function fetchMeilisearchData(meilisearchClient: Meilisearch, indexName: string, limit: number, offset: number ) {
    const result = await meilisearchClient.index(indexName).getDocuments({ limit, offset });
    return result;
}


async function upsertToUpstash(batch: UpstashRecord[], upstashIndex: any) {
    await upstashIndex.upsert(batch);
}

async function fetchAndUpsertAllData({ meilisearchClient, upstashClient, upstashIndexName, meilisearchIndexName, contentKeys }: { meilisearchClient: Meilisearch, upstashClient: Search, upstashIndexName: string, meilisearchIndexName: string, contentKeys: string[] }) {
    const upstashIndex = upstashClient.index(upstashIndexName);
    let hasMore = true;
    const limit = 100;
    let offset = 0;
    let totalUpserted = 0;

    while (hasMore) {
        const result = await fetchMeilisearchData(meilisearchClient, meilisearchIndexName, limit, offset);
        
        if (result.results && result.results.length > 0) {
            const upstashBatch = result.results.map((hit) => mapMeilisearchToUpstash(hit, contentKeys));
            // Upsert in batches
            for (let i = 0; i < upstashBatch.length; i += limit) {
                const batch = upstashBatch.slice(i, i + limit);
                await upsertToUpstash(batch, upstashIndex);
                totalUpserted += batch.length;
                logger.info(`Upserted ${batch.length} records to Upstash (total: ${totalUpserted})`);
            }
        }
        if (result.total > offset + limit) {
            offset += limit;
        } else {
            hasMore = false;
        }
    }
    logger.success(`All records from Meilisearch have been upserted to Upstash. Total: ${totalUpserted}`);
    logger.success(`Visit https://console.upstash.com/search/ to query your data.`)
}

export async function main({
    meilisearchClient,
    upstashClient,
    upstashIndexName,
    meilisearchIndexName,
    contentKeys,
}: {
    meilisearchClient: Meilisearch;
    upstashClient: Search;
    upstashIndexName: string;
    meilisearchIndexName: string;
    contentKeys: string[];
}) {
    await fetchAndUpsertAllData({ meilisearchClient, upstashClient, upstashIndexName, meilisearchIndexName, contentKeys });
}


