const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const { v4: uuidv4 } = require('uuid');
const { PDFDocument } = require('pdf-lib');
const { idToFilePath, removePage, movePage, mergePDFs, compressPDF } = require('./pdf'); // Import from pdf.js

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

function isPDF(fileBuffer) {
  // Check if the file buffer starts with '%PDF'
  const pdfMagicNumbers = [0x25, 0x50, 0x44, 0x46]; // corresponds to '%PDF'

  for (let i = 0; i < pdfMagicNumbers.length; i++) {
    if (fileBuffer[i] !== pdfMagicNumbers[i]) {
      return false;
    }
  }

  return true;
}

const app = express();
app.use(express.json());
app.disable("x-powered-by"); 

const port = 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: ['Content-Type', 'Authorization']
}));

// Define the maximum file size in bytes (e.g., 100 MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Set up multer with destination and file size limit
const upload = multer({
  dest: './pdf/',
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    // Check Content-Type
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Invalid file format. Only PDFs are allowed.'));
    }

    cb(null, true);
  }
});

app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Check magic byte
  const fileBuffer = fs.readFileSync(req.file.path);
  if(fileBuffer === undefined) {
    throw new Error('The file buffer is empty, please retry.');
  }
  if (!isPDF(fileBuffer)) {
    throw new Error('Invalid file format. Only PDFs are allowed.');
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
