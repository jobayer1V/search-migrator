import { Meilisearch } from "meilisearch";

export async function getMeilisearchIndexFields(
  client: Meilisearch,
  indexName: string
): Promise<string[]> {
  try {
    const index = client.index(indexName);
    const documents = await index.getDocuments({ limit: 1 });
    if (!documents.results || documents.results.length === 0 || !documents.results[0]) {
      throw new Error("No records found in the index");
    }
    const firstRecord = documents.results[0];
    const fields = Object.keys(firstRecord as object).filter(
      (key) => !key.startsWith('_') && key !== 'id'
    );
    return fields;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve index fields: ${error.message}`);
    }
    throw new Error('Failed to retrieve index fields: Unknown error');
  }
}
