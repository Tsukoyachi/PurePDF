const { renameSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { PDFDocument, PDFName, rgb } = require('pdf-lib');
const fs = require('fs');

const { spawn } = require('child_process');

function idToFilePath(id) {
  if(id === "" || id === undefined) {
    return undefined;
  }
  const filePath = `./pdf/${id}.pdf`;
  return fs.existsSync(filePath) ? filePath : undefined;
}

function removePage(pdfDoc, pageIndex) {
  if (pdfDoc === null || typeof pdfDoc !== 'object' || typeof pdfDoc.getPages !== 'function' || typeof pdfDoc.removePage !== 'function') {
    throw new Error('Invalid PDF document object');
  }

  if (isNaN(pageIndex) || typeof pageIndex !== 'number' || pageIndex < 0 || pageIndex >= pdfDoc.getPages().length) {
    throw new Error('Invalid pageIndex');
  }

  const pages = pdfDoc.getPages();
  if (pageIndex >= 0 && pageIndex < pages.length) {
    pdfDoc.removePage(pageIndex);
  } else {
    throw new Error('Invalid pageIndex');
  }
}
  
async function movePage(pdfDoc, sourceIndex, targetIndex) {
  if (pdfDoc === null || typeof pdfDoc !== 'object' || typeof pdfDoc.getPages !== 'function' || typeof pdfDoc.removePage !== 'function' || typeof pdfDoc.insertPage !== 'function' || typeof pdfDoc.getPage !== 'function') {
    throw new Error('Invalid PDF document object');
  }

  const pages = pdfDoc.getPages();

  if (isNaN(sourceIndex) || !Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= pages.length) {
    throw new Error('Invalid sourceIndex');
  }

  if (isNaN(targetIndex) || !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= pages.length) {
    throw new Error('Invalid targetIndex');
  }
  
  const sourcePage = pdfDoc.getPage(sourceIndex);
  pdfDoc.removePage(sourceIndex);
  pdfDoc.insertPage(targetIndex, sourcePage);
}
  
async function mergePDFs(pdfPaths, newId) {
  const mergedPdfDoc = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdfDoc.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
  }

  const mergedPdfBytes = await mergedPdfDoc.save();
  writeFileSync(`./pdf/${newId}.pdf`, mergedPdfBytes);
}

// Function to compress PDF using Ghostscript
async function compressPDFWithGhostscript(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    if (!inputPath || !outputPath) {
      reject('Input and output paths are required.');
      return;
    }

    const args = [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/screen',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath
    ];

    const gs = spawn('gs', args);

    gs.on('error', (error) => {
      reject(`Error compressing PDF: ${error.message}`);
    });

    gs.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(`Ghostscript process exited with code ${code}`);
      }
    });
  });
}

// Function to compress PDF with error handling and file renaming
// The function used to compress is also passed as it enhance our testing capabilities
async function compressPDF(filePath, compressorFunc = compressPDFWithGhostscript) {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path.');
    }
    const tempFilePath = filePath.replace('.pdf', '_compressed.pdf');
    await compressorFunc(filePath, tempFilePath);
    renameSync(tempFilePath, filePath);
    return true;
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('Failed to compress PDF.');
  }
}

module.exports = {
  idToFilePath,
  removePage,
  movePage,
  mergePDFs,
  compressPDF
};