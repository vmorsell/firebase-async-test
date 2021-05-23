import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import './image.css';

export type ImageProps = {
  imageRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
};

export const Image = ({ imageRef }: ImageProps) => {
  const [data, setData] = useState<firebase.firestore.DocumentData>();
  const [error, setError] = useState<firebase.firestore.FirestoreError>();

  const unsubscribe = imageRef.onSnapshot(
    (s) => {
      setData(s.data());
    },
    (error) => setError(true)
  );

  useEffect(() => {
    if (data && data.storageURL) {
      unsubscribe();
    }
  }, [data, unsubscribe]);

  return (
    <div
      className="image"
      style={{
        backgroundImage:
          !error && data && data.storageURL
            ? `url(${data.storageURL})`
            : 'none',
      }}
    >
      {error && error.message}
    </div>
  );
};
