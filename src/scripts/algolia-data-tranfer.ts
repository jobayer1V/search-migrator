import { SearchClient } from "@algolia/client-search";
import { Search } from "@upstash/search";
import { UpstashRecord } from "../types.js";
import { mapAlgoliaToUpstash } from "../utils/mapper.js";
import { logger } from "../utils/logger.js";


async function fetchAlgoliaData(algoliaClient: SearchClient, indexName: string, cursor?: string) {
    const result = await algoliaClient.browse({
        indexName: indexName,
        ...(cursor ? { browseParams: { cursor } } : {})
    });
    return result;
}


async function upsertToUpstash(batch: UpstashRecord[], upstashIndex: any) {
    await upstashIndex.upsert(batch);
}

async function fetchAndUpsertAllData({ algoliaClient, upstashClient, upstashIndexName, algoliaIndexName, contentKeys }: { algoliaClient: SearchClient, upstashClient: Search, upstashIndexName: string, algoliaIndexName: string, contentKeys: string[] }) {
    const upstashIndex = upstashClient.index(upstashIndexName);
    let cursor = undefined;
    let hasMore = true;
    const batchSize = 100; // Upstash recommends reasonable batch sizes
    let totalUpserted = 0;

    while (hasMore) {
        const result = await fetchAlgoliaData(algoliaClient, algoliaIndexName, cursor);

        if (result.hits && result.hits.length > 0) {
            const upstashBatch = result.hits.map((hit) => mapAlgoliaToUpstash(hit, contentKeys));
            // Upsert in batches
            for (let i = 0; i < upstashBatch.length; i += batchSize) {
                const batch = upstashBatch.slice(i, i + batchSize);
                await upsertToUpstash(batch, upstashIndex);
                totalUpserted += batch.length;
                logger.info(`Upserted ${batch.length} records to Upstash (total: ${totalUpserted})`);
            }
        }
        if (result.cursor) {
            cursor = result.cursor;
        } else {
            hasMore = false;
        }
    }
    logger.success(`All records from Algolia have been upserted to Upstash. Total: ${totalUpserted}`);
    logger.success(`Visit https://console.upstash.com/search/ to query your data.`)
}

export async function main({
    algoliaClient,
    upstashClient,
    upstashIndexName,
    algoliaIndexName,
    contentKeys,
}: {
    algoliaClient: SearchClient;
    upstashClient: Search;
    upstashIndexName: string;
    algoliaIndexName: string;
    contentKeys: string[];
}) {
    await fetchAndUpsertAllData({ algoliaClient, upstashClient, upstashIndexName, algoliaIndexName, contentKeys });
}


