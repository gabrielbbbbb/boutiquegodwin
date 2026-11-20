const grid = document.querySelector("#productGrid");

const SUPABASE_URL = "https://zgflbklshqwoynvumekr.supabase.co";
const SUPABASE_KEY = "sb_publishable_OqRMAx0t1q1WvtQ0gt9MrA_jFAi3TGz";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const filters = document.querySelector("#filters");
const searchInput = document.querySelector("#searchInput");
let products = [],
  activeCategory = "Tous";
const money = (n) =>
  new Intl.NumberFormat("fr-FR").format(Number(n) || 0) + " FCFA";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function render() {
  const term = (searchInput?.value || "").trim().toLowerCase();
  const shown = products.filter(
    (p) =>
      (activeCategory === "Tous" || p.category === activeCategory) &&
      `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(term),
  );
  document.querySelector("#catalogCount").textContent =
    `${shown.length} produit(s)`;
  if (!shown.length) {
    grid.innerHTML =
      '<div class="empty">Aucun produit ne correspond à votre recherche.</div>';
    return;
  }
  grid.innerHTML = shown
    .map((p) => {
      const cover = (Array.isArray(p.images) && p.images[0]) || "";
      return `<article class="product-card">
    <div class="card-image"><img src="${esc(cover)}" alt="${esc(p.name)}" loading="lazy">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}<span class="image-count">▧ ${p.images?.length || 0} photos</span></div>
    <div class="card-info"><span class="category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
    <div class="card-bottom"><span class="price">${money(p.price)}<small class="${p.available !== false ? "available" : "unavailable"}">
  ${p.available !== false ? "✓ Disponible" : "✕ Indisponible"}
</small></span><a class="view-btn" href="product.html?id=${encodeURIComponent(p.id)}">Voir détails ↗</a></div></div></article>`;
    })
    .join("");
}
async function init() {
  try {
    grid.innerHTML = '<div class="empty">Chargement des produits...</div>';

    const { data, error } = await db
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = data || [];

    grid.innerHTML = "";
    render();
  } catch (e) {
    grid.innerHTML =
      '<div class="empty">Impossible de charger le catalogue. Veuillez réessayer.</div>';

    console.error("Erreur Supabase :", e);
  }
}
filters?.addEventListener("click", (e) => {
  const b = e.target.closest("[data-category]");
  if (!b) return;
  activeCategory = b.dataset.category;
  filters
    .querySelectorAll("button")
    .forEach((x) => x.classList.toggle("active", x === b));
  render();
});
searchInput?.addEventListener("input", render);
const menuBtn = document.querySelector("#menuBtn"),
  nav = document.querySelector("#navLinks");
menuBtn?.addEventListener("click", () => nav.classList.toggle("open"));
nav
  ?.querySelectorAll("a")
  .forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open")),
  );
document.querySelector("#year").textContent = new Date().getFullYear();
init();
