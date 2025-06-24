import { searchClient } from '@algolia/client-search';
import { Search } from "@upstash/search";
import { Meilisearch } from "meilisearch";

// Upstash client creation
export function createUpstashClient(url: string, token: string) {
    return new Search({url, token});
}

// Algolia client creation
export function createAlgoliaClient(appId: string, apiKey: string) {
    return searchClient(appId, apiKey);
}

// Meilisearch client creation
export function createMeilisearchClient(host: string, apiKey: string) {
    return new Meilisearch({host, apiKey});
}

