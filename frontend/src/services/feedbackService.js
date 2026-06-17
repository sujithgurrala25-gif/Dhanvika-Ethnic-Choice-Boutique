import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { defaultFeedback } from "../utils/data.js";

const FEEDBACK_COL = "feedback";

export async function fetchFeedback() {
  const querySnapshot = await getDocs(collection(db, FEEDBACK_COL));
  let feedback = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (feedback.length === 0) {
    // Seed default feedback
    for (const fb of defaultFeedback) {
      await setDoc(doc(db, FEEDBACK_COL, fb.id), {
        name: fb.name,
        outfit_type: fb.outfitType || fb.outfit_type,
        rating: fb.rating,
        message: fb.message,
        user_id: "seed",
        created_at: new Date().toISOString()
      });
    }
    const seededSnapshot = await getDocs(collection(db, FEEDBACK_COL));
    feedback = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Sort feedback by created_at DESC
  feedback.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

  return { feedback };
}

export async function createFeedback(feedbackData) {
  const payload = {
    ...feedbackData,
    user_id: auth.currentUser?.uid || "anonymous",
    created_at: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, FEEDBACK_COL), payload);
  return { feedback: { id: docRef.id, ...payload } };
}

export async function updateFeedback(id, feedbackData) {
  const docRef = doc(db, FEEDBACK_COL, id);
  await updateDoc(docRef, feedbackData);
  return { feedback: { id, ...feedbackData } };
}

export async function deleteFeedback(id) {
  const docRef = doc(db, FEEDBACK_COL, id);
  await deleteDoc(docRef);
  return { ok: true };
}