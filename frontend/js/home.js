import { loadHTML } from "./include.js";
import { initAuth } from "./authentication.js";
import Movie from "./movies.js";

const movieLoader = new Movie();


function addMovieCard(movie, containerId = "movie-list") {
    const container = document.getElementById(containerId);
    if (!container || !movie) {
        console.log("Can't find container or movie");
        return;
    }

    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
        <div class="card-poster">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title}" />
        </div>

        <div class="card-info">
            <h4>${movie.Title}</h4>
            <p>${movie.Year}</p>
            <p>${movie.Genre}</p>
        </div>

        <div class="card-actions">
            <button class="view-details-btn" data-id="${movie.imdbID}">View Details</button>
            <button class="add-favorite-btn" data-id="${movie.imdbID}">Add to Favorites</button>
        </div>
    `;

    container.appendChild(movieCard);

    movieCard.querySelector(".view-details-btn")
        .addEventListener("click", () => handleViewDetails(movie.imdbID));

    movieCard.querySelector(".add-favorite-btn")
        .addEventListener("click", () => addToFav(movie.imdbID));
}

function addToFav(id) {
    const movie = movieLoader.getById(id);
    if (!movie) return;

    movie.isFavorite = true;

    let favorites = JSON.parse(localStorage.getItem("moviehub_favorites") || "[]");

    if (!favorites.find(fav => fav.imdbID === movie.imdbID)) {
        favorites.push(movie);
        localStorage.setItem("moviehub_favorites", JSON.stringify(favorites));
        alert(`${movie.Title} added to favorites!`);
    } else {
        alert(`${movie.Title} is already in favorites.`);
    }
}


function handleViewDetails(id) {
    const movie = movieLoader.getById(id);
    if (movie) showCardDetails(movie);
}

function showCardDetails(movie) {
    const container = document.getElementById("movie-detail-card");
    if (!container) return;

    container.innerHTML = `
        <div class="detail-card">

            <div class="card-poster">
                <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title}" />
            </div>

            <div class="card-info">
                <h4>${movie.Title}</h4>
                <p>${movie.Year}</p>
                <p>${movie.Genre}</p>
                <p>IMDb Rating: ${movie.imdbRating}</p>
                <p>Awards: ${movie.Awards}</p>
                <p>Box Office: ${movie.BoxOffice}</p>
                <p>Language: ${movie.Language}</p>
                <p>Writer: ${movie.Writer}</p>
            </div>

            <div class="card-actions">
                <button id="add-favorite-btn">Add to Favorites</button>
                <button id="watch-trailer-btn">Watch Trailer</button>
                <button id="close-detail-btn">Close</button>
                <a href="includes/personalize.html" id="personalize-btn">Personalize</a>
            </div>

        </div>
    `;

    container.style.display = "block";

    document.getElementById("close-detail-btn")
        .addEventListener("click", () => container.style.display = "none");

    document.getElementById("add-favorite-btn")
        .addEventListener("click", () => addToFav(movie.imdbID));

    document.getElementById("watch-trailer-btn")
        .addEventListener("click", () => {
            const query = encodeURIComponent(`${movie.Title} official trailer`);
            window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
        });
}


async function initHomePage() {
    await loadHTML("header", "partials/header.html");
    await loadHTML("footer", "partials/footer.html");
    await loadHTML("auth-modal", "partials/authentication.html");

    initAuth();

    const selectedMovies = [
        "The Shawshank Redemption",
        "The Godfather",
        "The Dark Knight",
        "Inception",
        "Forrest Gump",
        "Interstellar",
        "Gladiator",
        "Jurassic Park",
        "Pulp Fiction",
        "The Matrix",
        "Back to the Future",
        "Fight Club"
    ];

    for (const title of selectedMovies) {
        await movieLoader.searchByTitle(title);
        const movies = movieLoader.getMovies();
        if (movies.length) addMovieCard(movies[0]);
    }

    setupFilters();
}

function setupFilters() {
    updateSliderValue("year", "year-value");
    updateSliderValue("rating", "rating-value");

    document.getElementById("year")?.addEventListener("input", () =>
        updateSliderValue("year", "year-value")
    );

    document.getElementById("rating")?.addEventListener("input", () =>
        updateSliderValue("rating", "rating-value")
    );

    document.getElementById("search-input")
        ?.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
            }
        });
}

function updateSliderValue(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider && display) display.textContent = slider.value;
}

async function handleSearch() {
    const query = document.getElementById("search-input").value.trim();
    if (!query) return;

    const searchResults = document.getElementById("search-results");
    searchResults.innerHTML = "";

    const loader = new Movie();
    await loader.searchByTitle(query);

    const filterEnabled = document.getElementById("filter-enable")?.checked;

    if (filterEnabled) {
        const genre = document.getElementById("genre").value;
        const year = Number(document.getElementById("year").value);
        const rating = Number(document.getElementById("rating").value);

        if (genre) loader.filterByGenre(genre);
        if (year) loader.filterByYear(year);
        if (rating) loader.filterByRating(rating);
    }

    const movies = loader.getMovies();
    if (!movies.length) {
        searchResults.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.forEach(movie => addMovieCard(movie, "search-results"));
}

window.handleSearch = handleSearch;
initHomePage();
