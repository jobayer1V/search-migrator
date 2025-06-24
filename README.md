# Upstash Search Migrator CLI

A command-line tool to migrate your data from an Algolia or Meilisearch index to an [Upstash Search](https://upstash.com/docs/search) index.

## Getting Started

You can run the CLI directly using `npx` without any installation, which ensures you are always using the latest version.

### Using npx

```sh
npx @upstash/search-migrator
```

## Usage

The CLI can be run by passing command-line flags; otherwise, those credentials will be asked in the CLI.

### Interactive Mode

Simply run the command without any flags to be guided through the migration process with interactive prompts.

```sh
npx @upstash/search-migrator
```

### Using Flags

You can also provide your credentials and other information as command-line flags.

#### Algolia to Upstash
```sh
npx @upstash/search-migrator \
  --upstash-url "YOUR_UPSTASH_URL" \
  --upstash-token "YOUR_UPSTASH_TOKEN" \
  --algolia-app-id "YOUR_ALGOLIA_APP_ID" \
  --algolia-api-key "YOUR_ALGOLIA_WRITE_API_KEY"
```

#### Meilisearch to Upstash
```sh
npx @upstash/search-migrator \
  --upstash-url "YOUR_UPSTASH_URL" \
  --upstash-token "YOUR_UPSTASH_TOKEN" \
  --meilisearch-host "YOUR_MEILISEARCH_HOST" \
  --meilisearch-api-key "YOUR_MEILISEARCH_API_KEY"
```

## Obtaining Credentials

### Upstash

1.  Go to your [Upstash Console](https://console.upstash.com/).
2.  Select your Search index.
3.  Under the **Details** section, you will find your `UPSTASH_SEARCH_REST_URL` and `UPSTASH_SEARCH_REST_TOKEN`.
    *   `--upstash-url` corresponds to `UPSTASH_SEARCH_REST_URL`.
    *   `--upstash-token` corresponds to `UPSTASH_SEARCH_REST_TOKEN`.

### Algolia

1.  Go to your [Algolia Dashboard](https://www.algolia.com/dashboard).
2.  Navigate to **Settings** > **API Keys**.
3.  You will find your **Application ID** here. This is your `--algolia-app-id`.
4.  For the API key (`--algolia-api-key`), you need a key with `write` permissions for your indices. You can use your **Write API Key** or create a new one with the necessary permissions.

### Meilisearch

1.  Go to your [Meilisearch Console](https://cloud.meilisearch.com/).
2.  Find your Meilisearch deployment and copy the **Host URL** and **API Key**.
    *   `--meili-host` corresponds to your Meilisearch instance URL (e.g., `https://ms-xxxxxx.meilisearch.io`).
    *   `--meili-api-key` corresponds to your Meilisearch API key.
