import React, { useState, useEffect } from "react";
import "./form.css";

const emptyForm = {
  title: "",
  original_title: "",
  overview: "",
  release_date: "",
  vote_average: "",
  vote_count: "",
  original_language: "",
  popularity: "",
  runtime: "",
  status: "",
  tagline: "",
  budget: "",
  revenue: "",
  genres: "",
  production_companies: "",
  poster_path: "",
};

function Form({ isOpen = true, onClose, editingMovie, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [posterFile, setPosterFile] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (editingMovie) {
      setForm({
        ...emptyForm,
        ...editingMovie,
        genres: Array.isArray(editingMovie.genres)
          ? editingMovie.genres.map((item) => item.name || item).join(", ")
          : editingMovie.genres || "",
        production_companies: Array.isArray(editingMovie.production_companies)
          ? editingMovie.production_companies
              .map((item) => item.name || item)
              .join(", ")
          : editingMovie.production_companies || "",
        poster_path: editingMovie.poster_path || "",
      });
    } else {
      setForm(emptyForm);
    }
    setPosterFile("");
    setFormError("");
  }, [editingMovie, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select an image file.");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setFormError("Image size must be below 1.5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPosterFile(reader.result);
      setFormError("");
    };

    reader.onerror = () => {
      setFormError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const getPosterSrc = (path) => {
    if (!path) return "";
    if (
      path.startsWith("data:image/") ||
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const title = form.title.trim();
    const poster = posterFile || form.poster_path.trim();
    const rating = form.vote_average === "" ? 0 : Number(form.vote_average);

    if (!title) {
      setFormError("Movie title is required.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
      setFormError("Rating must be between 0 and 10.");
      return;
    }

    if (
      poster &&
      !poster.startsWith("data:image/") &&
      !/^https?:\/\/\S+$/i.test(poster)
    ) {
      setFormError("Enter a valid poster URL or upload an image.");
      return;
    }

    const movie = {
      ...form,
      id: editingMovie ? editingMovie.id : `custom-${Date.now()}`,
      title,
      original_title: form.original_title.trim() || title,
      overview: form.overview.trim(),
      poster_path: poster,
      vote_average: rating,
      vote_count: Number(form.vote_count) || 0,
      popularity: Number(form.popularity) || 0,
      runtime: Number(form.runtime) || null,
      budget: Number(form.budget) || 0,
      revenue: Number(form.revenue) || 0,
      original_language: form.original_language.trim() || "N/A",
      genres: form.genres
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, index) => ({ id: index + 1, name })),
      production_companies: form.production_companies
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, index) => ({ id: index + 1, name })),
      isCustom: true,
    };

    if (onSave) {
      const result = onSave(movie);
      if (result && result.success === false) {
        setFormError(result.error || "Unable to save movie.");
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="section-label">YOUR COLLECTION</span>
            <h2>{editingMovie ? "Edit movie" : "Add a movie"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <form className="movie-form" onSubmit={handleSubmit}>
          <label>
            Movie title *
            <input
              required
              maxLength={150}
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Movie title"
            />
          </label>

          <label>
            Original title
            <input
              value={form.original_title}
              onChange={(event) =>
                setForm({ ...form, original_title: event.target.value })
              }
              placeholder="Original movie title"
            />
          </label>

          <label>
            Overview / Description
            <textarea
              rows="4"
              value={form.overview}
              onChange={(event) =>
                setForm({ ...form, overview: event.target.value })
              }
              placeholder="Write the movie description..."
            />
          </label>

          <div className="form-row">
            <label>
              Release date
              <input
                type="date"
                value={form.release_date}
                onChange={(event) =>
                  setForm({ ...form, release_date: event.target.value })
                }
              />
            </label>

            <label>
              Rating (0–10)
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.vote_average}
                onChange={(event) =>
                  setForm({ ...form, vote_average: event.target.value })
                }
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Vote count
              <input
                type="number"
                min="0"
                value={form.vote_count}
                onChange={(event) =>
                  setForm({ ...form, vote_count: event.target.value })
                }
              />
            </label>

            <label>
              Original language
              <input
                value={form.original_language}
                onChange={(event) =>
                  setForm({
                    ...form,
                    original_language: event.target.value,
                  })
                }
                placeholder="ta, en, hi..."
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Popularity
              <input
                type="number"
                min="0"
                step="any"
                value={form.popularity}
                onChange={(event) =>
                  setForm({ ...form, popularity: event.target.value })
                }
              />
            </label>

            <label>
              Runtime (minutes)
              <input
                type="number"
                min="0"
                value={form.runtime}
                onChange={(event) =>
                  setForm({ ...form, runtime: event.target.value })
                }
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Status
              <input
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                placeholder="Released, Post Production..."
              />
            </label>

            <label>
              Tagline
              <input
                value={form.tagline}
                onChange={(event) =>
                  setForm({ ...form, tagline: event.target.value })
                }
                placeholder="Movie tagline"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Budget (USD)
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(event) =>
                  setForm({ ...form, budget: event.target.value })
                }
              />
            </label>

            <label>
              Revenue (USD)
              <input
                type="number"
                min="0"
                value={form.revenue}
                onChange={(event) =>
                  setForm({ ...form, revenue: event.target.value })
                }
              />
            </label>
          </div>

          <label>
            Genres
            <input
              value={form.genres}
              onChange={(event) =>
                setForm({ ...form, genres: event.target.value })
              }
              placeholder="Action, Drama, Comedy (comma-separated)"
            />
          </label>

          <label>
            Production companies
            <input
              value={form.production_companies}
              onChange={(event) =>
                setForm({
                  ...form,
                  production_companies: event.target.value,
                })
              }
              placeholder="Company A, Company B"
            />
          </label>

          <label>
            Poster image URL
            <input
              type="url"
              value={
                form.poster_path.startsWith("data:image/")
                  ? ""
                  : form.poster_path
              }
              onChange={(event) => {
                setForm({ ...form, poster_path: event.target.value });
                setPosterFile("");
              }}
              placeholder="https://example.com/poster.jpg"
            />
          </label>

          <div className="upload-box">
            <div>
              <strong>Upload a poster image</strong>
              <p>JPG, PNG or WebP · Maximum 1.5 MB</p>
            </div>
            <label className="upload-btn">
              Choose image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {(posterFile || form.poster_path) && (
            <div className="image-preview">
              <img
                src={posterFile || getPosterSrc(form.poster_path)}
                alt="Poster preview"
              />
              <span>Poster preview</span>
              <button
                type="button"
                className="danger-btn"
                onClick={() => {
                  setPosterFile("");
                  setForm({ ...form, poster_path: "" });
                }}
              >
                Remove
              </button>
            </div>
          )}

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {editingMovie ? "Save changes" : "Add movie"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export { Form, emptyForm };
export default Form;
