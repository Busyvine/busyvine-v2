(() => {
  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();


// Back-To-Top
const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });
}

// Filter and Search on Work page
(() => {
  function initializeProjectFilters() {
    const filters = document.querySelector('.project-filters');
    const section = document.querySelector('.projects-section');
    const grid = section?.querySelector('#project-results');
    if (!filters || !section || filters.dataset.initialized === 'true') return;
    filters.dataset.initialized = 'true';

    const buttons = [...filters.querySelectorAll('.project-filter')];
    const search = filters.querySelector('.project-search input');
    const sort = filters.querySelector('.project-sort select');

    const empty = section.querySelector('.project-empty');
    const count = section.querySelector('.project-results-count');
    const normalize = (value) => value.toLowerCase().replace(/\s+/g, ' ').trim();
    const projects = [...grid.querySelectorAll('.project-item')].map((element, index) => ({
      element,
      index,
      title: element.querySelector('.project-card-title').textContent.trim(),
      categories: element.dataset.categories.split(/\s+/),
      text: normalize([...element.querySelectorAll(
        '.project-card-title, .project-card-category, .project-card-description'
      )].map((part) => part.textContent).join(' ') + ' ' + element.dataset.categories)
    }));
    let selectedCategory = filters.querySelector('.project-filter.active')?.dataset.filter || 'all';

    function updateProjects() {
      const terms = normalize(search.value).split(' ').filter(Boolean);
      let visible = 0;
      const ordered = [...projects].sort((a, b) => {
        if (sort.value === 'az') return a.title.localeCompare(b.title);
        if (sort.value === 'za') return b.title.localeCompare(a.title);
        if (sort.value === 'reverse') return b.index - a.index;
        return a.index - b.index;
      });

      ordered.forEach((project) => {
        const matchesCategory = selectedCategory === 'all' || project.categories.includes(selectedCategory);
        const matchesSearch = terms.every((term) => project.text.includes(term));
        project.element.hidden = !(matchesCategory && matchesSearch);
        if (!project.element.hidden) visible++;
        grid.appendChild(project.element);
      });

      buttons.forEach((button) => {
        const active = button.dataset.filter === selectedCategory;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-controls', 'project-results');
      });
      empty.hidden = visible !== 0;
      count.textContent = `${visible} of ${projects.length} projects shown`;
    }

    buttons.forEach((button) => button.addEventListener('click', () => {
      selectedCategory = button.dataset.filter;
      updateProjects();
    }));
    search.addEventListener('input', updateProjects);
    sort.addEventListener('change', updateProjects);
    updateProjects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProjectFilters, { once: true });
  } else {
    initializeProjectFilters();
  }
})();

function initializeTestimonials() {
const section = document.querySelector(".testimonials-section");

if (!section || section.dataset.testimonialsReady === "true") return;
section.dataset.testimonialsReady = "true";

const previousButton = section.querySelector(
    '[aria-label="Previous testimonial"]'
);
const nextButton = section.querySelector(
    '[aria-label="Next testimonial"]'
);

const content = section.querySelector(".testimonial-content");
const quote = section.querySelector(".testimonial-text");
const name = section.querySelector(".testimonial-name");
const company = section.querySelector(".testimonial-company");
const avatar = section.querySelector(".testimonial-avatar");
const image = section.querySelector(".testimonial-image-photo");

// Sample testimonials: replace names, companies and images
// with the approved client details before publishing.
const testimonials = [
    {
    quote:
        "Busyvine took the time to understand our business and delivered " +
        "a solution that's simple, powerful and built for growth. " +
        "They're more than a vendor — they're a true partner.",
    name: "Product Lead",
    company: "AgriTech Company",
    initials: "PL",
    image: "assets/img/work-hero.avif",
    imageAlt: "Busyvine project"
    },
    {
    quote:
        "Busyvine brought our appointments, payments and stock management " +
        "into one easy-to-use system. Our team spends less time on " +
        "paperwork and more time caring for clients, while we have a " +
        "clearer view of the business each day.",
    name: "Spa Manager",
    company: "Spa Company",
    initials: "SM",
    image: "assets/img/work-hero.avif",
    imageAlt: "Spa management system project"
    },
    {
    quote:
        "Busyvine made it easy for our customers to browse menus, find " +
        "their favourites and place orders. The website reflects our " +
        "brand beautifully and makes ordering feel simple from start " +
        "to finish.",
    name: "Business Owner",
    company: "Food Delivery Company",
    initials: "BO",
    image: "assets/img/work-hero.avif",
    imageAlt: "Food delivery website project"
    }
];

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let currentIndex = 0;
let isAnimating = false;

content.setAttribute("aria-live", "polite");
content.setAttribute("aria-atomic", "true");

// Preload images so switching is smoother.
[...new Set(testimonials.map((item) => item.image))].forEach((src) => {
    const preload = new Image();
    preload.src = src;
});

function renderTestimonial(index) {
    const testimonial = testimonials[index];

    quote.textContent = `“${testimonial.quote}”`;
    name.textContent = testimonial.name;
    company.textContent = testimonial.company;
    avatar.textContent = testimonial.initials;
    image.src = testimonial.image;
    image.alt = testimonial.imageAlt;
}

async function switchTestimonial(direction) {
    if (isAnimating || testimonials.length <= 1) return;

    const nextIndex =
    (currentIndex + direction + testimonials.length) %
    testimonials.length;

    if (reducedMotion.matches || !content.animate) {
    currentIndex = nextIndex;
    renderTestimonial(currentIndex);
    return;
    }

    isAnimating = true;

    const animations = [];
    const oldHeight = content.getBoundingClientRect().height;
    const originalHeight = content.style.height;
    const originalOverflow = content.style.overflow;

    function animate(element, frames, options) {
    const animation = element.animate(frames, {
        ...options,
        fill: "both"
    });

    animations.push(animation);
    return animation;
    }

    try {
    // Hold the content height while the outgoing text fades.
    content.style.height = `${oldHeight}px`;
    content.style.overflow = "hidden";

    const outgoing = [
        animate(content, [
        { opacity: 1, transform: "translateX(0)" },
        {
            opacity: 0,
            transform: `translateX(${-direction * 24}px)`
        }
        ], {
        duration: 180,
        easing: "ease-in"
        }),
        animate(image, [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(1.025)" }
        ], {
        duration: 180,
        easing: "ease-in"
        })
    ];

    await Promise.all(outgoing.map((animation) => animation.finished));

    currentIndex = nextIndex;
    renderTestimonial(currentIndex);

    // Measure the new quote and animate any height difference.
    content.style.height = originalHeight;
    const newHeight = content.getBoundingClientRect().height;
    content.style.height = `${oldHeight}px`;

    outgoing.forEach((animation) => animation.cancel());

    const incoming = [
        animate(content, [
        {
            opacity: 0,
            transform: `translateX(${direction * 24}px)`
        },
        { opacity: 1, transform: "translateX(0)" }
        ], {
        duration: 360,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        }),
        animate(content, [
        { height: `${oldHeight}px` },
        { height: `${newHeight}px` }
        ], {
        duration: 360,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        }),
        animate(image, [
        { opacity: 0, transform: "scale(1.025)" },
        { opacity: 1, transform: "scale(1)" }
        ], {
        duration: 420,
        easing: "ease-out"
        })
    ];

    await Promise.all(incoming.map((animation) => animation.finished));
    } finally {
    animations.forEach((animation) => animation.cancel());
    content.style.height = originalHeight;
    content.style.overflow = originalOverflow;
    isAnimating = false;
    }
}

previousButton.addEventListener("click", () => {
    switchTestimonial(-1);
});

nextButton.addEventListener("click", () => {
    switchTestimonial(1);
});

previousButton.disabled = testimonials.length <= 1;
nextButton.disabled = testimonials.length <= 1;

renderTestimonial(currentIndex);
}

if (document.readyState === "loading") {
document.addEventListener(
    "DOMContentLoaded",
    initializeTestimonials,
    { once: true }
);
} else {
initializeTestimonials();
}


///Term of use update
const lastUpdated = document.getElementById("lastUpdated");

if (lastUpdated) {
    const revisionDate = new Date(2026, 8, 24);

    lastUpdated.textContent = revisionDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


//Insights
(() => {
    const section = document.querySelector(".insights-section");

    if (!section) return;

    const filters = section.querySelectorAll(".insight-filter");
    const search = section.querySelector("#insightSearch");
    const articles = section.querySelectorAll(".insight-item");
    const empty = section.querySelector("#insightsEmpty");

    let selectedCategory = "all";

    const normalize = (value) =>
        value.toLowerCase().replace(/\s+/g, " ").trim();

    function filterArticles() {
        const searchTerm = normalize(search.value);
        let visibleArticles = 0;

        articles.forEach((article) => {
            const category = article.dataset.category;
            const title = normalize(article.dataset.title);

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            const matchesSearch =
                !searchTerm ||
                title.includes(searchTerm);

            const shouldShow =
                matchesCategory && matchesSearch;

            article.hidden = !shouldShow;

            if (shouldShow) {
                visibleArticles++;
            }
        });

        empty.hidden = visibleArticles !== 0;
    }

    filters.forEach((button) => {
        button.addEventListener("click", () => {
            selectedCategory = button.dataset.filter;

            filters.forEach((filter) => {
                const active = filter === button;

                filter.classList.toggle("active", active);
                filter.setAttribute("aria-selected", String(active));
            });

            filterArticles();
        });
    });

    search.addEventListener("input", filterArticles);

    filterArticles();
})();


//Start a project cards
const projectTypes = document.querySelectorAll(".project-type");
const projectTypeInput = document.getElementById("projectType");

if (projectTypes.length) {
    projectTypes.forEach((type) => {
        type.addEventListener("click", () => {

            projectTypes.forEach((item) => {
                item.classList.remove("active");
            });

            type.classList.add("active");

            if (projectTypeInput) {
                projectTypeInput.value = type.dataset.projectType;
            }
        });
    });
}