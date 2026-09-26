// audio element
const player = document.getElementById("player");

// saare artist cards
const artists = document.querySelectorAll(
  ".kishore, .nfak, .arijit, .atif, .jani, .talha"
);

artists.forEach(artist => {
  artist.addEventListener("click", () => {
    const songPath = artist.dataset.song;

    // agar song path hi nahi
    if (!songPath) {
      alert("Is artist ka song available nahi hai");
      return;
    }

    // same song pe click -> play / pause
    if (player.src && player.src.includes(songPath)) {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
      return;
    }

    // naya song
    player.pause();
    player.src = songPath;
    player.load();      //  VERY IMPORTANT
    player.play().catch(err => {
      console.error("Audio play error:", err);
    });
  });
});
