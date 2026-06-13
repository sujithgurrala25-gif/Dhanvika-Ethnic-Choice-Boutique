import { collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { boutiqueProducts } from "../utils/data.js";

const PRODUCTS_COL = "products";

export async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, PRODUCTS_COL));
  let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (products.length === 0) {
    // Seed default products
    for (const p of boutiqueProducts) {
      await setDoc(doc(db, PRODUCTS_COL, p.id), {
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        image_url: p.image || "",
        description: p.description
      });
    }
    const seededSnapshot = await getDocs(collection(db, PRODUCTS_COL));
    products = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return { products };
}

export async function createProduct(productData) {
  const docRef = await addDoc(collection(db, PRODUCTS_COL), productData);
  return { product: { id: docRef.id, ...productData } };
}

export async function updateProduct(id, productData) {
  const docRef = doc(db, PRODUCTS_COL, id);
  await updateDoc(docRef, productData);
  return { product: { id, ...productData } };
}

export async function deleteProduct(id) {
  const docRef = doc(db, PRODUCTS_COL, id);
  await deleteDoc(docRef);
  return { ok: true };
}