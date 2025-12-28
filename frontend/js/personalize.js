import { loadHTML } from "./include.js";

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
// if (!loggedInUser) {
//     alert("Please sign in to access Personalized Movies.");
//     window.location.href = "authentication.html";
// }

let personalizedMovies = [];
let filteredMovies = [];

// ===== Initialize Page =====
async function initPersonalizedPage() {
    await loadHTML("header", "partials/header.html");
    await loadHTML("footer", "partials/footer.html");

    personalizedMovies = JSON.parse(localStorage.getItem("personalized") || "[]");
    filteredMovies = [...personalizedMovies];

    displayMovies(filteredMovies);

    setupFilters();
    setupRemoveButtons();
}

// ===== Display Movies =====
function displayMovies(movies) {
    const container = document.querySelector(".personalized-list");
    container.innerHTML = "";

    if (movies.length === 0) {
        container.innerHTML = `
            <div class="no-personalized">
                <h3>No movies found</h3>
                <p>Start personalizing movies from the Home page!</p>
                <a href="index.html" class="btn-primary">Browse Movies</a>
            </div>
        `;
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";
        movieCard.innerHTML = `
            <img src="${movie.customPoster || movie.Poster}" alt="${movie.Title}">
            <h4>${movie.Title}</h4>
            <p>${movie.Year} • ${movie.Genre}</p>
            <p>Status: ${movie.watchStatus || "planned"}</p>
            <p>Rating: ${movie.customRating || movie.imdbRating}</p>
            <p>Notes: ${movie.customNotes || "None"}</p>
            <button class="remove-personalized" data-id="${movie.imdbID}">Remove</button>
        `;
        container.appendChild(movieCard);
    });
}

// ===== Filters (Search + Status + Sliders) =====
function setupFilters() {
    const searchInput = document.getElementById("personal-search");
    const statusFilter = document.getElementById("status-filter");
    const ratingSlider = document.getElementById("rating-filter");
    const ratingValue = document.getElementById("rating-value");
    const yearSlider = document.getElementById("year-filter");
    const yearValue = document.getElementById("year-value");

    // Search input
    if (searchInput) searchInput.addEventListener("input", applyFilters);

    // Status filter
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);

    // Rating slider
    if (ratingSlider && ratingValue) {
        ratingValue.textContent = ratingSlider.value;
        ratingSlider.addEventListener("input", () => {
            ratingValue.textContent = ratingSlider.value;
            applyFilters();
        });
    }

    // Year slider (optional)
    if (yearSlider && yearValue) {
        yearValue.textContent = yearSlider.value;
        yearSlider.addEventListener("input", () => {
            yearValue.textContent = yearSlider.value;
            applyFilters();
        });
    }
}

// ===== Apply Filters =====
function applyFilters() {
    const searchTerm = document.getElementById("personal-search")?.value.toLowerCase() || "";
    const statusFilter = document.getElementById("status-filter")?.value || "";
    const ratingFilter = parseFloat(document.getElementById("rating-filter")?.value || 0);
    const yearFilter = parseInt(document.getElementById("year-filter")?.value || 0);

    filteredMovies = personalizedMovies.filter(movie => {
        const matchesSearch = movie.Title.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter ? movie.watchStatus === statusFilter : true;
        const matchesRating = movie.customRating
            ? movie.customRating >= ratingFilter
            : (movie.imdbRating && parseFloat(movie.imdbRating) >= ratingFilter);
        const matchesYear = yearFilter ? parseInt(movie.Year) >= yearFilter : true;

        return matchesSearch && matchesStatus && matchesRating && matchesYear;
    });

    displayMovies(filteredMovies);
}

// ===== Remove Button Handler =====
function setupRemoveButtons() {
    const container = document.querySelector(".personalized-list");
    container.addEventListener("click", (e) => {
        if (!e.target.classList.contains("remove-personalized")) return;

        const imdbID = e.target.dataset.id;
        personalizedMovies = personalizedMovies.filter(m => m.imdbID !== imdbID);
        localStorage.setItem("personalized", JSON.stringify(personalizedMovies));
        applyFilters();
    });
}

// ===== Initialize =====
initPersonalizedPage();
