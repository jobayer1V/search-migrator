# Upstash Search Migrator CLI

A command-line tool to migrate your data from an Algolia index to an [Upstash Search](https://upstash.com/docs/search) index.

## Getting Started

You can run the CLI directly using `npx` without any installation, which ensures you are always using the latest version.

### Using npx

```sh
npx migrate-to-upstash-search
```

## Usage

The CLI can be run by passing command-line flags; otherwise, those credentials will be asked in the CLI.

### Interactive Mode

Simply run the command without any flags to be guided through the migration process with interactive prompts.

```sh
npx migrate-to-upstash-search
```

### Using Flags

You can also provide your credentials and other information as command-line flags.

```sh
npx migrate-to-upstash-search \
  --upstash-url "YOUR_UPSTASH_URL" \
  --upstash-token "YOUR_UPSTASH_TOKEN" \
  --algolia-app-id "YOUR_ALGOLIA_APP_ID" \
  --algolia-api-key "YOUR_ALGOLIA_WRITE_API_KEY"
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
