import { Command } from "commander"
import { intro, isCancel, outro, select, text, multiselect, spinner, confirm } from "@clack/prompts"
import color from "picocolors"
import { createAlgoliaClient, createUpstashClient } from "../utils/client.js"
import { getAlgoliaIndexFields } from "@/schemas/algolia.js"
import { SearchClient } from "@algolia/client-search"
import { Search } from "@upstash/search"

export interface CliResults {
  algoliaClient: SearchClient
  upstashClient: Search
  upstashIndexName: string
  algoliaIndexName: string
  contentKeys: string[]
}

export async function runCli(): Promise<CliResults | undefined> {
  const program = new Command()
  program
    .option("--upstash-url <url>", "Upstash URL")
    .option("--upstash-token <token>", "Upstash Token")
    .option("--algolia-app-id <id>", "Algolia App ID")
    .option("--algolia-api-key <key>", "Algolia API Key")
    .parse(process.argv)

  const options = program.opts()

  console.clear()


  intro(color.bgCyan(" Upstash Index Migrator "))

  const upstashUrl =
    options.upstashUrl ??
  (await text({
    message: "Type your Upstash URL",
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
  options.upstashToken ??
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

  const algoliaAppId =
    options.algoliaAppId ??
    (await text({
      message: "What is your Algolia App ID?",
      placeholder: "algolia-app-id",
      validate: (value) => {
        if (!value) return "Please enter your Algolia App ID"
        return
      },
    }))

  if (isCancel(algoliaAppId)) {
    outro("Migration cancelled.")
    return undefined
  }

  const algoliaApiKey =
    options.algoliaApiKey ??
    (await text({
      message: "What is your Algolia (write) API Key?",
      placeholder: "algolia-api-key",
      validate: (value) => {
        if (!value) return "Please enter your Algolia API Key"
        return
      },
    }))

  if (isCancel(algoliaApiKey)) {
    outro("Migration cancelled.")
    return undefined
  }

  s.start("Fetching Algolia Indexes")

  const algoliaClient = createAlgoliaClient(algoliaAppId, algoliaApiKey)
  const algoliaIndices = await algoliaClient.listIndices()
  const algoliaIndexNames = algoliaIndices.items.map((index) => index.name)

  if (algoliaIndexNames.length === 0) {
    s.stop()
    outro("No Algolia Indexes found. Please create an index first.")
    return undefined
  }

  s.stop("Algolia Indexes fetched")

  const algoliaIndexName =
    
    (await select({
      message: "Choose an Algolia Index to migrate from:",
      options: algoliaIndexNames.map((name) => ({
        value: name,
        label: name,
      })),
    }))

  if (isCancel(algoliaIndexName)) {
    outro("Migration cancelled.")
    return undefined
  }

  const indexFields = await getAlgoliaIndexFields(algoliaClient, algoliaIndexName)

  const contentKeys = await multiselect({
    message: "Select fields to include in content (searchable fields)",
    options: indexFields.map((key) => ({ value: key, label: key })),
    required: true
  }) as string[]

  if (isCancel(contentKeys)) {
    outro("Migration cancelled.")
    return undefined
  }

  const contentKeysArray = contentKeys.map((key) => key.trim())


  return {
    algoliaClient,
    upstashClient,
    upstashIndexName,
    algoliaIndexName,
    contentKeys: contentKeysArray,
  }
}
