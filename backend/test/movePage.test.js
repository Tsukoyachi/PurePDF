'use strict';

import { movePage } from '../pdf';
import { jest } from '@jest/globals';

describe('movePage', () => {
  let pdfDocMock, getPagesStub, getPageStub, removePageStub, insertPageStub;

  beforeEach(() => {
    pdfDocMock = {
      getPages: jest.fn().mockReturnValue(['page1', 'page2', 'page3']),
      removePage: jest.fn(),
      insertPage: jest.fn(),
      getPage: jest.fn(),
    };
    getPagesStub = pdfDocMock.getPages;
    removePageStub = pdfDocMock.removePage;
    insertPageStub = pdfDocMock.insertPage;
    getPageStub = pdfDocMock.getPage;
  });

  it('should move the page from sourceIndex to targetIndex', async () => {
    const sourceIndex = 1;
    const targetIndex = 2;
    const sourcePage = {}; // Mock source page object

    getPageStub.mockReturnValueOnce(sourcePage);

    await movePage(pdfDocMock, sourceIndex, targetIndex);

    expect(removePageStub).toHaveBeenCalledTimes(1);
    expect(removePageStub).toHaveBeenCalledWith(sourceIndex);
    expect(insertPageStub).toHaveBeenCalledTimes(1);
    expect(insertPageStub).toHaveBeenCalledWith(targetIndex, sourcePage);
  });

  it('should throw an error if pdfDoc is null', async () => {
    const sourceIndex = 1;
    const targetIndex = 2;

    await expect(movePage(null, sourceIndex, targetIndex)).rejects.toThrow('Invalid PDF document object');

    expect(getPagesStub).not.toHaveBeenCalled();
    expect(removePageStub).not.toHaveBeenCalled();
    expect(insertPageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pdfDoc is not an object', async () => {
    const sourceIndex = 1;
    const targetIndex = 2;

    await expect(movePage('invalidPdfDoc', sourceIndex, targetIndex)).rejects.toThrow('Invalid PDF document object');

    expect(getPagesStub).not.toHaveBeenCalled();
    expect(removePageStub).not.toHaveBeenCalled();
    expect(insertPageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pdfDoc does not have getPages method', async () => {
    const sourceIndex = 1;
    const targetIndex = 2;

    delete pdfDocMock.getPages;

    await expect(movePage(pdfDocMock, sourceIndex, targetIndex)).rejects.toThrow('Invalid PDF document object');

    expect(getPagesStub).not.toHaveBeenCalled();
    expect(removePageStub).not.toHaveBeenCalled();
    expect(insertPageStub).not.toHaveBeenCalled();
  });

  //... rest of the tests...
});