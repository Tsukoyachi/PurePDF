'use strict';

import { idToFilePath } from '../src/pdf.js';
import fs from 'fs';
import { jest } from '@jest/globals';

describe("idToFilePath tests", () => {
  let existsSyncMock;

  beforeEach(() => {
    existsSyncMock = jest.spyOn(fs, 'existsSync');
  });

  afterEach(() => {
    existsSyncMock.mockRestore();
  });

  it("Should return the filepath when the file exists", () => {
    const id = '12345';
    const expectedPath = `./pdf/${id}.pdf`;

    existsSyncMock.mockReturnValueOnce(true);

    const result = idToFilePath(id);
    expect(result).toBe(expectedPath);
  });

  it("Shouldn't return a filepath when the file doesn't exists", () => {
    const id = '12345';

    existsSyncMock.mockReturnValueOnce(false);

    const result = idToFilePath(id);
    expect(result).toBeUndefined();
  });

  it("Shouldn't return a filepath when the id is empty or undefined", () => {
    const id1 = undefined;
    const id2 = "";

    const result1 = idToFilePath(id1);
    const result2 = idToFilePath(id2);

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });
});