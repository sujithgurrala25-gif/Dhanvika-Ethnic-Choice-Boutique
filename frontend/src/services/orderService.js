import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
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

  let orderNum = orderData.orderNum;
  if (!orderNum) {
    let nextOrderNum = 1000;
    try {
      const q = query(collection(db, ORDERS_COL), orderBy("orderNum", "desc"), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const highestOrder = qSnap.docs[0].data();
        const highestNum = Number(highestOrder.orderNum);
        if (!isNaN(highestNum) && highestNum >= 1000) {
          nextOrderNum = highestNum + 1;
        }
      }
    } catch (err) {
      console.error("Failed to query highest orderNum using orderBy, falling back to full scan:", err);
      try {
        const allSnap = await getDocs(collection(db, ORDERS_COL));
        let highestNum = 999;
        allSnap.forEach((doc) => {
          const num = Number(doc.data().orderNum);
          if (!isNaN(num) && num > highestNum) {
            highestNum = num;
          }
        });
        nextOrderNum = highestNum + 1;
      } catch (scanErr) {
        console.error("Full scan also failed, using fallback random order number:", scanErr);
        nextOrderNum = Math.floor(1000 + Math.random() * 9000);
      }
    }
    orderNum = nextOrderNum;
  }

  const payload = {
    ...orderData,
    user_id: auth.currentUser?.uid || "offline",
    orderNum,
    status: orderData.status || "Order Received",
    price: orderData.total_price || orderData.price || 0,
    createdAt: orderData.createdAt || new Date().toISOString(),
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