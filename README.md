# CSV Chunking & Merging API

## Setup

Add to your `.env` file:
```
PORT=8000
```

## Chunk CSV

Split a CSV file into smaller chunks:

```bash
curl -X POST http://localhost:8000/api/upload-csv \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "/absolute/path/to/file.csv",
    "chunkSize": 1000
  }'
```

## Merge CSV

Merge chunked CSV files back together:

```bash
curl -X POST http://localhost:8000/api/merge-csv \
  -H "Content-Type: application/json" \
  -d '{
    "baseName": "filename",
    "directory": "/absolute/path/to/directory"
  }'
```

**Note:** `baseName` should match the prefix of your chunked files (e.g., if files are `data_part_1.csv`, use `"data"`).
**Note:** `/absolute/path/to/directory` should be changed to the absolute path of the directory.


