import React, { useEffect, useState, useRef } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import './image.css';

export type ImageProps = {
  imageRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
};

export const Image = ({ imageRef }: ImageProps) => {
  const [data, setData] = useState<firebase.firestore.DocumentData>();
  const [error, setError] = useState<firebase.firestore.FirestoreError>();
  const unsubscribe = useRef<() => void>(() => {});

  useEffect(() => {
    if (data && data.storageURL) {
      unsubscribe.current();
    }
  }, [data]);

  useEffect(() => {
    const fn = imageRef.onSnapshot(
      (s) => {
        setData(s.data());
      },
      (error) => setError(error)
    );
    unsubscribe.current = fn;

    return () => {
      unsubscribe.current();
    };
  });

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
