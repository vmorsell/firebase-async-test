import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { promisify } from 'util';
import * as stream from 'stream';
import got from 'got';
import * as fs from 'fs';

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
    if (!doc.url) {
      functions.logger.error('missing URL in document');
      return;
    }

    try {
      const file = await download(doc.url);
      if (file === '') {
        throw new Error('unknown download error');
      }

      const storagePath = await uploadToFirebase(file);
      if (storagePath === '') {
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
 * @returns Name of the downloaded file.
 */
const download = async (url: string): Promise<string> => {
  try {
    const path = '/tmp/file.tmp';

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
  const bucket = admin.storage().bucket();

  try {
    bucket.upload(path, {
      destination: 'images/name',
    });
    return '';
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
