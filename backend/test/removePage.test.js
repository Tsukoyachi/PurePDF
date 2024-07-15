'use strict';

import { removePage } from '../pdf.js';
import { jest } from '@jest/globals';

describe('removePage', () => {
  let pdfDocMock, removePageStub;

  beforeEach(() => {
    pdfDocMock = {
      getPages: jest.fn().mockReturnValue(['page1', 'page2', 'page3']),
      removePage: jest.fn(),
    };
    removePageStub = pdfDocMock.removePage;
  });

  it('should remove the page when pageIndex is valid', () => {
    const pageIndex = 1;

    removePage(pdfDocMock, pageIndex);

    expect(removePageStub).toHaveBeenCalledTimes(1);
    expect(removePageStub).toHaveBeenCalledWith(pageIndex);
  });

  it('should not remove the page when pageIndex is out of bounds', () => {
    const invalidPageIndex = 5;

    expect(() => removePage(pdfDocMock, invalidPageIndex)).toThrow('Invalid pageIndex');

    expect(removePageStub).not.toHaveBeenCalled();
  });

  it('should not remove the page when pageIndex is negative', () => {
    const negativePageIndex = -1;

    expect(() => removePage(pdfDocMock, negativePageIndex)).toThrow('Invalid pageIndex');

    expect(removePageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pdfDoc is undefined', () => {
    const pageIndex = 1;

    expect(() => removePage(undefined, pageIndex)).toThrow('Invalid PDF document object');

    expect(removePageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pdfDoc is null', () => {
    const pageIndex = 1;

    expect(() => removePage(null, pageIndex)).toThrow('Invalid PDF document object');

    expect(removePageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pdfDoc is not an object', () => {
    const pageIndex = 1;

    expect(() => removePage('invalidPdfDoc', pageIndex)).toThrow('Invalid PDF document object');

    expect(removePageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pageIndex is not a number', () => {
    const invalidPageIndex = 'notANumber';

    expect(() => removePage(pdfDocMock, invalidPageIndex)).toThrow('Invalid pageIndex');

    expect(removePageStub).not.toHaveBeenCalled();
  });

  it('should throw an error if pageIndex is NaN', () => {
    const invalidPageIndex = NaN;

    expect(() => removePage(pdfDocMock, invalidPageIndex)).toThrow('Invalid pageIndex');

    expect(removePageStub).not.toHaveBeenCalled();
  });
});