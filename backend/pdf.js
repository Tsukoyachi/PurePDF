const { renameSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { PDFDocument, PDFName, rgb } = require('pdf-lib');

const { spawn } = require('child_process');

function removePage(pdfDoc, pageIndex) {
  const pages = pdfDoc.getPages();
  if (pageIndex >= 0 && pageIndex < pages.length) {
    pdfDoc.removePage(pageIndex);
  }
}
  
async function movePage(pdfDoc, sourceIndex, targetIndex) {
  const pages = pdfDoc.getPages();
  
  if (sourceIndex < 0 || sourceIndex >= pages.length || targetIndex < 0 || targetIndex >= pages.length) {
    throw new Error('Invalid page indices');
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

async function compressPDF(filePath) {
  try {
    const tempFilePath = filePath.replace('.pdf', '_compressed.pdf');
    await compressPDFWithGhostscript(filePath, tempFilePath);
    renameSync(tempFilePath, filePath); // Replace original with compressed
    return true;
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('Failed to compress PDF.');
  }
}
module.exports = {
  removePage,
  movePage,
  mergePDFs,
  compressPDF
};