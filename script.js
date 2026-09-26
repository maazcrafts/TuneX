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
const heroImage = document.getElementById("heroImage");
const heroArtist = document.getElementById("heroArtist");

let currentIndex = -1;
let shuffle = false;
let repeat = false;
let liked = JSON.parse(localStorage.getItem("tunex-liked") || "[]");

audio.volume = Number(localStorage.getItem("tunex-volume") ?? .7);
volume.value = audio.volume;

function formatTime(seconds){
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function isLiked(id){ return liked.includes(id); }

function toggleLike(id){
  liked = isLiked(id) ? liked.filter(x => x !== id) : [...liked, id];
  localStorage.setItem("tunex-liked", JSON.stringify(liked));
  renderArtists(searchInput.value);
  renderLibrary();
  updatePlayerLike();
}

function renderArtists(query = ""){
  const q = query.trim().toLowerCase();
  const filtered = tracks.filter(t =>
    t.artist.toLowerCase().includes(q) || t.title.toLowerCase().includes(q)
  );

  resultCount.textContent = `${filtered.length} artist${filtered.length !== 1 ? "s" : ""}`;
  emptyState.classList.toggle("hidden", filtered.length !== 0);

  grid.innerHTML = filtered.map(track => `
    <article class="artist-card ${tracks[currentIndex]?.id === track.id ? "playing" : ""}" data-id="${track.id}">
      <div class="artist-image-wrap">
        <img class="artist-image" src="${track.image}" alt="${track.artist}" loading="lazy">
        <div class="card-overlay"><i class="fa-solid ${tracks[currentIndex]?.id === track.id && !audio.paused ? "fa-pause" : "fa-play"}"></i></div>
      </div>
      <div class="card-info">
        <div><strong>${track.artist}</strong><span>${track.title}</span></div>
        <button class="like-btn ${isLiked(track.id) ? "liked" : ""}" data-like="${track.id}" aria-label="Like ${track.artist}">
          <i class="fa-${isLiked(track.id) ? "solid" : "regular"} fa-heart"></i>
        </button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".artist-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest("[data-like]")) return;
      const index = tracks.findIndex(t => t.id === card.dataset.id);
      playTrack(index);
    });
  });

  grid.querySelectorAll("[data-like]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleLike(btn.dataset.like);
    });
  });
}

function renderLibrary(){
  const saved = tracks.filter(t => isLiked(t.id));
  libraryEmpty.classList.toggle("hidden", saved.length > 0);

  libraryList.innerHTML = saved.map(track => `
    <div class="library-row">
      <img src="${track.image}" alt="${track.artist}">
      <div><strong>${track.artist}</strong><span>${track.title}</span></div>
      <span class="library-time">Saved to library</span>
      <button data-library-play="${track.id}" aria-label="Play ${track.artist}"><i class="fa-solid fa-play"></i></button>
    </div>
  `).join("");

  libraryList.querySelectorAll("[data-library-play]").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = tracks.findIndex(t => t.id === btn.dataset.libraryPlay);
      playTrack(index);
    });
  });
}

function updatePlayerLike(){
  if(currentIndex < 0) return;
  const active = isLiked(tracks[currentIndex].id);
  playerLike.classList.toggle("liked", active);
  playerLike.innerHTML = `<i class="fa-${active ? "solid" : "regular"} fa-heart"></i>`;
}

function updatePlayerUI(){
  const track = tracks[currentIndex];
  if(!track) return;

  playerCover.src = track.image;
  playerCover.alt = track.artist;
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  playBtn.innerHTML = `<i class="fa-solid ${audio.paused ? "fa-play" : "fa-pause"}"></i>`;
  progress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
  updatePlayerLike();
  renderArtists(searchInput.value);
}

function playTrack(index){
  if(index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const track = tracks[index];

  if(audio.src.endsWith(track.audio)){
    audio.play().catch(console.error);
  } else {
    audio.src = track.audio;
    audio.load();
    audio.play().catch(console.error);
  }

  heroImage.src = track.image;
  heroImage.alt = track.artist;
  heroArtist.textContent = track.artist;
  updatePlayerUI();
}

function nextTrack(){
  if(currentIndex < 0){ playTrack(0); return; }
  if(shuffle && tracks.length > 1){
    let next;
    do { next = Math.floor(Math.random() * tracks.length); } while(next === currentIndex);
    playTrack(next);
    return;
  }
  playTrack((currentIndex + 1) % tracks.length);
}

function previousTrack(){
  if(audio.currentTime > 3){ audio.currentTime = 0; return; }
  if(currentIndex < 0){ playTrack(0); return; }
  playTrack((currentIndex - 1 + tracks.length) % tracks.length);
}

playBtn.addEventListener("click", () => {
  if(currentIndex < 0){ playTrack(0); return; }
  audio.paused ? audio.play() : audio.pause();
});

document.getElementById("heroPlay").addEventListener("click", () => {
  if(currentIndex < 0) playTrack(0);
  else audio.paused ? audio.play() : audio.pause();
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
  if(currentIndex >= 0) toggleLike(tracks[currentIndex].id);
});

audio.addEventListener("play", updatePlayerUI);
audio.addEventListener("pause", updatePlayerUI);
audio.addEventListener("timeupdate", () => {
  if(!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTime.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});
audio.addEventListener("ended", () => {
  if(repeat){ audio.currentTime = 0; audio.play(); }
  else nextTrack();
});

progress.addEventListener("input", () => {
  if(audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  localStorage.setItem("tunex-volume", volume.value);
});

searchInput.addEventListener("input", () => renderArtists(searchInput.value));
clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  renderArtists();
});
document.addEventListener("keydown", e => {
  if(e.key === "/" && document.activeElement !== searchInput){
    e.preventDefault();
    searchInput.focus();
  }
  if(e.code === "Space" && document.activeElement !== searchInput){
    e.preventDefault();
    playBtn.click();
  }
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const home = btn.dataset.section === "home";
    document.getElementById("homeSection").classList.toggle("hidden", !home);
    document.getElementById("librarySection").classList.toggle("hidden", home);
  });
});

renderArtists();
renderLibrary();
updatePlayerUI();