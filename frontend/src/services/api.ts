import axios, {AxiosResponse} from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001', // Remplacez par l'URL de votre serveur
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  id: string;
}

export interface FetchResponse {
  data: Blob;
}

export const uploadPdf = (file: File): Promise<AxiosResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('pdf', file);

  return apiClient.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const fetchPdf = (id: string): Promise<AxiosResponse<Blob>> => {
  return apiClient.get<Blob>(`/fetch/${id}`, {
    responseType: 'blob',
  });
};

export const movePage = (id: string, pageIndex: number, newPageIndex: number): Promise<AxiosResponse<void>> => {
  return apiClient.post<void>(`/movePage/${id}`, { pageIndex, newPageIndex });
};

export const removePage = (id: string, pageIndex: string): Promise<AxiosResponse<void>> => {
  return apiClient.post<void>(`/removePage/${id}`, { pageIndex });
};

export const mergePdfs = (pdfIdList: string[]): Promise<AxiosResponse<UploadResponse>> => {
  return apiClient.post<UploadResponse>('/mergePDF', { pdfIdList });
};

export const compressPdf = (id: string): Promise<AxiosResponse<void>> => {
  return apiClient.post<void>(`/compressPDF/${id}`);
};
