import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const FindVolunteers = async (city, lang, vol) => {
  try {
    // Reference to the Volunteers collection
    const volunteersCollection = collection(db, 'Volunteers');
    
    // Create a base query
    let q = query(volunteersCollection);
    q = query(volunteersCollection, where('city', '==', city));

    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Extract and return the IDs of the matching documents
    const ids = querySnapshot.docs.map(doc => doc.id);
    return ids;

  } catch (error) {
    console.error('Error fetching volunteers: ', error);
    return [];
  }
};

export default FindVolunteers;