import React, { useEffect, useState } from "react";
import "./movie.css";

const API_KEY = "e79d8cb91da22840b1ca865b87e709f5";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const Movie = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [language, setLanguage] = useState("ta");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url =
          language === "ta"
            ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ta&sort_by=popularity.desc&page=${page}`
            : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;

        const res = await fetch(url);
        const data = await res.json();
        console.log("Status code: ", res.status);
        setMovies(data.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, language]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setPage(1);
  };
  const filter = movies.filter((movie) =>
    (movie.title || "").toLowerCase().includes(search.toLowerCase().trim()),
  );

  return (
    <div>
      <h2 className="heading">Movie Details</h2>
      <label>Search : </label>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          const val = e.target.value;
          setSearch(val);
          console.log(val);
        }}
        placeholder="Type to search..."
      />
      <div className="filter-tabs">
        <button
          className={`filter-btn ${language === "ta" ? "active" : ""}`}
          onClick={() => handleLanguageChange("ta")}
        >
          Tamil Movies
        </button>
        <button
          className={`filter-btn ${language === "all" ? "active" : ""}`}
          onClick={() => handleLanguageChange("all")}
        >
          All Movies
        </button>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>

          <p className="loading-text">Loading movies...</p>
        </div>
      )}

      {!loading && filter.length === 0 && (
        <div className="not-found-container">
          <h3 className="not-found-title">No Movies Found</h3>
          <p className="not-found-desc">
            {search
              ? `No movies match "${search}". Try another search term!`
              : "We couldn't find any movies for this selection. Try switching filters or check back later!"}
          </p>
        </div>
      )}

      {!loading && filter.length > 0 && (
        <>
          <div className="movie-card">
            {filter.map((item) => (
              <div key={item.id} className="movie">
                <img
                  src={
                    item.poster_path
                      ? `${IMAGE_BASE_URL}${item.poster_path}`
                      : "https://via.placeholder.com/500x750?text=No+Poster"
                  }
                  alt={item.title}
                  className="movie-poster"
                />
                <h2>{item.title}</h2>
                <p>
                  <strong>Release:</strong> {item.release_date || "N/A"}
                </p>
                <p>
                  <strong>Rating:</strong> {item.vote_average ?? "N/A"}
                </p>
                <p className="overview">
                  {item.overview || "No overview available."}
                </p>
                <button className="btn" onClick={() => setSelectedMovie(item)}>
                  View Details
                </button>
              </div>
            ))}
          </div>

          <div className="Page">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span>Page {page}</span>
            <button onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}

      {selectedMovie && (
        <div className="modal-backdrop" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedMovie(null)}
            >
              ✕
            </button>
            <div className="modal-body">
              <img
                src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
                className="modal-poster"
              />
              <div className="modal-info">
                <h2>{selectedMovie.title}</h2>
                {selectedMovie.original_title !== selectedMovie.title && (
                  <p className="original-title">
                    <em>Original Title: {selectedMovie.original_title}</em>
                  </p>
                )}
                <p>
                  <strong>Release Date:</strong> {selectedMovie.release_date}
                </p>
                <p>
                  <strong>Rating:</strong> ⭐ {selectedMovie.vote_average} / 10
                  ({selectedMovie.vote_count} votes)
                </p>
                <p>
                  <strong>Language:</strong>{" "}
                  {selectedMovie.original_language?.toUpperCase()}
                </p>
                <p>
                  <strong>Popularity:</strong> {selectedMovie.popularity}
                </p>
                <div className="modal-overview">
                  <strong>Overview:</strong>
                  <p>{selectedMovie.overview || "No overview available."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movie;
