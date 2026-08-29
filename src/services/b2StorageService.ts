/**
 * Backblaze B2 S3-Compatible Storage Service for Online Exams
 * Uses browser-native Web Crypto API (crypto.subtle) for AWS Signature Version 4.
 */
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface B2Config {
  keyId: string;
  applicationKey: string;
  bucketName: string;
  region: string;
}

export const B2_CONFIG: B2Config = {
  keyId: '00384db7dd2f3390000000001',
  applicationKey: 'K003EUCIHsnIRRoLkgDu7mXM4mSttW8',
  bucketName: 'duofyug',
  region: 'eu-central-003'
};

export interface B2UploadedImage {
  b2Key: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// -------------------------------------------------------------
// Web Crypto Helpers (Compatible with all modern browsers & node)
// -------------------------------------------------------------

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: Uint8Array | string, data: Uint8Array | string): Promise<Uint8Array> {
  const keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const dataBytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  return new Uint8Array(signature);
}

async function hmacSha256Hex(key: Uint8Array | string, data: Uint8Array | string): Promise<string> {
  const signature = await hmacSha256(key, data);
  return Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSigningKey(applicationKey: string, dateStamp: string, region: string, service: string = 's3'): Promise<Uint8Array> {
  const kDate = await hmacSha256(`AWS4${applicationKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

function formatDates(now: Date = new Date()) {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  return { amzDate, dateStamp };
}

// -------------------------------------------------------------
// B2 Public / Presigned URL Generation
// -------------------------------------------------------------

/**
 * Generates an AWS v4 presigned GET URL for an object in Backblaze B2.
 * Valid for up to 7 days (default 24 hours).
 */
export async function getB2PresignedUrl(
  b2Key: string, 
  expiresInSeconds: number = 86400,
  config: B2Config = B2_CONFIG
): Promise<string> {
  const path = b2Key.startsWith('/') ? b2Key : '/' + b2Key;
  const host = `${config.bucketName}.s3.${config.region}.backblazeb2.com`;
  const { amzDate, dateStamp } = formatDates();
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;

  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${config.keyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': expiresInSeconds.toString(),
    'X-Amz-SignedHeaders': 'host'
  };

  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join('&');

  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = `GET\n${path}\n${canonicalQueryString}\n${canonicalHeaders}\nhost\nUNSIGNED-PAYLOAD`;
  const canonicalRequestHash = await sha256Hex(canonicalRequest);

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;
  const signingKey = await getSigningKey(config.applicationKey, dateStamp, config.region, 's3');
  const signature = await hmacSha256Hex(signingKey, stringToSign);

  return `https://${host}${path}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Generates an AWS v4 presigned PUT URL for direct browser uploads.
 */
export async function getB2PresignedPutUrl(
  b2Key: string,
  expiresInSeconds: number = 3600,
  config: B2Config = B2_CONFIG
): Promise<string> {
  const path = b2Key.startsWith('/') ? b2Key : '/' + b2Key;
  const host = `${config.bucketName}.s3.${config.region}.backblazeb2.com`;
  const { amzDate, dateStamp } = formatDates();
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;

  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${config.keyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': expiresInSeconds.toString(),
    'X-Amz-SignedHeaders': 'host'
  };

  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join('&');

  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = `PUT\n${path}\n${canonicalQueryString}\n${canonicalHeaders}\nhost\nUNSIGNED-PAYLOAD`;
  const canonicalRequestHash = await sha256Hex(canonicalRequest);

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;
  const signingKey = await getSigningKey(config.applicationKey, dateStamp, config.region, 's3');
  const signature = await hmacSha256Hex(signingKey, stringToSign);

  return `https://${host}${path}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

// -------------------------------------------------------------
// Direct Upload from Browser to B2
// -------------------------------------------------------------

export interface UploadOptions {
  file: File | Blob;
  examId: string;
  studentFolder: string; // e.g. "Adnan_9876543210"
  questionNumber: number;
  photoIndex: number;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Uploads a student's answer photo directly to Backblaze B2 storage
 * under a unique student folder using standard presigned PUT.
 */
export async function uploadAnswerPhotoToB2({
  file,
  examId,
  studentFolder,
  questionNumber,
  photoIndex,
  onProgress
}: UploadOptions): Promise<B2UploadedImage> {
  const sanitizedStudentFolder = studentFolder.replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const extension = 'jpg';
  const fileName = `q${questionNumber}_img${photoIndex + 1}_${timestamp}.${extension}`;
  const b2Key = `exams/${examId}/${sanitizedStudentFolder}/${fileName}`;

  const presignedPutUrl = await getB2PresignedPutUrl(b2Key, 3600);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedPutUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
        try {
          const presignedGetUrl = await getB2PresignedUrl(b2Key, 604800); // 7 days validity
          resolve({
            b2Key,
            url: presignedGetUrl,
            fileName,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          });
        } catch (e) {
          resolve({
            b2Key,
            url: presignedPutUrl.split('?')[0],
            fileName,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          });
        }
      } else {
        reject(new Error(`B2 Upload failed with HTTP status ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during B2 image upload.'));
    };

    xhr.send(file);
  });
}

// -------------------------------------------------------------
// Bulk Image Downloader (ZIP Archive)
// -------------------------------------------------------------

export async function downloadImageAsBlob(b2KeyOrUrl: string): Promise<Blob> {
  let fetchUrl = b2KeyOrUrl;
  if (!b2KeyOrUrl.startsWith('http')) {
    fetchUrl = await getB2PresignedUrl(b2KeyOrUrl);
  }
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status}): ${response.statusText}`);
  }
  return await response.blob();
}

export interface StudentImageEntry {
  studentName: string;
  studentClass: string;
  phoneOrAdmission?: string;
  phoneNumber?: string;
  questionNumber: number;
  imageIndex: number;
  b2Key?: string;
  url?: string;
  imageUrl?: string;
}



/**
 * Packages all descriptive answer images into a clean ZIP folder
 * organized by student: "StudentName_Class/Q1_1.jpg", etc.
 */
export async function downloadExamImagesAsZip(
  examTitle: string,
  imageEntries: StudentImageEntry[],
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  let completed = 0;
  const total = imageEntries.length;

  for (const item of imageEntries) {
    try {
      const studentFolder = `${item.studentName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${item.studentClass.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const fileName = `Q${item.questionNumber}_Page${item.imageIndex + 1}.jpg`;
      const blob = await downloadImageAsBlob(item.url || item.b2Key);
      zip.folder(studentFolder)?.file(fileName, blob);
    } catch (e) {
      console.warn(`Failed to bundle image for ${item.studentName} Q${item.questionNumber}:`, e);
    }
    completed++;
    if (onProgress) onProgress(completed, total);
  }

  const sanitizedTitle = examTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${sanitizedTitle}_Answer_Sheets.zip`);
}
