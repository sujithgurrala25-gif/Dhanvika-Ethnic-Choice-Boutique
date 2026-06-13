import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const USERS_COL = "users";

async function fetchSellableItem(itemId) {
  const productSnap = await getDoc(doc(db, "products", itemId));
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data(), item_type: "product" };
  }

  const designSnap = await getDoc(doc(db, "productDesigns", itemId));
  if (designSnap.exists()) {
    return {
      id: designSnap.id,
      ...designSnap.data(),
      item_type: "productDesign",
    };
  }

  throw new Error("Product not found");
}

export async function fetchUsers() {
  const querySnapshot = await getDocs(collection(db, USERS_COL));
  const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return { users };
}

export async function fetchCart() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { cart: [] };
  const userRef = doc(db, USERS_COL, uid);
  const snap = await getDoc(userRef);
  return { cart: snap.data()?.cart || [] };
}

export async function addToCartApi(productId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { cart: [] };

  const userRef = doc(db, USERS_COL, uid);
  const userSnap = await getDoc(userRef);
  const currentCart = userSnap.data()?.cart || [];

  if (!currentCart.some(item => item.id === productId)) {
    const product = await fetchSellableItem(productId);

    const updatedCart = [...currentCart, product];
    await updateDoc(userRef, { cart: updatedCart });
    return { cart: updatedCart };
  }
  return { cart: currentCart };
}

export async function removeFromCartApi(productId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { cart: [] };

  const userRef = doc(db, USERS_COL, uid);
  const userSnap = await getDoc(userRef);
  const currentCart = userSnap.data()?.cart || [];

  const updatedCart = currentCart.filter(item => item.id !== productId);
  await updateDoc(userRef, { cart: updatedCart });
  return { cart: updatedCart };
}

export async function fetchWishlist() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { wishlist: [] };
  const userRef = doc(db, USERS_COL, uid);
  const snap = await getDoc(userRef);
  return { wishlist: snap.data()?.wishlist || [] };
}

export async function toggleWishlistApi(productId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { wishlist: [] };

  const userRef = doc(db, USERS_COL, uid);
  const userSnap = await getDoc(userRef);
  const currentWishlist = userSnap.data()?.wishlist || [];

  let updatedWishlist;
  if (currentWishlist.some(item => item.id === productId)) {
    updatedWishlist = currentWishlist.filter(item => item.id !== productId);
  } else {
    const product = await fetchSellableItem(productId);
    updatedWishlist = [...currentWishlist, product];
  }

  await updateDoc(userRef, { wishlist: updatedWishlist });
  return { wishlist: updatedWishlist };
}

export async function clearCartApi() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { cart: [] };
  const userRef = doc(db, USERS_COL, uid);
  await updateDoc(userRef, { cart: [] });
  return { cart: [] };
}
