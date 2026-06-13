import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { trendingDesigns } from "../utils/data.js";

const TRENDING_DESIGNS_COL = "trendingDesigns";

function normalizeDesign(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    title: data.title || "",
    image: data.image_url || data.image || "",
    description: data.description || "",
    created_at: data.created_at || "",
  };
}

export async function fetchTrendingDesigns() {
  const querySnapshot = await getDocs(collection(db, TRENDING_DESIGNS_COL));
  let designs = querySnapshot.docs.map(normalizeDesign);

  if (designs.length === 0) {
    for (const [index, design] of trendingDesigns.entries()) {
      await setDoc(doc(db, TRENDING_DESIGNS_COL, `seed-${index + 1}`), {
        title: design.title,
        image_url: design.image,
        description: design.description,
        created_at: new Date().toISOString(),
      });
    }

    const seededSnapshot = await getDocs(collection(db, TRENDING_DESIGNS_COL));
    designs = seededSnapshot.docs.map(normalizeDesign);
  }

  return { designs };
}

export async function createTrendingDesign(designData) {
  const payload = {
    title: designData.title,
    image_url: designData.image_url || designData.image || "",
    description: designData.description,
    created_at: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, TRENDING_DESIGNS_COL), payload);

  return {
    design: {
      id: docRef.id,
      title: payload.title,
      image: payload.image_url,
      description: payload.description,
      created_at: payload.created_at,
    },
  };
}

export async function updateTrendingDesign(id, designData) {
  const payload = {
    title: designData.title,
    image_url: designData.image_url || designData.image || "",
    description: designData.description,
  };

  await updateDoc(doc(db, TRENDING_DESIGNS_COL, id), payload);

  return {
    design: {
      id,
      title: payload.title,
      image: payload.image_url,
      description: payload.description,
    },
  };
}

export async function deleteTrendingDesign(id) {
  await deleteDoc(doc(db, TRENDING_DESIGNS_COL, id));
  return { ok: true };
}
