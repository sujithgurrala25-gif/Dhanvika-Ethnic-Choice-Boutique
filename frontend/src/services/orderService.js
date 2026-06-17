import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { outfitOptions } from "../utils/data.js";

const ORDERS_COL = "orders";

export async function fetchOrders() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { orders: [] };

  // Determine user role from the users collection
  const userSnap = await getDoc(doc(db, "users", uid));
  const userData = userSnap.data();
  const isAdmin = userData?.role === "admin";

  let querySnapshot;
  if (isAdmin) {
    querySnapshot = await getDocs(collection(db, ORDERS_COL));
  } else {
    const q = query(collection(db, ORDERS_COL), where("user_id", "==", uid));
    querySnapshot = await getDocs(q);
  }

  const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return { orders };
}

export async function fetchOrderById(id) {
  const docSnap = await getDoc(doc(db, ORDERS_COL, id));
  if (!docSnap.exists()) {
    throw new Error("Order not found");
  }
  return { order: { id: docSnap.id, ...docSnap.data() } };
}

export async function createOrder(orderData) {
  // Try to find outfit details to attach for UI display compatibility
  const outfitType = (orderData.outfit_type || "").toLowerCase();
  const outfitTitle = (orderData.outfit_title || "").toLowerCase();
  const outfitCat = (orderData.outfit_category || "").toLowerCase();

  const outfit = outfitOptions.find(
    (o) =>
      o.id === outfitType ||
      (o.category || "").toLowerCase() === outfitType ||
      (o.category || "").toLowerCase() === outfitCat ||
      o.title.toLowerCase() === outfitTitle
  ) || {
    id: outfitType || "custom",
    title: orderData.outfit_title || orderData.outfit_type || "Custom",
    image: orderData.fabric_image || ""
  };

  const payload = {
    ...orderData,
    user_id: auth.currentUser?.uid || "offline",
    status: orderData.status || "Order Received",
    price: orderData.total_price || orderData.price || 0,
    createdAt: new Date().toISOString(),
    outfit: {
      id: outfit.id,
      title: outfit.title,
      image: outfit.image || ""
    },
    // Map backend customisation formats for compatibility
    customization: orderData.customization || {
      neckStyle: orderData.neck_style || "Round",
      sleeveStyle: orderData.sleeve_style || "Short",
      fittingStyle: orderData.fitting || "Regular",
      extras: orderData.extras || []
    }
  };

  const docRef = await addDoc(collection(db, ORDERS_COL), payload);
  return { order: { id: docRef.id, ...payload } };
}

export async function updateOrderStatus(id, status) {
  const docRef = doc(db, ORDERS_COL, id);
  await updateDoc(docRef, { status });
  const snap = await getDoc(docRef);
  return { order: { id: snap.id, ...snap.data() } };
}

export async function deleteOrder(id) {
  const docRef = doc(db, ORDERS_COL, id);
  await deleteDoc(docRef);
  return { ok: true };
}