const target = document.querySelector("#productDetail");
const SUPABASE_URL = "https://zgflbklshqwoynvumekr.supabase.co";
const SUPABASE_KEY = "sb_publishable_OqRMAx0t1q1WvtQ0gt9MrA_jFAi3TGz";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SHOP_PHONE = "22892423331";

const money = (n) =>
  new Intl.NumberFormat("fr-FR").format(Number(n) || 0) + " FCFA";

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

async function showProduct() {
  try {
    const id = new URLSearchParams(location.search).get("id");

    const { data: p, error } = await db
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        target.innerHTML = `
      <div class="empty">
        <h2>Produit introuvable</h2>
        <a href="index.html#catalogue">Retour au catalogue</a>
      </div>
    `;
        return;
      }

      throw error;
    }

    if (!p) {
      target.innerHTML = `
                <div class="empty">
                    <h2>Produit introuvable</h2>
                    <a href="index.html#catalogue">
                        Retour au catalogue
                    </a>
                </div>
            `;
      return;
    }

    const imgs = Array.isArray(p.images) ? p.images : [];

    if (imgs.length === 0) {
      target.innerHTML = `
                <div class="empty">
                    Ce produit ne possède aucune photo.
                </div>
            `;
      return;
    }

    const firstImage = esc(imgs[0]);

    const message = encodeURIComponent(
      `Bonjour Boutique-Godwin ! Je suis intéressé par le produit : ${p.name}. Prix : ${money(p.price)}. Est-il disponible ?`,
    );

    const whatsappLink = `https://wa.me/${SHOP_PHONE}?text=${message}`;

    target.innerHTML = `
            <a class="detail-back" href="index.html#catalogue">
                ← Retour au catalogue
            </a>

            <div class="detail-layout">

                <div class="detail-gallery">

                    <div class="gallery-main">
                        <img
                            id="mainProductImage"
                            src="${firstImage}"
                            alt="${esc(p.name)}"
                        >
                    </div>

                    <div class="thumbs">
                        ${imgs
                          .map(
                            (src, i) => `
                            <button
                                class="thumb ${i === 0 ? "active" : ""}"
                                data-image="${i}"
                                type="button"
                                aria-label="Afficher photo ${i + 1}"
                                aria-pressed="${i === 0}"
                            >
                                <img src="${esc(src)}" alt="">
                            </button>
                        `,
                          )
                          .join("")}
                    </div>

                    <p class="photo-counter">
                        ${imgs.length} photo(s) disponibles
                    </p>

                </div>

                <div class="detail-info">

                    <span class="category">
                        ${esc(p.category)}
                    </span>

                    <h1>${esc(p.name)}</h1>

                    <div class="detail-price">
                        ${money(p.price)}
                    </div>

                    <p class="detail-description">
                        ${esc(p.description)}
                    </p>

                    <div class="availability">
                        ${
                          p.available !== false
                            ? "Disponible — contactez notre équipe pour confirmer."
                            : "Ce produit est actuellement indisponible."
                        }
                    </div>

                    <div class="detail-actions">

                        <a
                            class="detail-cta whatsapp-cta"
                            href="${whatsappLink}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Contacter sur WhatsApp
                        </a>

                        <a
                            class="detail-cta call-cta"
                            href="tel:+${SHOP_PHONE}"
                        >
                            Appeler la boutique
                        </a>

                    </div>

                </div>

            </div>
        `;

    // GALERIE INTERACTIVE
    const mainImage = target.querySelector("#mainProductImage");

    target.querySelectorAll(".thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.image);

        mainImage.src = imgs[index];

        target.querySelectorAll(".thumb").forEach((x) => {
          x.classList.toggle("active", x === btn);
          x.setAttribute("aria-pressed", String(x === btn));
        });
      });
    });
  } catch (error) {
    console.error(error);

    target.innerHTML = `
            <div class="empty">
                Erreur de chargement du produit.
                <a href="index.html#catalogue">
                    Retour au catalogue
                </a>
            </div>
        `;
  }
}

showProduct();
