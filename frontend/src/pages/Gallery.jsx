import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Gallery() {
  const { user } = useAuth();

  //new
  const [galleryWorks, setGalleryWorks] = useState([]);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      const snapshot = await getDocs(collection(db, "gallery"));
      const works = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGalleryWorks(works);
    } catch (error) {
      console.error(error);
    }
  }

  const [uploadedImages, setUploadedImages] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [form, setForm] = useState({
    id: null,
    title: "",
    category: "",
    description: "",
    images: "",
  });

  function resetForm() {
    setForm({ id: null, title: "", category: "", description: "", images: "" });
    setUploadedImages([]);
  }

  //new
  async function handleFileUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);

          await uploadBytes(storageRef, file);

          return await getDownloadURL(storageRef);
        }),
      );

      setUploadedImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    }

    event.target.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.category.trim()) return;

    const urlImages = form.images
      .split("\n")
      .map((img) => img.trim())
      .filter(Boolean);

    const images = [...new Set([...uploadedImages, ...urlImages])];

    const data = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      images,
    };

    try {
      if (form.id) {
        // Edit existing gallery item
        await updateDoc(doc(db, "gallery", form.id), data);
      } else {
        // Add new gallery item
        await addDoc(collection(db, "gallery"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      await loadGallery();
      resetForm();
    } catch (error) {
      console.error(error);
    }
  }

  function handleEdit(item) {
    const allImages = item.images || [item.image];
    const uploaded = allImages.filter(
      (img) => typeof img === "string" && img.startsWith("data:"),
    );
    const urls = allImages.filter(
      (img) => !(typeof img === "string" && img.startsWith("data:")),
    );

    setForm({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      images: urls.join("\n"),
    });
    setUploadedImages(uploaded);
  }

  //new
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this gallery item?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "gallery", id));

      setGalleryWorks((prev) => prev.filter((item) => item.id !== id));

      if (form.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function openLightbox(itemId, imageIndex = 0) {
    setLightbox({ itemId, imageIndex });
  }

  function closeLightbox() {
    setLightbox(null);
  }

  function showPreviousImage() {
    if (!lightbox) return;
    const work = galleryWorks.find((item) => item.id === lightbox.itemId);
    const images =
      work?.images && work.images.length ? work.images : [work?.image];
    setLightbox((prev) =>
      prev
        ? {
            itemId: prev.itemId,
            imageIndex: (prev.imageIndex - 1 + images.length) % images.length,
          }
        : prev,
    );
  }

  function showNextImage() {
    if (!lightbox) return;
    const work = galleryWorks.find((item) => item.id === lightbox.itemId);
    const images =
      work?.images && work.images.length ? work.images : [work?.image];
    setLightbox((prev) =>
      prev
        ? {
            itemId: prev.itemId,
            imageIndex: (prev.imageIndex + 1) % images.length,
          }
        : prev,
    );
  }

  return (
    <section className="page-shell py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Gallery</p>
          <h1 className="section-title">Previous Works Showcase</h1>
          <p className="mt-4 max-w-3xl text-ink/70 leading-7">
            This public gallery page is visible to everyone. It gives admins a
            clean place to showcase completed outfits, premium stitching
            samples, and previous work for visitors to browse.
          </p>
        </div>
      </div>

      {user?.role === "admin" && (
        <section className="mb-8 rounded-2xl border border-plum/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
                Admin Controls
              </p>
              <h2 className="font-display text-2xl font-bold text-plum">
                Add or edit gallery work
              </h2>
            </div>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              className="input-field"
              placeholder="Title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <input
              className="input-field"
              placeholder="Category"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
            />
            <textarea
              className="input-field md:col-span-2"
              rows="3"
              placeholder="Description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
            <div className="md:col-span-2 rounded-xl border border-dashed border-plum/20 bg-cream/70 p-4">
              <label className="mb-2 block text-sm font-semibold text-plum">
                Upload images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-plum file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-plum/90"
              />
              <p className="mt-2 text-xs text-ink/60">
                You can upload local images here, or paste image URLs below.
              </p>
              {uploadedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedImages.map((img, index) => (
                    <img
                      key={`${img}-${index}`}
                      src={img}
                      alt="Uploaded preview"
                      className="h-16 w-16 rounded-md object-cover border border-plum/10"
                    />
                  ))}
                </div>
              )}
            </div>
            <textarea
              className="input-field md:col-span-2"
              rows="3"
              placeholder="Or paste image URLs (one per line). These will be added alongside uploaded images."
              value={form.images}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, images: event.target.value }))
              }
            />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">
                {form.id ? "Update Work" : "Add New Work"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {galleryWorks.map((item) => {
          const images =
            item.images && item.images.length ? item.images : [item.image];
          return (
            <article key={item.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => openLightbox(item.id, 0)}
                className="block w-full text-left"
              >
                <div className="grid gap-2 p-2">
                  {images.slice(0, 3).map((image, index) => (
                    <img
                      key={`${item.id}-${index}`}
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className={`w-full rounded-xl object-cover ${images.length > 1 ? "h-28" : "h-56"}`}
                    />
                  ))}
                </div>
              </button>
              <div className="p-5 pt-0">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-rose">
                  <ImageIcon size={14} />
                  {item.category}
                </div>
                <h2 className="font-display text-2xl font-bold text-plum">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink/68">
                  {item.description}
                </p>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(item.id, 0)}
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-plum/8 px-3 py-1 text-xs font-semibold text-plum"
                  >
                    Open image slider
                  </button>
                )}
                {user?.role === "admin" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="btn-secondary flex items-center gap-1"
                    >
                      {" "}
                      <Pencil size={14} /> Edit{" "}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="btn-secondary flex items-center gap-1 text-rose"
                    >
                      {" "}
                      <Trash2 size={14} /> Delete{" "}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {lightbox &&
        (() => {
          const work = galleryWorks.find((item) => item.id === lightbox.itemId);
          const images =
            work?.images && work.images.length ? work.images : [work?.image];
          const currentImage = images[lightbox.imageIndex] || images[0];

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
              onClick={closeLightbox}
            >
              <div
                className="w-full max-w-6xl rounded-3xl bg-white p-4 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">
                      Gallery viewer
                    </p>
                    <h3 className="font-display text-xl font-bold text-plum">
                      {work?.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="rounded-full bg-cream p-2 text-plum hover:bg-cream/90"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                  <div className="relative rounded-2xl bg-cream/50 p-3">
                    <img
                      src={currentImage}
                      alt={`${work?.title} preview ${lightbox.imageIndex + 1}`}
                      className="h-[420px] w-full rounded-2xl object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={showPreviousImage}
                          className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/70"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={showNextImage}
                          className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/70"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                    <p className="mt-3 text-xs text-ink/65">
                      Image {lightbox.imageIndex + 1} of {images.length}
                    </p>
                  </div>

                  {images.length > 1 && (
                    <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
                      {images.map((image, index) => (
                        <button
                          key={`${work?.id}-${index}`}
                          type="button"
                          onClick={() =>
                            setLightbox((prev) =>
                              prev ? { ...prev, imageIndex: index } : prev,
                            )
                          }
                          className={`rounded-xl border p-1 text-left ${index === lightbox.imageIndex ? "border-plum bg-plum/5" : "border-transparent bg-cream/60"}`}
                        >
                          <img
                            src={image}
                            alt={`${work?.title} thumbnail ${index + 1}`}
                            className="h-20 w-full rounded-lg object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </section>
  );
}
