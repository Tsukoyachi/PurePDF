import React, { useState } from 'react';
import { compressPdf, fetchPdf } from '../services/api';
import Upload from './Upload';

const Compress: React.FC = () => {
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (id: string) => {
    setPdfId(id);
    handleCompress(id);
  };

  const handleCompress = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await compressPdf(id);
      const response = await fetchPdf(id);
      const blob = response.data as Blob;
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
    } catch (error) {
      setError('Failed to compress PDF');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold m-5 sm:text-5xl'>Compress PDF</h1>
      <p className='mb-8'>Reduce pdf size while optimizing for maximal PDF quality.</p>
      {!pdfId ? (
        <Upload onUploadSuccess={handleUploadSuccess} />
      ) : (
        <div>
          {loading ? (
            <p>Compressing...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            compressedPdfUrl && (
              <div>
                <p>PDF compressed successfully. You can download it here:</p>
                <a
                  href={compressedPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-block px-4 py-2 mt-2 bg-blue-500 text-white rounded cursor-pointer ${!compressedPdfUrl ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Download compressed PDF
                </a>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Compress;
