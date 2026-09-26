const tracks = [
  { id:"kishore", artist:"Kishore Kumar", title:"Kishore Kumar Mix", image:"kishore.png", audio:"songs/kishore.mp3" },
  { id:"nfak", artist:"Nusrat Fateh Ali Khan", title:"Nusrat Fateh Ali Khan Mix", image:"nfak.png", audio:"songs/nfak.mp3" },
  { id:"arijit", artist:"Arijit Singh", title:"Arijit Singh Mix", image:"arijit.jpg", audio:"songs/arijit.mp3" },
  { id:"atif", artist:"Atif Aslam", title:"Atif Aslam Mix", image:"atif.png", audio:"songs/atif.mp3" },
  { id:"jani", artist:"Jani", title:"Jani Mix", image:"jani.jpg", audio:"songs/jani.mp3" },
  { id:"talha", artist:"Talha Anjum", title:"Talha Anjum Mix", image:"TA.png", audio:"songs/talha.mp3" }
];

const audio = document.getElementById("audio");
const grid = document.getElementById("artistGrid");
const libraryList = document.getElementById("libraryList");
const libraryEmpty = document.getElementById("libraryEmpty");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const playerCover = document.getElementById("playerCover");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const volume = document.getElementById("volume");
const playerLike = document.getElementById("playerLike");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const likedToggle = document.getElementById("likedToggle");
const artistsSection = document.getElementById("artistsSection");
const librarySection = document.getElementById("librarySection");
const backToArtists = document.getElementById("backToArtists");

let currentIndex = -1;
let shuffle = false;
let repeat = false;
let showingLibrary = false;
let liked = JSON.parse(localStorage.getItem("tunex-liked") || "[]");

audio.volume = Number(localStorage.getItem("tunex-volume") ?? 0.7);
volume.value = audio.volume;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secondsPart = Math.floor(seconds % 60).toString().padStart(2, "0");
  return minutes + ":" + secondsPart;
}

function isLiked(id) {
  return liked.includes(id);
}

function toggleLike(id) {
  liked = isLiked(id)
    ? liked.filter(item => item !== id)
    : [...liked, id];

  localStorage.setItem("tunex-liked", JSON.stringify(liked));
  renderArtists(searchInput.value);
  renderLibrary();
  updatePlayerLike();
}

function renderArtists(query = "") {
  const q = query.trim().toLowerCase();

  const filtered = tracks.filter(track =>
    track.artist.toLowerCase().includes(q) ||
    track.title.toLowerCase().includes(q)
  );

  resultCount.textContent =
    filtered.length + " artist" + (filtered.length === 1 ? "" : "s");

  emptyState.classList.toggle("hidden", filtered.length !== 0);

  grid.innerHTML = filtered.map(track => {
    const playing = tracks[currentIndex]?.id === track.id;
    const icon = playing && !audio.paused ? "fa-pause" : "fa-play";

    return `
      <article class="artist-card ${playing ? "playing" : ""}" data-id="${track.id}">
        <div class="artist-image-wrap">
          <img class="artist-image" src="${track.image}" alt="${track.artist}" loading="lazy">
          <button class="card-play" data-play="${track.id}" aria-label="Play ${track.artist}">
            <i class="fa-solid ${icon}"></i>
          </button>
        </div>
        <div class="card-info">
          <div>
            <strong>${track.artist}</strong>
            <span>${track.title}</span>
          </div>
          <button class="like-btn ${isLiked(track.id) ? "liked" : ""}" data-like="${track.id}" aria-label="Like ${track.artist}">
            <i class="fa-${isLiked(track.id) ? "solid" : "regular"} fa-heart"></i>
          </button>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".artist-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("[data-like]")) return;

      const index = tracks.findIndex(track => track.id === card.dataset.id);

      if (index === currentIndex && !audio.paused) {
        audio.pause();
      } else {
        playTrack(index);
      }
    });
  });

  grid.querySelectorAll("[data-like]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      toggleLike(button.dataset.like);
    });
  });
}

function renderLibrary() {
  const saved = tracks.filter(track => isLiked(track.id));

  libraryEmpty.classList.toggle("hidden", saved.length > 0);

  libraryList.innerHTML = saved.map(track => `
    <div class="library-row">
      <img src="${track.image}" alt="${track.artist}">
      <div>
        <strong>${track.artist}</strong>
        <span>${track.title}</span>
      </div>
      <button data-library-play="${track.id}" aria-label="Play ${track.artist}">
        <i class="fa-solid fa-play"></i>
      </button>
    </div>
  `).join("");

  libraryList.querySelectorAll("[data-library-play]").forEach(button => {
    button.addEventListener("click", () => {
      const index = tracks.findIndex(track => track.id === button.dataset.libraryPlay);
      playTrack(index);
    });
  });
}

function showLibrary(show) {
  showingLibrary = show;
  artistsSection.classList.toggle("hidden", show);
  librarySection.classList.toggle("hidden", !show);
  likedToggle.classList.toggle("active", show);
}

function updatePlayerLike() {
  if (currentIndex < 0) return;

  const active = isLiked(tracks[currentIndex].id);
  playerLike.classList.toggle("liked", active);
  playerLike.innerHTML =
    '<i class="fa-' + (active ? "solid" : "regular") + ' fa-heart"></i>';
}

function updatePlayerUI() {
  const track = tracks[currentIndex];
  if (!track) return;

  playerCover.src = track.image;
  playerCover.alt = track.artist;
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  playBtn.innerHTML =
    '<i class="fa-solid ' + (audio.paused ? "fa-play" : "fa-pause") + '"></i>';

  progress.value = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);

  updatePlayerLike();

  if (!showingLibrary) renderArtists(searchInput.value);
}

function playTrack(index) {
  if (index < 0 || index >= tracks.length) return;

  currentIndex = index;
  const track = tracks[index];

  if (!audio.src.endsWith(track.audio)) {
    audio.src = track.audio;
    audio.load();
  }

  audio.play().catch(error => {
    console.error("TuneX audio error:", error);
  });

  updatePlayerUI();
}

function nextTrack() {
  if (currentIndex < 0) {
    playTrack(0);
    return;
  }

  if (shuffle && tracks.length > 1) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } while (nextIndex === currentIndex);

    playTrack(nextIndex);
    return;
  }

  playTrack((currentIndex + 1) % tracks.length);
}

function previousTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  if (currentIndex < 0) {
    playTrack(0);
    return;
  }

  playTrack((currentIndex - 1 + tracks.length) % tracks.length);
}

playBtn.addEventListener("click", () => {
  if (currentIndex < 0) {
    playTrack(0);
    return;
  }

  if (audio.paused) {
    audio.play().catch(console.error);
  } else {
    audio.pause();
  }
});

document.getElementById("nextBtn").addEventListener("click", nextTrack);
document.getElementById("prevBtn").addEventListener("click", previousTrack);

shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
});

repeatBtn.addEventListener("click", () => {
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
});

playerLike.addEventListener("click", () => {
  if (currentIndex >= 0) toggleLike(tracks[currentIndex].id);
});

likedToggle.addEventListener("click", () => showLibrary(!showingLibrary));
backToArtists.addEventListener("click", () => showLibrary(false));

audio.addEventListener("play", updatePlayerUI);
audio.addEventListener("pause", updatePlayerUI);

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("error", () => {
  console.error("TuneX could not load:", audio.src);
});

audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    audio.play().catch(console.error);
  } else {
    nextTrack();
  }
});

progress.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  localStorage.setItem("tunex-volume", volume.value);
});

searchInput.addEventListener("input", () => {
  if (showingLibrary) showLibrary(false);
  renderArtists(searchInput.value);
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  renderArtists();
});

document.addEventListener("keydown", event => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.code === "Space" && document.activeElement !== searchInput) {
    event.preventDefault();
    playBtn.click();
  }
});

renderArtists();
renderLibrary();
