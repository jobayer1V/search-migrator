import { OptionValues } from "commander"
import { isCancel, outro, select, text, multiselect, spinner, confirm } from "@clack/prompts"
import { createMeilisearchClient, createUpstashClient } from "../utils/client.js"
import { getMeilisearchIndexFields } from "../schemas/meilisearch.js"
import { Meilisearch } from "meilisearch";  
import { Search } from "@upstash/search"

export interface MeilisearchCliResults {
  meilisearchClient: Meilisearch
  upstashClient: Search
  upstashIndexName: string
  meilisearchIndexName: string
  contentKeys: string[]
}

export async function runMeilisearchCli(options? : OptionValues): Promise<MeilisearchCliResults | undefined> {

  const upstashUrl =
    options?.upstashUrl ??
  (await text({
    message: "What is your Upstash URL?",
    placeholder: "https://***-gcp-***-search.upstash.io",
    validate: (value) => {
      if (!value) return "Please enter your Upstash URL"
      return
    },
  }))

if (isCancel(upstashUrl)) {
  outro("Migration cancelled.")
  return undefined
}

const upstashToken =
  options?.upstashToken ??
  (await text({
    message: "What is your Upstash Token?",
    placeholder: "upstash-search-token",
    validate: (value) => {
      if (!value) return "Please enter your Upstash Token"
      return
    },
  }))

if (isCancel(upstashToken)) {
  outro("Migration cancelled.")
  return undefined
}

const s = spinner()
s.start("Fetching Upstash Indexes")

const upstashClient = createUpstashClient(upstashUrl, upstashToken)
const upstashIndexNames = await upstashClient.listIndexes()

if (upstashIndexNames.length === 0) {
  s.stop()
  outro("No Upstash Indexes found. Would you like to create a new index?")
  const createIndex = await confirm({
    message: "Create a new index?",
    initialValue: true,
  })
  if (createIndex) {
    const indexName = await text({
      message: "Enter a name for your new index",
      placeholder: "my-index",
    })
    if (isCancel(indexName)) {
      outro("Migration cancelled.")
      return undefined
    }
    s.start("Creating new Upstash Index")
    await upstashClient.index(indexName)
    upstashIndexNames.push(indexName)
    s.stop("New Upstash Index created")
  }
  else {
    outro("Migration cancelled.")
    return undefined
  }
} else {
  s.stop("Upstash Indexes fetched")
}

const upstashIndexName =
  
  (await select({
    message: "Choose an Upstash Index to migrate to:",
    options: upstashIndexNames.map((name) => ({
      value: name,
      label: name,
    })),
  }))

if (isCancel(upstashIndexName)) {
  outro("Migration cancelled.")
  return undefined
}

  const meilisearchHost =
    options?.meilisearchHost ??
    (await text({
      message: "What is your Meilisearch Host?",
      placeholder: "https://***.meilisearch.io",
      validate: (value) => {
        if (!value) return "Please enter your Meilisearch Host"
        return
      },
    }))

  if (isCancel(meilisearchHost)) {
    outro("Migration cancelled.")
    return undefined
  }

  const meilisearchApiKey =
    options?.meilisearchApiKey ??
    (await text({
      message: "What is your Meilisearch API Key?",
      placeholder: "meilisearch-api-key",
      validate: (value) => {
        if (!value) return "Please enter your Meilisearch API Key"
        return
      },
    }))

  if (isCancel(meilisearchApiKey)) {
    outro("Migration cancelled.")
    return undefined
  }

  s.start("Fetching Meilisearch Indexes")

  const meilisearchClient = createMeilisearchClient(meilisearchHost, meilisearchApiKey)
  const meilisearchIndexResults = (await meilisearchClient.getRawIndexes()).results
  const meilisearchIndexNames = meilisearchIndexResults.map((index) => index.uid)

  if (meilisearchIndexNames.length === 0) {
    s.stop()
    outro("No Meilisearch Indexes found. Please create an index first.")
    return undefined
  }

  s.stop("Meilisearch Indexes fetched")

  const meilisearchIndexName =
    (await select({
      message: "Choose a Meilisearch Index to migrate from:",
      options: meilisearchIndexNames.map((name) => ({
        value: name,
        label: name,
      })),
    }))

  if (isCancel(meilisearchIndexName)) {
    outro("Migration cancelled.")
    return undefined
  }

  const indexFields = await getMeilisearchIndexFields(meilisearchClient, meilisearchIndexName)

  const contentKeys = await multiselect({
    message: "Select fields to include in content (use space bar to select)",
    options: indexFields.map((key) => ({ value: key, label: key })),
    required: true
  }) as string[]

  if (isCancel(contentKeys)) {
    outro("Migration cancelled.")
    return undefined
  }

  const contentKeysArray = contentKeys.map((key) => key.trim())


  return {
    meilisearchClient,
    upstashClient,
    upstashIndexName,
    meilisearchIndexName,
    contentKeys: contentKeysArray,
  }
}
