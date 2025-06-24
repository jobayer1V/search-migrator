import { Command } from "commander"
import { intro, isCancel, outro, select } from "@clack/prompts"
import color from "picocolors"
import { SearchClient } from "@algolia/client-search"
import { Search } from "@upstash/search"
import { runAlgoliaCli } from "./migrate-from-algolia.js"
import { runMeilisearchCli } from "./migrate-from-meilisearch.js"
import { Meilisearch } from "meilisearch"

export interface AlgoliaCliResults {
  algoliaClient: SearchClient
  upstashClient: Search
  upstashIndexName: string
  algoliaIndexName: string
  contentKeys: string[]
}

export interface MeilisearchCliResults {
  meilisearchClient: Meilisearch
  upstashClient: Search
  upstashIndexName: string
  meilisearchIndexName: string
  contentKeys: string[]
}


export async function runCli(): Promise<AlgoliaCliResults | MeilisearchCliResults | undefined> {
  const program = new Command()
  program
    .option("--upstash-url <url>", "Upstash URL")
    .option("--upstash-token <token>", "Upstash Token")
    .option("--algolia-app-id <id>", "Algolia App ID")
    .option("--algolia-api-key <key>", "Algolia API Key")
    .option("--meilisearch-host <host>", "Meilisearch Host")
    .option("--meilisearch-api-key <key>", "Meilisearch API Key")
    .parse(process.argv)

  const options = program.opts()

  console.clear()

  intro(color.bgCyan(" Upstash Index Migrator "))

  const provider =
  (await select({
    message: "Select your provider",
    options: [
      { label: "Algolia", value: "algolia" },
      { label: "Meilisearch", value: "meilisearch" },
    ],
  }))

  if (isCancel(provider)) {
    outro("Migration cancelled.")
    return undefined
  }

  if (provider === "algolia") {
    return await runAlgoliaCli(options)
  }

  if (provider === "meilisearch") {
    return await runMeilisearchCli(options)
  }

  return undefined;
}
