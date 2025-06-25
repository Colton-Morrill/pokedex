// DOM ELEMENTS
const container = document.getElementById("pokemon-container");
const countSelect = document.getElementById("card-count");
const settingsBtn = document.getElementById("settings-btn");
const settingsPopup = document.getElementById("settings-popup");
const closeSettings = document.getElementById("close-settings");
const prevButton = document.getElementById("prev-button");
const desktopSelect = document.getElementById("card-count-desktop");
const mobileSelect = document.getElementById("card-count-mobile");

// CONSTANTS
const API_POKE = "https://pokeapi.co/api/v2/pokemon";

// STATE
let limit = parseInt(desktopSelect.value);
let offset = 0;

// UTILITIES
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// SKELETON LOADER
function showSkeletonLoader(count = 10) {
  const loadingHTML = `
    <div class="loading-box">
      <img src="assets/poke-loader.gif" alt="Loading" />
      <p>Searching tall grass...</p>
    </div>
  `;

  const skeletonCard = `
    <div class="pokemon-card skeleton">
      <div class="skeleton-img"></div>
      <div class="skeleton-text"></div>
    </div>
  `;

  container.innerHTML = loadingHTML + Array(count).fill(skeletonCard).join("");
}

// FETCH DATA
async function fetchPokemonList() {
  showSkeletonLoader(limit);
  try {
    const res = await fetch(`${API_POKE}?limit=${limit}&offset=${offset}`);
    const data = await res.json();
    const detailedData = await Promise.all(
      data.results.map((p) => fetch(p.url).then((r) => r.json()))
    );

    renderCards(detailedData);
  } catch (err) {
    console.error("API fetch failed:", err);
    container.innerHTML = `
      <div class="error-message">
        <img src="assets/error.png" alt="Error" />
        <p>Failed to load Pokémon. Try again later.</p>
      </div>
    `;
  }
}

// RENDER CARDS
function renderCards(pokemonArray) {
  container.innerHTML = "";

  pokemonArray.forEach((pokemon) => {
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <p class="pokedex-numb">${pokemon.id}</p>
      <img src="${
        pokemon.sprites.front_default || "assets/placeholder.png"
      }" alt="${pokemon.name}" />
      <h3>${capitalize(pokemon.name)}</h3>
    `;
    container.appendChild(card);
  });
}

// PAGINATION
function nextPage() {
  offset += limit;
  prevButton.classList.remove("disabled");
  fetchPokemonList();
}

function prevPage() {
  offset = Math.max(0, offset - limit);
  fetchPokemonList();

  prevButton.classList.toggle("disabled", offset === 0);
}

// SETTINGS POPUP
settingsBtn.addEventListener("click", () => {
  settingsPopup.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
  settingsPopup.classList.add("hidden");
});

// CARD COUNT SELECT HANDLER
function onCardCountChange(e) {
  limit = parseInt(e.target.value);
  offset = 0;
  prevButton.classList.toggle("disabled", offset === 0);
  const syncedValue = e.target.value;
  desktopSelect.value = syncedValue;
  mobileSelect.value = syncedValue;

  fetchPokemonList();
}

desktopSelect.addEventListener("change", onCardCountChange);
mobileSelect.addEventListener("change", onCardCountChange);

// INITIAL LOAD
fetchPokemonList();
