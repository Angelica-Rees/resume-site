document.addEventListener("DOMContentLoaded", () => {
    const tagPills = document.querySelectorAll(".tag-pill");
    const jobCards = document.querySelectorAll(".job-card");
    const clearBtn = document.getElementById("clearTags");

    let activeTags = new Set();

    tagPills.forEach(pill => {
        pill.addEventListener("click", () => {
            const tag = pill.dataset.tag;

            // Toggle tag in activeTags
            if (activeTags.has(tag)) {
                activeTags.delete(tag);
            } else {
                activeTags.add(tag);
            }

            updateHighlights();
        });
    });

    function updateHighlights() {
        // Loop over each card
        jobCards.forEach(card => {
            const cardTags = card.dataset.tags.trim().split(" ");
            const matchesAll = [...activeTags].every(tag => cardTags.includes(tag));

            const pills = card.querySelectorAll(".tag-pill");

            if (activeTags.size === 0) {
                card.classList.remove("highlight", "dimmed");
                pills.forEach(function (p) {
                    p.classList.remove("active"),
                    p.disabled = false});
            } else if (matchesAll) {
                card.classList.add("highlight");
                card.classList.remove("dimmed");

                // Only highlight pills inside this card that are active
                pills.forEach(p => {
                    if (activeTags.has(p.dataset.tag)) {
                        p.classList.add("active");
                    } else {
                        p.classList.remove("active");
                    }
                });

            } else {
                card.classList.add("dimmed");
                card.classList.remove("highlight");

                // Remove active from all pills inside a dimmed card
                pills.forEach(function (p) {
                    p.classList.remove("active"),
                    p.disabled = true
                });
            }
        });
    }

    function clearHighlights() {
        activeTags.clear();
        jobCards.forEach(card => {
            card.classList.remove("highlight", "dimmed");
            card.querySelectorAll(".tag-pill").forEach(p => p.classList.remove("active"));
        });
    }

    clearBtn?.addEventListener("click", clearHighlights);
});
