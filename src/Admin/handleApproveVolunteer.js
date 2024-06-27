// import { doc as doc1, getDoc as getDoc1 } from 'firebase/firestore';
// import { addDocument, deleteDocument, sendApprovalEmail } from './AdminFunctions';
// import { db } from '../firebaseConfig.js';
// import { sendSignInLinkToEmail } from 'firebase/auth';

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
//       await sendSignInLinkToEmail(db, docData.mail, actionCodeSettings);
      
//       console.log("Document moved from NewVolunteers to Volunteers with ID: ", docId);
//     } else {
//       console.error("No such document!");
//     }
//   } catch (error) {
//     console.error("Error moving document: ", error);
//   }
// };

import { doc as doc1, getDoc as getDoc1 } from 'firebase/firestore';
import { addDocument, deleteDocument } from './AdminFunctions';
import { db } from '../firebaseConfig.js';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';

export const handleApproveVolunteer = async (docId) => {
  console.log(`Approving volunteer with ID ${docId}`);

  const actionCodeSettings = {
    url: 'http://localhost:3000/finishSignUp', // כתובת ה-URL שתחזיר את המשתמש לאחר ההגדרה
    handleCodeInApp: true,
  };
  
  try {
    const docRef = doc1(db, 'NewVolunteers', docId);
    const docSnap = await getDoc1(docRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      console.log(`Document data: ${JSON.stringify(docData)}`);
      
      await addDocument('Volunteers', { ...docData, id: docId });
      await deleteDocument('NewVolunteers', docId);
      await sendSignInLinkToEmail(auth, docData.mail, actionCodeSettings); // השתמש באובייקט auth במקום db
      
      console.log("Document moved from NewVolunteers to Volunteers with ID: ", docId);
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error moving document: ", error);
  }
};
