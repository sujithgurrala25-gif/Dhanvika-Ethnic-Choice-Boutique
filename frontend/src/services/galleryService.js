import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const GALLERY_COL = "gallery";

function getCreatedTime(item) {
  const value = item.createdAt || item.created_at;

  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchGalleryWorks() {
  let snapshot;

  try {
    snapshot = await getDocs(
      query(collection(db, GALLERY_COL), orderBy("createdAt", "desc")),
    );
  } catch (error) {
    snapshot = await getDocs(collection(db, GALLERY_COL));
  }

  const galleryWorks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  galleryWorks.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));

  return { galleryWorks };
}
