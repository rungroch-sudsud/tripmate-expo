import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {requirements} from './requirement'

const firebaseConfig = {
  apiKey: `${requirements.apiKey}`,
  authDomain: `${requirements.authDomain}`,
  projectId: `${requirements.projectId}`,
  storageBucket: `${requirements.storageBucket}`,
  messagingSenderId: `${requirements.messagingSenderId}`,
  appId: `${requirements.appId}`,
  // measurementId omitted here
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
