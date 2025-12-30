import { promises as fs } from 'fs';
import path from 'path';

// Type of the response that will be sent back to the request
type ProcessCsvResult = {
  outputFiles: string[];    // Names of the CSV files that gets generated
  totalRows: number;
  chunks: number;
};

export type MergeCsvResult = {
    outputFile: string;
    totalRows: number;
    filesMerged: number;
    filePaths: string[];
  };

export async function processCsvFile(
  filePath: string,
  chunkSize: number
): Promise<ProcessCsvResult> {
  // 1. Read the CSV into memory
  const raw = await fs.readFile(filePath, 'utf8');
  console.log(raw);

  // 2. Normalize line breaks and split
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  if (lines.length === 0) {
    return { outputFiles: [], totalRows: 0, chunks: 0 };
  }

  // First non-empty line is treated as the header, trimming out all the empty lines
  //    so it is not used as a header or is chunked as empty line
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

  
  if (nonEmptyLines.length === 0) {
    return { outputFiles: [], totalRows: 0, chunks: 0 };
  }

  const header = nonEmptyLines[0];
  const dataRows = nonEmptyLines.slice(1);

  // 3. Chunk the data rows
  const chunks: string[][] = [];
  for (let i = 0; i < dataRows.length; i += chunkSize) {
    chunks.push(dataRows.slice(i, i + chunkSize));
  }

  // 4. Build output file names
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath)); // without .csv

  const outputFiles: string[] = [];

  // 5. Write each chunk as a separate CSV
  for (let index = 0; index < chunks.length; index++) {
    const chunkRows = chunks[index];
    const outName = `${base}_part_${index + 1}.csv`;
    const outPath = path.join(dir, outName);

    // Include the header at the top of each generated CSV
    const csvContent = [header, ...chunkRows].join('\n');
    await fs.writeFile(outPath, csvContent, 'utf8');

    outputFiles.push(outPath);
  }

  return {
    outputFiles,
    totalRows: dataRows.length,
    chunks: chunks.length,
  };
}

export async function mergeCsvFiles(
  baseName: string,
  directory?: string
): Promise<MergeCsvResult> {
  const dir = directory || process.cwd();
  
  // Find all files matching baseName_part_*.csv pattern
  const files = await fs.readdir(dir);
  const pattern = new RegExp(`^${baseName}_part_\\d+\\.csv$`);
  
  const filesToMerge = files
    .filter(f => pattern.test(f))
    .map(f => path.join(dir, f))
    .sort((a, b) => {
      // Sort by part number to ensure correct order
      const numA = parseInt(a.match(/_part_(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/_part_(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  if (filesToMerge.length === 0) {
    throw new Error(`No files found matching pattern: ${baseName}_part_*.csv`);
  }

  // Verify all files exist
  for (const file of filesToMerge) {
    try {
      await fs.access(file);
    } catch {
      throw new Error(`File not found: ${file}`);
    }
  }

  // Read all files and merge
  const fileContents: string[] = [];
  let header: string | null = null;
  let totalRows = 0;

  for (const filePath of filesToMerge) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);

    if (nonEmptyLines.length === 0) continue;

    // Extract header from first file
    if (header === null) {
      header = nonEmptyLines[0];
      fileContents.push(header);
    }

    // Add data rows (skip header in each chunk file)
    const dataRows = nonEmptyLines.slice(1);
    fileContents.push(...dataRows);
    totalRows += dataRows.length;
  }

  // Create output path
  const outputPath = path.join(dir, `${baseName}_merged.csv`);

  // Write merged file
  const mergedContent = fileContents.join('\n');
  await fs.writeFile(outputPath, mergedContent, 'utf8');

  return {
    outputFile: outputPath,
    totalRows,
    filesMerged: filesToMerge.length,
    filePaths: filesToMerge,
  };
}