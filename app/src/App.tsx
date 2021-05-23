import React, { useState } from 'react';
import logo from './logo.svg';
import { Image } from './components/image';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
});

function App() {
  const [imageRefs, setImageRefs] = useState<
    firebase.firestore.DocumentReference<firebase.firestore.DocumentData>[]
  >([]);
  const [urlValue, setUrlValue] = useState('');

  const handleAddURLClick = async () => {
    console.log('adding image');
    await addImage(urlValue);
    setUrlValue('');
  };

  const addImage = async (url: string) => {
    if (!url) {
      console.log('missing url');
      return;
    }
    const res = await firebase.firestore().collection('images').add({
      url: url,
    });
    setImageRefs([...imageRefs, res]);
  };

  return (
    <div className="app">
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
      </header>
      <main className="main">
        <div className="form">
          <input
            type="text"
            placeholder="Image URL"
            onChange={(e) => setUrlValue(e.target.value)}
            value={urlValue}
          />
          <input
            type="button"
            value="Add"
            onClick={() => handleAddURLClick()}
          />
        </div>
        <div className="images">
          {imageRefs.map((r, i) => (
            <Image key={i} imageRef={r} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
