import { SearchClient } from "@algolia/client-search";

export async function getAlgoliaIndexFields(
  client: SearchClient,
  indexName: string
): Promise<string[]> {
  try {
    
    const response = await client.search([
      {
        indexName,
        params: {
          hitsPerPage: 1,
          query: "",
        },
      },
    ]);

    // @ts-ignore - We know the structure of the response from Algolia
    const firstResult = response.results[0];
    // @ts-ignore - We know hits will be present in the response
    if (!firstResult?.hits?.length) {
      throw new Error("No records found in the index");
    }

    // @ts-ignore - We know the structure of hits from Algolia
    const firstRecord = firstResult.hits[0];
    const fields = Object.keys(firstRecord).filter(

      (key) => !key.startsWith('_') && key !== 'objectID'
    );

    return fields;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve index fields: ${error.message}`);
    }
    throw new Error('Failed to retrieve index fields: Unknown error');
  }
} 