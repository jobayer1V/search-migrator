// #!/usr/bin/env node

import { runCli } from "./cli/index.js"
import { logger } from "./utils/logger.js"
import { main as migrateAlgolia } from "./scripts/algolia-data-tranfer.js"
import { main as migrateMeilisearch } from "./scripts/meilisearch-data-transfer.js"
const main = async () => {
  const results = await runCli()
  if (!results) {
    return
  }
  if ("algoliaClient" in results) { // TODO: Do a proper type checking
    await migrateAlgolia(results)
  } else if ("meilisearchClient" in results) {
    await migrateMeilisearch(results)
  }
  
  process.exit(0)
}

main().catch((err) => {
  logger.error("Aborting migration...")
  if (err instanceof Error) {
    logger.error(err)
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    )
    console.log(err)
  }
  process.exit(1)
})
