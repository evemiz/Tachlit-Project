
// import { doc as doc1, getDoc as getDoc1 } from 'firebase/firestore';
// import { addDocument, deleteDocument } from './AdminFunctions';
// import { db } from '../firebaseConfig.js';
// import { sendSignInLinkToEmail } from 'firebase/auth';
// import { auth } from '../firebaseConfig.js';
// import {FinishSignUp} from './finishSignUp'

// export const handleApproveVolunteer = async (docId) => {
//   console.log(`Approving volunteer with ID ${docId}`);

//   const actionCodeSettings = {
//     url: 'http://localhost:3000/finishSignUp', // כתובת ה-URL שתחזיר את המשתמש לאחר ההגדרה
//     handleCodeInApp: true,
//   };
  
//   try {
//     const docRef = doc1(db, 'NewVolunteers', docId);
//     const docSnap = await getDoc1(docRef);

//     if (docSnap.exists()) {
//       const docData = docSnap.data();
//       console.log(`Document data: ${JSON.stringify(docData)}`);
      
//       await addDocument('Volunteers', { ...docData, id: docId });
//       await deleteDocument('NewVolunteers', docId);
//       await sendSignInLinkToEmail(auth, docData.mail, actionCodeSettings); // השתמש באובייקט auth במקום db
//       console.log('the mail is:',docData.mail);
      
//       console.log("Document moved from NewVolunteers to Volunteers with ID: ", docId);
//     } else {
//       console.error("No such document!");
//     }
//   } catch (error) {
//     console.error("Error moving document: ", error);
//   }

// };


import { doc as doc1, getDoc as getDoc1 } from 'firebase/firestore';
import { addDocument, deleteDocument, sendApprovalEmail } from './AdminFunctions';
import { db } from '../firebaseConfig.js';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';

export const handleApproveVolunteer = async (docId) => {
  console.log(`Approving volunteer with ID ${docId}`);

  try {
    const docRef = doc1(db, 'NewVolunteers', docId);
    const docSnap = await getDoc1(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      console.log(`Document data: ${JSON.stringify(docData)}`);
      
      const email = docData.mail;
      console.log(`Sending sign-in link to: ${email}`); // Log the email

      await addDocument('Volunteers', { ...docData, id: docId });
      await deleteDocument('NewVolunteers', docId);

      const actionCodeSettings = {
        url: `http://localhost:3000/finishSignUp?email=${encodeURIComponent(email)}`, // כתובת ה-URL שתחזיר את המשתמש לאחר ההגדרה
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      console.log("Document moved from NewVolunteers to Volunteers with ID: ", docId);
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error moving document: ", error);
  }
};
