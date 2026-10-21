import React, { useEffect, useState } from "react";
import "./movie.css";
import Form from "../form/form.jsx";

const API_KEY = "e79d8cb91da22840b1ca865b87e709f5";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const STORAGE_KEY = "my-added-movies";
const readMovies = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

function Movie() {
  const [movies, setMovies] = useState([]);
  const [addedMovies, setAddedMovies] = useState(readMovies);
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState("ta");
  const [activeTab, setActiveTab] = useState("tamil");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  useEffect(() => {
    if (activeTab === "added") {
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const url =
          activeTab === "tamil"
            ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&sort_by=popularity.desc&page=${page}`
            : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 404) {
            setMovies([]);
            setError("notfound");
            return;
          }

          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setMovies(data.results || []);
      } catch (err) {
        if (err.name === "AbortError") {
          if (timedOut) setError("slow");
        } else {
          setError(navigator.onLine ? "failed" : "offline");
          console.error("Movie fetch error:", err);
        }
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    };

    if (!navigator.onLine) {
      setLoading(false);
      setError("offline");
    } else {
      fetchData();
    }

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [page, activeTab, retry]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addedMovies));
    } catch (err) {
      console.error("Storage error:", err);
    }
  }, [addedMovies]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setError("");
    setSelectedMovie(null);
    setMovieDetails(null);
  };

  const getPoster = (movie) => {
    if (!movie || !movie.poster_path) return "";

    if (
      movie.poster_path.startsWith("data:image/") ||
      movie.poster_path.startsWith("http://") ||
      movie.poster_path.startsWith("https://")
    ) {
      return movie.poster_path;
    }

    return `${IMAGE_BASE_URL}${movie.poster_path}`;
  };

  const sourceMovies = activeTab === "added" ? addedMovies : movies;

  const filteredMovies = sourceMovies.filter((movie) => {
    const query = search.trim().toLowerCase();

    return (
      (movie.title || "").toLowerCase().includes(query) ||
      (movie.overview || "").toLowerCase().includes(query)
    );
  });

  const handleViewDetails = async (movie) => {
    setSelectedMovie(movie);
    setMovieDetails(movie.isCustom ? movie : null);
    setDetailsError("");

    if (movie.isCustom) return;

    setDetailsLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMovieDetails(data);
    } catch (err) {
      console.error("Details error:", err);
      setDetailsError("Unable to load complete details. Please try again.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddMovie = () => {
    setEditingMovie(null);
    setFormOpen(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setSelectedMovie(null);
    setMovieDetails(null);
    setFormOpen(true);
  };

  const handleSaveMovie = (movie) => {
    const updatedMovies = editingMovie
      ? addedMovies.map((item) => (item.id === editingMovie.id ? movie : item))
      : [movie, ...addedMovies];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMovies));
      setAddedMovies(updatedMovies);
      setActiveTab("added");
      setPage(1);
      setSearch("");
      setFormOpen(false);
      setEditingMovie(null);
      return { success: true };
    } catch (err) {
      console.error("Unable to save movie:", err);
      return {
        success: false,
        error:
          "Unable to save. Browser storage may be full. Try a smaller image or an image URL.",
      };
    }
  };

  const handleDeleteMovie = (movie) => {
    if (!movie.isCustom) return;

    if (!window.confirm(`Delete "${movie.title}"?`)) return;

    const updatedMovies = addedMovies.filter((item) => item.id !== movie.id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMovies));
      setAddedMovies(updatedMovies);
      setSelectedMovie(null);
      setMovieDetails(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleRetry = () => {
    setError("");
    setRetry((value) => value + 1);
  };

  const closeDetails = () => {
    setSelectedMovie(null);
    setMovieDetails(null);
    setDetailsError("");
  };

  const detail = movieDetails || selectedMovie;

  return (
    <main>
      <section className="section">
        <div className="heading">
          <div>
            <h1>Movies</h1>
          </div>

          <button className="primary-btn" onClick={handleAddMovie}>
            + Add movie
          </button>
        </div>

        <div className="search-wrap">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search movies..."
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>

        <nav className="tabs">
          <button
            className={activeTab === "tamil" ? "tab active" : "tab"}
            onClick={() => handleTabChange("tamil")}
          >
            Tamil Movies
          </button>

          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => handleTabChange("all")}
          >
            All Movies
          </button>

          <button
            className={activeTab === "added" ? "tab active" : "tab"}
            onClick={() => handleTabChange("added")}
          >
            Added Movies <span className="count">{addedMovies.length}</span>
          </button>
        </nav>

        {loading && activeTab !== "added" && (
          <div className="state-screen">
            <div className="spinner" />
            <h2>Loading movies...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="state-screen">
            <div className="state-icon">
              {error === "offline" ? "📡" : error === "slow" ? "⌛" : "🔎"}
            </div>
            <h2>
              {error === "offline"
                ? "No internet connection"
                : error === "slow"
                  ? "Slow network"
                  : error === "notfound"
                    ? "404 — Not found"
                    : "Unable to load movies"}
            </h2>
            <p>
              {error === "offline"
                ? "Check your internet connection and try again."
                : error === "slow"
                  ? "The server took too long to respond."
                  : error === "notfound"
                    ? "The requested movie resource could not be found."
                    : "The movie service could not complete your request."}
            </p>
            <button className="primary-btn" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredMovies.length === 0 && (
          <div className="state-screen">
            <div className="state-icon">{search ? "🔎" : "🎬"}</div>
            <h2>
              {search
                ? "404 — Movie not found"
                : activeTab === "added"
                  ? "Your collection is empty"
                  : "No movies found"}
            </h2>
            <p>
              {search
                ? `No movies match "${search}".`
                : activeTab === "added"
                  ? "Add a movie to start your personal collection."
                  : "Try another category or check again later."}
            </p>
            {activeTab === "added" && !search && (
              <button className="primary-btn" onClick={handleAddMovie}>
                + Add movie
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredMovies.length > 0 && (
          <>
            <div className="results-line">
              <span>
                {activeTab === "tamil"
                  ? "TAMIL CINEMA"
                  : activeTab === "all"
                    ? "POPULAR MOVIES"
                    : "YOUR COLLECTION"}
              </span>
              <span>{filteredMovies.length} movies</span>
            </div>

            <div className="movie-grid">
              {filteredMovies.map((movie) => (
                <article className="movie-card" key={movie.id}>
                  <button
                    className="poster-button"
                    onClick={() => handleViewDetails(movie)}
                  >
                    {getPoster(movie) && (
                      <img
                        className="poster"
                        src={getPoster(movie)}
                        alt={movie.title}
                        loading="lazy"
                      />
                    )}
                    <span className="poster-action">View details ↗</span>
                  </button>

                  <div className="movie-info">
                    <div className="movie-title-row">
                      <h3>{movie.title}</h3>
                      <span className="rating">
                        ★ {Number(movie.vote_average || 0).toFixed(1)}
                      </span>
                    </div>

                    <p className="release">
                      {movie.release_date || "Release date N/A"}
                    </p>

                    <p className="movie-overview">
                      {movie.overview || "No description available."}
                    </p>

                    {movie.isCustom && (
                      <div className="card-actions">
                        <button
                          className="secondary-btn"
                          onClick={() => handleEditMovie(movie)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger-btn"
                          onClick={() => handleDeleteMovie(movie)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {activeTab !== "added" && !search && (
              <div className="pagination">
                <button
                  className="secondary-btn"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </button>
                <span>Page {page}</span>
                <button
                  className="secondary-btn"
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {formOpen && (
        <Form
          isOpen={formOpen}
          editingMovie={editingMovie}
          onClose={() => {
            setFormOpen(false);
            setEditingMovie(null);
          }}
          onSave={handleSaveMovie}
        />
      )}

      {selectedMovie && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <section
            className="modal detail-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="icon-btn close-detail" onClick={closeDetails}>
              ✕
            </button>

            {detailsLoading ? (
              <div className="state-screen">
                <div className="spinner" />
                <h2>Loading movie details...</h2>
              </div>
            ) : detailsError ? (
              <div className="state-screen">
                <h2>Details unavailable</h2>
                <p>{detailsError}</p>
                <button
                  className="primary-btn"
                  onClick={() => handleViewDetails(selectedMovie)}
                >
                  Retry
                </button>
              </div>
            ) : detail ? (
              <div className="full-details">
                <div className="detail-layout">
                  {getPoster(detail) ? (
                    <img
                      className="detail-poster"
                      src={getPoster(detail)}
                      alt={detail.title}
                    />
                  ) : (
                    <div className="detail-poster poster-placeholder">🎞</div>
                  )}

                  <div className="detail-copy">
                    <h2>{detail.title || detail.name}</h2>

                    {detail.original_title && (
                      <p className="detail-muted">
                        Original title: {detail.original_title}
                      </p>
                    )}

                    {detail.tagline && (
                      <p className="detail-tagline">{detail.tagline}</p>
                    )}

                    <p className="detail-meta">
                      ★ {Number(detail.vote_average || 0).toFixed(1)}/10
                      {" · "}
                      {detail.release_date || "Release date N/A"}
                    </p>

                    <p className="detail-overview">
                      {detail.overview || "No overview available."}
                    </p>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Movie information</h3>

                  <div className="details-grid">
                    {[
                      ["Release date", detail.release_date],
                      [
                        "Runtime",
                        detail.runtime ? `${detail.runtime} minutes` : "",
                      ],
                      [
                        "Original language",
                        detail.original_language?.toUpperCase(),
                      ],
                      ["Vote count", detail.vote_count],
                      [
                        "Popularity",
                        detail.popularity != null
                          ? Number(detail.popularity).toFixed(1)
                          : "",
                      ],
                      ["Status", detail.status],
                      [
                        "Budget",
                        detail.budget
                          ? `$${Number(detail.budget).toLocaleString("en-US")}`
                          : "",
                      ],
                      [
                        "Revenue",
                        detail.revenue
                          ? `$${Number(detail.revenue).toLocaleString("en-US")}`
                          : "",
                      ],
                    ].map(([label, value]) => (
                      <div className="detail-field" key={label}>
                        <span>{label}</span>
                        <strong>
                          {value !== "" && value != null ? value : "N/A"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h3>Genres</h3>
                  <div className="genre-list">
                    {detail.genres?.length ? (
                      detail.genres.map((genre, index) => (
                        <span
                          className="genre-chip"
                          key={genre.id || `${genre.name}-${index}`}
                        >
                          {genre.name}
                        </span>
                      ))
                    ) : (
                      <span className="detail-muted">No genres available.</span>
                    )}
                  </div>
                </div>

                <div className="details-section">
                  <h3>Production companies</h3>
                  {detail.production_companies?.length ? (
                    <div className="company-list">
                      {detail.production_companies.map((company, index) => (
                        <div
                          className="company-item"
                          key={company.id || `${company.name}-${index}`}
                        >
                          {company.logo_path && (
                            <img
                              src={`${IMAGE_BASE_URL}${company.logo_path}`}
                              alt=""
                            />
                          )}
                          <span>{company.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="detail-muted">
                      No production company information available.
                    </p>
                  )}
                </div>

                {detail.isCustom && (
                  <div className="card-actions detail-actions">
                    <button
                      className="primary-btn"
                      onClick={() => handleEditMovie(detail)}
                    >
                      Edit movie
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => handleDeleteMovie(detail)}
                    >
                      Delete movie
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
}

export default Movie;
