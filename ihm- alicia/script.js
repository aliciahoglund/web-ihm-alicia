// ==========================================================================
// ALICIA HÖGLUND — Interaktion, Transparent Header & Markant Parallax Effect
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
    // 1 · Talar om för CSS att JS körs
    document.documentElement.classList.add("js");

    const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 2 · Transparent Header som växlar mjukt vid scroll
    const sidhuvud = document.querySelector(".sidhuvud");

    function uppdateraHeader() {
        if (!sidhuvud) return;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY > 50) {
            sidhuvud.classList.add("har-scrollat");
        } else {
            sidhuvud.classList.remove("har-scrollat");
        }
    }

    window.addEventListener("scroll", uppdateraHeader, { passive: true });
    uppdateraHeader();

    // 3 · Mörkt läge (Tema-växlare)
    const temaknapp = document.querySelector("#tema");
    if (temaknapp) {
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
    }

    // 4 · Markant Parallax / Fixed Effect (Hero & Fullbredd)
    // Bilden hålls fast/stilla vid start av scroll så att innehållet åker över den,
    // och rör sig sedan mjukt med i scrollen för maximal visuell effekt.
    const heroBlock = document.querySelector('.intro[data-parallax="true"]');
    const fullbreddBlock = document.querySelector('.fullbredd-sektion[data-parallax="true"]');

    function beraknaParallax() {
        if (minskadRorelse) return;

        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHojd = window.innerHeight;

        // A · Hero-parallax: Fast bakgrund vid initial scroll som mjukt övergår till scroll
        if (heroBlock) {
            const heroRect = heroBlock.getBoundingClientRect();
            if (heroRect.bottom > 0) {
                let heroY = 0;
                // Fast/stilla effekt under de första 340px av scroll så innehållet åker över
                if (scrollY <= 340) {
                    heroY = scrollY * 0.92;
                } else {
                    // Mjuk övergång till följsam scroll
                    heroY = (340 * 0.92) + ((scrollY - 340) * 0.44);
                }

                const heroImg = heroBlock.querySelector(".parallax-img");
                if (heroImg) {
                    heroImg.style.setProperty("--parallax-y", heroY.toFixed(2) + "px");
                }
            }
        }

        // B · Fullbreddssektionen: Stark fast-effekt / fönsterinblick i bakgrunden
        if (fullbreddBlock) {
            const fbRect = fullbreddBlock.getBoundingClientRect();
            if (fbRect.bottom > -120 && fbRect.top < viewportHojd + 120) {
                const sektionCenter = fbRect.top + fbRect.height / 2;
                const viewportCenter = viewportHojd / 2;
                const avvikelse = sektionCenter - viewportCenter;

                // Markant parallax-faktor som skapar djup och stillhet
                const translateY = -avvikelse * 0.48;

                const fbImg = fullbreddBlock.querySelector(".parallax-img");
                if (fbImg) {
                    fbImg.style.setProperty("--parallax-y", translateY.toFixed(2) + "px");
                }
            }
        }
    }

    // Högpresterande render-loop med requestAnimationFrame
    let scrollTicking = false;
    window.addEventListener("scroll", function () {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(function () {
                beraknaParallax();
                scrollTicking = false;
            });
        }
    }, { passive: true });

    window.addEventListener("resize", beraknaParallax, { passive: true });
    beraknaParallax();

    // 5 · Sektions- och kortanimationer när de scrollas in (data-reveal)
    const revealElement = document.querySelectorAll("[data-reveal]");

    if ("IntersectionObserver" in window && !minskadRorelse) {
        const observator = new IntersectionObserver(function (poster) {
            poster.forEach(function (post) {
                if (post.isIntersecting) {
                    post.target.classList.add("synlig");
                    observator.unobserve(post.target);
                }
            });
        }, { threshold: 0.06, rootMargin: "0px 0px 80px 0px" });

        revealElement.forEach(function (el) {
            observator.observe(el);
        });
    } else {
        revealElement.forEach(function (el) {
            el.classList.add("synlig");
        });
    }
});


// ==========================================================================
// Kontaktformulär → HubSpot (Forms API v3, EU-datacenter)
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    const formular = document.querySelector("#kontaktformular");
    if (!formular) return;

    const HUBSPOT_PORTAL_ID = "149565941";
    const HUBSPOT_FORM_ID = "8c3421d6-28f5-44c5-a13e-b1bca9a78144";
    const HUBSPOT_URL = "https://api-eu1.hsforms.com/submissions/v3/integration/submit/"
        + HUBSPOT_PORTAL_ID + "/" + HUBSPOT_FORM_ID;

    const knapp = formular.querySelector(".formular-knapp");
    const status = formular.querySelector(".formular-status");
    const epost = formular.querySelector("#kf-epost");

    function visaStatus(text, typ) {
        status.textContent = text;
        status.className = "formular-status" + (typ ? " " + typ : "");
    }

    // HubSpots spårningscookie (finns bara om HubSpots spårningskod ligger på sidan)
    function hamtaHutk() {
        const match = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
        return match ? match[1] : undefined;
    }

    formular.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Honungsfälla: fylls bara i av botar
        if (formular.webbplats.value) return;

        epost.removeAttribute("aria-invalid");
        if (!epost.value.trim() || !epost.checkValidity()) {
            epost.setAttribute("aria-invalid", "true");
            epost.focus();
            visaStatus("Fyll i en giltig e-postadress.", "fel");
            return;
        }

        const falt = ["for_och_efternamn", "email", "company", "message"]
            .map(function (namn) {
                return { objectTypeId: "0-1", name: namn, value: formular[namn].value.trim() };
            })
            .filter(function (f) { return f.value !== ""; });

        const kontext = { pageUri: window.location.href, pageName: document.title };
        const hutk = hamtaHutk();
        if (hutk) kontext.hutk = hutk;

        knapp.disabled = true;
        visaStatus("Skickar …");

        try {
            const svar = await fetch(HUBSPOT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields: falt, context: kontext })
            });

            if (!svar.ok) throw new Error("HubSpot svarade " + svar.status);

            formular.reset();
            visaStatus("Tack! Ditt meddelande är skickat – jag återkommer så snart jag kan.", "lyckades");
        } catch (fel) {
            console.error(fel);
            visaStatus("Något gick fel. Försök igen eller mejla info@aliciahoglund.com.", "fel");
        } finally {
            knapp.disabled = false;
        }
    });
});
