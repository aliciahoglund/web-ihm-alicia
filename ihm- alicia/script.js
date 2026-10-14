// Mörkt läge
const temaknapp = document.querySelector("#tema");
temaknapp.hidden = false;

function bytTema() {
    document.body.classList.toggle("morkt");
    if (document.body.classList.contains("morkt")) {
        temaknapp.textContent = "Byt till ljust läge";
    } else {
        temaknapp.textContent = "Byt till mörkt läge";
    }
}

temaknapp.addEventListener("click", bytTema);

// Talar om för CSS:en att JavaScript är igång
document.documentElement.classList.add("js");

const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll-effekt på heron: --p går från 0 till 1 medan man scrollar förbi den
const intro = document.querySelector(".intro");
let vantar = false;

function uppdateraHero() {
    const p = Math.min(Math.max(window.scrollY / intro.offsetHeight, 0), 1);
    intro.style.setProperty("--p", p.toFixed(3));
    vantar = false;
}

if (intro && !minskadRorelse) {
    window.addEventListener("scroll", function () {
        if (!vantar) {
            vantar = true;
            requestAnimationFrame(uppdateraHero);
        }
    }, { passive: true });
    uppdateraHero();
}

// Blocken tonar in när de kommer in i bild
const block = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !minskadRorelse) {
    const observator = new IntersectionObserver(function (poster) {
        poster.forEach(function (post) {
            if (post.isIntersecting) {
                post.target.classList.add("synlig");
                observator.unobserve(post.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    block.forEach(function (el) {
        observator.observe(el);
    });
} else {
    block.forEach(function (el) {
        el.classList.add("synlig");
    });
}
