'use strict';

import { jest } from '@jest/globals';
import fs from 'fs';
import { compressPDF } from '../src/pdf.js';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  renameSync: jest.fn(),
}));

describe('PDF Compression', () => {
  let consoleErrorSpy, mockCompressor;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCompressor = jest.fn()

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should compress PDF successfully', async () => {
    const filePath = './pdf/test.pdf';
    const expectedTempPath = './pdf/test_compressed.pdf';
    
    mockCompressor.mockResolvedValue(expectedTempPath);
    const result = await compressPDF(filePath, mockCompressor);

    expect(result).toBe(true);
    expect(mockCompressor).toHaveBeenCalledTimes(1);
    expect(mockCompressor).toHaveBeenCalledWith(filePath, expectedTempPath);
    expect(fs.renameSync).toHaveBeenCalledTimes(1);
    expect(fs.renameSync).toHaveBeenCalledWith(expectedTempPath, filePath);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw an error for invalid file path', async () => {
    const invalidFilePath = '';

    await expect(compressPDF(invalidFilePath, mockCompressor)).rejects.toThrow('Failed to compress PDF.');
    expect(mockCompressor).not.toHaveBeenCalled();
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle compression failure', async () => {
    const filePath = './pdf/test.pdf';
    mockCompressor.mockRejectedValue(new Error('Compression failed'));

    await expect(compressPDF(filePath, mockCompressor)).rejects.toThrow('Failed to compress PDF.');
    expect(mockCompressor).toHaveBeenCalledTimes(1);
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});