const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const { v4: uuidv4 } = require('uuid');
const { PDFDocument } = require('pdf-lib');
const { removePage, movePage, mergePDFs, compressPDF } = require('./pdf'); // Import from pdf.js

// Old pdf deletion
// Schedule the deletion every hour and delete all pdf not modified since 1 hour
function deleteOldPDFs() {
  console.info(`Batch suppression of old files at ${new Date()}`);
  const pdfDirectory = './pdf';
  const hourInMilliseconds = 60 * 60 * 1000; // 1 hour in milliseconds

  try {
    const files = fs.readdirSync(pdfDirectory);

    files.forEach((file) => {
      const filePath = path.join(pdfDirectory, file);
      const fileStat = fs.statSync(filePath);
      const currentTime = new Date().getTime();
      const fileModifiedTime = fileStat.mtime.getTime();

      if (currentTime - fileModifiedTime > hourInMilliseconds) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${filePath}`);
      }
    });
  } catch (error) {
    console.error('Error deleting old PDF files:', error);
  }
}

setInterval(deleteOldPDFs, 60 * 60 * 1000);

function idToFilePath(id) {
  const filePath = `./pdf/${id}.pdf`;
  return fs.existsSync(filePath) ? filePath : undefined;
}

var app = express();
app.use(express.json()); 


const upload = multer({ dest: './pdf/' });

app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileId = uuidv4();
  const filePath = `./pdf/${fileId}.pdf`;

  fs.renameSync(req.file.path, filePath); 

  res.status(200).json({ id: fileId });
});

app.get('/fetch/:id', async (req, res) => {
  const fileId = req.params.id;

  try {
    const pdfPath = idToFilePath(fileId);

    if (!pdfPath) {
      throw new Error("PDF file not found for the specified ID.");
    }

    const pdfBytes = fs.readFileSync(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(pdfBytes);
  } catch (error) {
    res.status(404).json({ error: 'PDF file not found for the specified ID.' });
  }
});
  
app.post('/movePage/:id', async (req, res) => {
  const id = req.params.id;
  const sourceIndex = Number(req.query.sourceIndex);
  const targetIndex = Number(req.query.targetIndex);

  try {
    if (isNaN(sourceIndex) || isNaN(targetIndex)) {
      throw new Error("sourceIndex and targetIndex should be whole number between 0 and (max page-1) on a non empty pdf !")
    }

    const pdfPath = idToFilePath(id);

    if (!pdfPath) {
      throw new Error("PDF file not found for the specified ID.");
    }

    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    movePage(pdfDoc, sourceIndex, targetIndex);

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, modifiedPdfBytes);

    res.status(200).json({ message: `Page ${sourceIndex} moved to ${targetIndex} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/removePage/:id', async (req, res) => {
    const id = req.params.id;
    const pageIndex = Number(req.query.pageIndex);;

    try {
      if (isNaN(pageIndex)) {
        throw new Error("pageIndex should be whole number between 0 and (max page-1) on a non empty pdf !")
      }

      const pdfPath = idToFilePath(id);

      if (!pdfPath) {
        throw new Error("PDF file not found for the specified ID.");
      }

      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      removePage(pdfDoc, pageIndex);

      const modifiedPdfBytes = await pdfDoc.save();
      fs.writeFileSync(pdfPath, modifiedPdfBytes);

      res.status(200).json({ message: `The page ${pageIndex} was removed successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
})

app.post('/mergePDF', async (req, res) => {
  const { pdfIdList } = req.body;

  try {
    const pdfPaths = pdfIdList.map(id => idToFilePath(id));

    if (pdfPaths.includes(undefined)) {
        throw new Error("One or more id of this list is undefined, please retry...");
    }
    const newPdfId = uuidv4();
    mergePDFs(pdfPaths, newPdfId);
  
    res.status(200).json({ message: `PDFs merged successfully, the id of the new pdf is : ${newPdfId}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
app.post('/compressPDF/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const pdfPath = idToFilePath(id);

    if (!pdfPath) {
      throw new Error("PDF file not found for the specified ID.");
    }

    // Call compressPDF function with the filePath
    await compressPDF(pdfPath);

    res.status(200).json({ message: 'PDF compressed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
