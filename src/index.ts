// #!/usr/bin/env node

import { runCli } from "./cli/migrate-from-algolia.js"
import { logger } from "./utils/logger.js"
import { main as migrate } from "./scripts/algolia-data-tranfer.js"

const main = async () => {
  const results = await runCli() // TODO: Add a check to see if the user wants to migrate from Algolia or Upstash
  if (!results) {
    return
  }
  await migrate(results)

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
