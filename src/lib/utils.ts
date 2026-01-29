import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

export function getImageUrl(path: string | null | undefined) {
  if (!path) return '/placeholder-image.png';
  if (path.startsWith('http')) return path;
  return `${ASSETS_URL}/${path}`;
}
// Format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
};

export const downloadFileFromUrl = async (fullUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      mode: 'cors', // Crucial para recursos externos (R2/S3)
    });

    if (!response.ok) {
      throw new Error(`Error al descargar: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Crear elemento temporal
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);

    // Simular clic
    link.click();

    // Limpieza
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    // Re-lanzamos el error para que el componente decida qué hacer (ej: window.open)
    throw error;
  }
};