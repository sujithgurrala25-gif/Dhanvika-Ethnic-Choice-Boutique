import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const PRODUCT_DESIGNS_COL = "productDesigns";

function normalizeDesign(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    parent_product_id: data.parent_product_id || data.parentProductId || "",
    category: data.category || "",
    name: data.name || data.title || "",
    image: data.image_url || data.image || "",
    image_url: data.image_url || data.image || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    stock: Number(data.stock) || 0,
    created_at: data.created_at || "",
  };
}

export async function fetchProductDesigns() {
  const querySnapshot = await getDocs(collection(db, PRODUCT_DESIGNS_COL));
  const designs = querySnapshot.docs.map(normalizeDesign);

  return { designs };
}

export async function createProductDesign(designData) {
  const payload = {
    parent_product_id: designData.parent_product_id || "",
    category: designData.category,
    name: designData.name,
    image_url: designData.image_url || designData.image || "",
    description: designData.description,
    price: Number(designData.price) || 0,
    stock: Number(designData.stock) || 0,
    created_at: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, PRODUCT_DESIGNS_COL), payload);

  return {
    design: {
      id: docRef.id,
      ...payload,
      image: payload.image_url,
    },
  };
}

export async function updateProductDesign(id, designData) {
  const payload = {
    parent_product_id: designData.parent_product_id || "",
    category: designData.category,
    name: designData.name,
    image_url: designData.image_url || designData.image || "",
    description: designData.description,
    price: Number(designData.price) || 0,
    stock: Number(designData.stock) || 0,
  };

  await updateDoc(doc(db, PRODUCT_DESIGNS_COL, id), payload);

  return {
    design: {
      id,
      ...payload,
      image: payload.image_url,
    },
  };
}

export async function deleteProductDesign(id) {
  await deleteDoc(doc(db, PRODUCT_DESIGNS_COL, id));
  return { ok: true };
}
