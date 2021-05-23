import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { promisify } from 'util';
import * as stream from 'stream';
import got from 'got';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Function triggered by insertion of new documents in the collection 'images'
 * in Firestore.
 *
 * It downloads the file from the url found in the document, uploads it to
 * Firebase Storage and adds the Firebase Storage URL to the document.
 */
export const imageFetcher = functions
  .region('europe-west1')
  .firestore.document('images/{id}')
  .onCreate(async (snap) => {
    const doc = snap.data();

    let id = doc.id;
    if (!id) {
      functions.logger.warn('Document id missing. Falling back to uuid.');
      id = uuidv4();
    }
    functions.logger.debug(`id = ${id}`);

    if (!doc.url) {
      functions.logger.error('missing URL in document');
      return;
    }

    try {
      const file = await download(doc.url, id);
      if (!file) {
        throw new Error('unknown download error');
      }

      const storagePath = await uploadToFirebase(file);
      if (!storagePath) {
        throw new Error('unknown upload error');
      }

      return snap.ref.set(
        {
          storagePath: storagePath,
        },
        { merge: true }
      );
    } catch (error) {
      functions.logger.error(`file upload failed: ${error}`);
      return null;
    }
  });

/**
 * Download a file from an url and returns it's fs path.
 * @param url URL of the file to download.
 * @param fileName Name to use for the file.
 * @returns Full path to the downloaded file.
 */
const download = async (url: string, id: string): Promise<string> => {
  try {
    let ext = fileExtFromURL(url);
    if (!ext) {
      functions.logger.warn(`Can't decide extension for ${url}.`);
      ext = 'tmp';
    }
    functions.logger.debug(`Using file extension ${ext}`);

    const path = `/tmp/${id}.${ext}`;

    const pipeline = promisify(stream.pipeline);
    await pipeline(got.stream(url), fs.createWriteStream(path));

    return path;
  } catch (error) {
    throw new Error(`download: ${error}`);
  }
};

/**
 * uploadToFirebase uploads a file from local filesystem to Firebase Storage.
 * @param path Path to local file.
 * @returns Path to file in Firebase Storage.
 */
const uploadToFirebase = async (path: string): Promise<string> => {
  const fileName = filenameFromPath(path);
  const bucket = admin.storage().bucket();

  try {
    const res = await bucket.upload(path, {
      destination: fileName,
      public: true,
    });
    return res[1].mediaLink;
  } catch (error) {
    throw new Error(`upload to firebase: ${error}`);
  }
};

/**
 * filenameFromPath parses a file path and returns the filename without
 * leading slash.
 * @param path Path, e.g. /tmp/file.tmp
 * @returns File name, e.g. file.tmp
 */
export const filenameFromPath = (path: string): string => {
  const pos = path.lastIndexOf('/');
  if (pos === -1) {
    return path;
  }
  return path.substring(pos + 1);
};

/**
 * Parse a file name or path and return the file extension.
 * @param url The URL to parse
 * @returns Extension if found, otherwise empty string
 */
export const fileExtFromURL = (url: string): string => {
  const pattern = /^.*\/[a-zA-Z0-9\-_]+\.([a-zA-Z0-9_]+)(?:[#?].*)?$/;
  const ext = url.match(pattern);
  if (ext == null || ext.length !== 2) {
    return '';
  }
  return ext[1];
};
