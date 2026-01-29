  const track = document.getElementById("carouselTrack");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  const cardWidth = 300 + 16; // width + Bootstrap mr-3
  let index = 0;

  nextBtn.addEventListener("click", () => {
    const maxIndex = track.children.length - 1;

    if (index < maxIndex) {
      index++;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
    }
  });

  prevBtn.addEventListener("click", () => {
    if (index > 0) {
      index--;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
    }
  });
