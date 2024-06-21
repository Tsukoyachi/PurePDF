import React, { useState } from 'react';
import { uploadPdf } from '../services/api';

interface UploadPageProps {
  onUploadSuccess: (id: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadPdf(file);
      onUploadSuccess(response.data.id);
    } catch (error) {
      console.error('Upload error', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    setFile(event.dataTransfer.files?.[0])
    console.log('Dropped file:', file);
    // Handle dropped file logic here
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`relative w-64 h-24 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer 
          ${dragging ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-400'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? 'Uploading...' : 'Click to browse file or drag and drop your PDF file here'}
        {file && (
          <p className="mt-1 text-sm truncate" title={file.name}>
            Selected file: {file.name}
          </p>
        )}
      </label>
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`px-4 py-2 mt-2 bg-blue-500 text-white rounded cursor-pointer ${
          (!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default UploadPage;
