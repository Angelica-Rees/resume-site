/**
 * Projects Carousel
 * Displays 3 cards at a time with center card scaling
 * Seamless infinite scrolling with cards wrapping around
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const track = document.getElementById('carouselTrack');

  // Exit if carousel doesn't exist on this page
  if (!track) return;

  const cards = Array.from(document.querySelectorAll('.carousel-card'));
  const totalCards = cards.length;

  // Handle edge cases
  if (totalCards === 0) return;
  if (totalCards <= 2) {
    cards.forEach(card => card.classList.add('center'));
    return;
  }

  // Current position
  let currentIndex = 0;

  /**
   * Get current card width based on screen size (must match CSS)
   */
  function getCardWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 576) return 280;
    if (screenWidth <= 768) return 300;
    return 400;
  }

  /**
   * Get current gap based on screen size (must match CSS)
   */
  function getGap() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 576) return 16; // 1rem
    return 32; // 2rem
  }

  /**
   * Get the circular distance between two indices
   * This helps determine the shortest path around the carousel
   */
  function getCircularPosition(cardIndex, centerIndex) {
    let diff = cardIndex - centerIndex;

    // Normalize to [-totalCards/2, totalCards/2] range for shortest path
    if (diff > totalCards / 2) {
      diff -= totalCards;
    } else if (diff < -totalCards / 2) {
      diff += totalCards;
    }

    return diff;
  }

  /**
   * Updates carousel - positions all cards relative to current center
   */
  function updateCarousel() {
    const CARD_WIDTH = getCardWidth();
    const GAP = getGap();
    const CARD_SPACING = CARD_WIDTH + GAP;

    const containerWidth = track.parentElement.offsetWidth;
    const centerOffset = (containerWidth / 2) - (CARD_WIDTH / 2);

    // Add transitioning class to disable hover effects during movement
    track.classList.add('transitioning');

    cards.forEach((card, cardIndex) => {
      // Calculate this card's position relative to the current center
      const relativePosition = getCircularPosition(cardIndex, currentIndex);

      // Check if card was previously hidden
      const wasHidden = card.getAttribute('data-hidden') === 'true';

      // Only show cards that are in the immediate view (left, center, right)
      const isVisible = Math.abs(relativePosition) <= 1;

      if (!isVisible) {
        // Position cards far off-screen so they're completely hidden
        card.style.transform = 'translateX(-9999px) scale(0)';
        card.style.opacity = '0';
        card.style.zIndex = '-1';
        card.style.pointerEvents = 'none';
        card.classList.remove('center', 'side');
        card.setAttribute('data-hidden', 'true');
        return;
      }

      // Card is becoming visible
      card.setAttribute('data-hidden', 'false');

      // If card was hidden, disable transition for instant positioning
      if (wasHidden) {
        card.classList.add('no-transition');
      }

      // Re-enable pointer events for visible cards
      card.style.pointerEvents = 'auto';

      // Calculate the X position for this card
      const xPosition = centerOffset + (relativePosition * CARD_SPACING);

      // Determine scale based on position
      let scale = 1;
      let opacity = 1;
      let zIndex = 2;

      if (relativePosition === 0) {
        // Center card
        scale = 1;
        opacity = 1;
        zIndex = 2;
        card.classList.add('center');
        card.classList.remove('side');
      } else {
        // Side cards
        scale = 0.65;
        opacity = 0.5;
        zIndex = 1;
        card.classList.add('side');
        card.classList.remove('center');
      }

      // Apply combined transform (position + scale)
      card.style.transform = `translateX(${xPosition}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;

      // Re-enable transition after instant positioning
      if (wasHidden) {
        requestAnimationFrame(() => {
          card.classList.remove('no-transition');
        });
      }
    });

    // Remove transitioning class after animation completes
    // Use transitionend for precise timing
    const handleTransitionEnd = (e) => {
      // Only respond to transform transitions on carousel cards
      if (e.target.classList.contains('carousel-card') && e.propertyName === 'transform') {
        track.classList.remove('transitioning');
        track.removeEventListener('transitionend', handleTransitionEnd);
      }
    };

    track.addEventListener('transitionend', handleTransitionEnd);

    // Fallback timeout in case transitionend doesn't fire
    setTimeout(() => {
      track.classList.remove('transitioning');
      track.removeEventListener('transitionend', handleTransitionEnd);
    }, 650);

    console.log(`Updated carousel to index ${currentIndex}`);
  }

  /**
   * Navigate to next project (infinite)
   */
  function goToNext() {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  }

  /**
   * Navigate to previous project (infinite)
   */
  function goToPrev() {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
  }

  /**
   * Navigate to specific index
   */
  function goToIndex(targetIndex) {
    currentIndex = targetIndex;
    updateCarousel();
  }

  // Click on side cards to navigate
  cards.forEach((card, index) => {
    card.addEventListener('click', (e) => {
      console.log(`Card ${index} clicked, currentIndex: ${currentIndex}`);
      // Only navigate if clicking a side card, not the center one
      if (index !== currentIndex) {
        console.log(`Navigating to card ${index}`);
        goToIndex(index);
      }
    });
  });

  // Keyboard navigation (accessibility)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      console.log('Right arrow pressed');
      goToNext();
    }
    if (e.key === 'ArrowLeft') {
      console.log('Left arrow pressed');
      goToPrev();
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCarousel, 150);
  });

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  }, { passive: true });

  // Trackpad/mousewheel scrolling support
  let isScrolling = false;
  let scrollTimeout = null;

  track.addEventListener('wheel', (e) => {
    // Prevent default scroll behavior
    e.preventDefault();

    // Debounce: ignore scroll events if we're already processing one
    if (isScrolling) return;

    // Detect scroll direction (horizontal or vertical)
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    // Increased threshold to prevent accidental double-triggers
    if (Math.abs(delta) < 15) return;

    // Set scrolling flag immediately to prevent multiple triggers
    isScrolling = true;

    // Navigate based on scroll direction
    if (delta > 0) {
      // Scrolling down or right -> next
      goToNext();
    } else {
      // Scrolling up or left -> previous
      goToPrev();
    }

    // Clear any existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Reset scrolling flag after transition completes with extra buffer
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      scrollTimeout = null;
    }, 700); // Slightly longer than transition duration for safety
  }, { passive: false });

  // Initialize
  console.log('Initializing carousel...');
  updateCarousel();
  console.log('Carousel initialized successfully');
});
