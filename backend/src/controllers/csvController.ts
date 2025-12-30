import { Request, Response } from 'express';
import { processCsvFile, mergeCsvFiles } from "../services/csvServices"

export const processCsvController = async (req: Request, res: Response) => {
  try {
    const { filePath, chunkSize } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    const size = Number(chunkSize) || 1000;
    const result = await processCsvFile(filePath, size);

    return res.json({
      message: 'CSV processed successfully',
      chunkSize: size,
      outputFiles: result.outputFiles,
      totalRows: result.totalRows,
      chunks: result.chunks,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to process CSV', details: err.message });
  }
};

export const mergeCsvController = async (req: Request, res: Response) => {
  try {
    const { baseName, directory } = req.body;

    if (!baseName) {
      return res.status(400).json({ error: 'baseName is required' });
    }

    const result = await mergeCsvFiles(baseName, directory);

    return res.json({
      message: 'CSV files merged successfully',
      outputFile: result.outputFile,
      totalRows: result.totalRows,
      filesMerged: result.filesMerged,
      filePaths: result.filePaths,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ 
      error: 'Failed to merge CSV files', 
      details: err.message 
    });
  }
};