import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDHPTKAxhV3UNpHaIHaerSdVRaUp0Tb6MI",
  authDomain: "fincore-17ec2.firebaseapp.com",
  projectId: "fincore-17ec2",
  storageBucket: "fincore-17ec2.firebasestorage.app",
  messagingSenderId: "1061492896047",
  appId: "1:1061492896047:web:2d431fb4ebb0c2fc9a31da"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)


