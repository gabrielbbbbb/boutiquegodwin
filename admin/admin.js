// 1. Configuration Supabase
const SUPABASE_URL = "https://zgflbklshqwoynvumekr.supabase.co";
const SUPABASE_KEY = "sb_publishable_OqRMAx0t1q1WvtQ0gt9MrA_jFAi3TGz";

const ADMIN_UID = "9549a6e8-e3a2-450d-b392-5d83b18ebaed";

// Gestion du mode modification
let editingProduct = null;
let retainedImages = [];

// 2. Initialisation
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Éléments du formulaire
const loginForm = document.querySelector("#loginForm");
const loginButton = document.querySelector("#loginButton");
const loginMessage = document.querySelector("#loginMessage");

// 4. Connexion administrateur
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Connexion...";
  loginMessage.textContent = "";
  loginMessage.style.color = "#dc2626";

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    loginMessage.style.color = "#16a34a";
    loginMessage.textContent = "Connexion réussie !";

    console.log("Administrateur connecté :", data.user.id);
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Se connecter";
  }
});

// Éléments de l'interface
const loginContainer = document.querySelector(".login-container");
const dashboard = document.querySelector("#dashboard");
const logoutButton = document.querySelector("#logoutButton");
const adminProducts = document.querySelector("#adminProducts");

// Échapper les caractères HTML
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

// Afficher le tableau de bord
async function showDashboard() {
  loginContainer.hidden = true;
  dashboard.hidden = false;

  await loadProducts();
}

// Charger les produits depuis Supabase
async function loadProducts() {
  adminProducts.innerHTML = "<p>Chargement des produits...</p>";

  const { data: products, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    adminProducts.textContent = "Erreur de chargement : " + error.message;
    return;
  }

  // Statistiques
  const available = products.filter((p) => p.available !== false).length;
  const unavailable = products.length - available;

  document.querySelector("#totalProducts").textContent = products.length;

  document.querySelector("#availableProducts").textContent = available;

  document.querySelector("#unavailableProducts").textContent = unavailable;

  // Liste des produits
  if (products.length === 0) {
    adminProducts.innerHTML = "<p>Aucun produit enregistré.</p>";
    return;
  }

  adminProducts.innerHTML = products
    .map(
      (product) => `
  <article class="admin-product-item">

 <div class="admin-product-gallery">
  ${(product.images || [])
    .slice(0, 3)
    .map(
      (image, index) => `
    <a href="${escapeHTML(image)}" target="_blank" rel="noopener noreferrer">
      <img
        src="${escapeHTML(image)}"
        alt="${escapeHTML(product.name)} - Photo ${index + 1}"
        class="admin-product-image"
        loading="lazy"
      >
    </a>
  `,
    )
    .join("")}

  ${
    product.images?.length > 3
      ? `<details class="extra-photos">
          <summary>Voir les ${product.images.length} photos</summary>
          <div class="extra-photos-gallery">
            ${product.images
              .slice(3)
              .map(
                (image, index) => `
              <a href="${escapeHTML(image)}" target="_blank" rel="noopener noreferrer">
                <img src="${escapeHTML(image)}" alt="Photo ${index + 4}" loading="lazy">
              </a>
            `,
              )
              .join("")}
          </div>
        </details>`
      : ""
  }
</div>

  <div class="admin-product-info">
    <strong>${escapeHTML(product.name)}</strong>
      <p>${escapeHTML(product.category)}</p>
      <p>${Number(product.price).toLocaleString("fr-FR")} FCFA</p>
      <p>${product.available !== false ? "✓ Disponible" : "✕ Indisponible"}</p>
      <p>${product.images?.length || 0} photo(s)</p>
    </div>

    <div class="admin-product-actions">
      <button type="button" class="edit-product-btn"
        data-id="${escapeHTML(product.id)}">
        Modifier
      </button>

      <button type="button" class="delete-product-btn"
        data-id="${escapeHTML(product.id)}">
        Supprimer
      </button>
    </div>
  </article>
`,
    )
    .join("");
}

// Déconnexion
logoutButton.addEventListener("click", async () => {
  const { error } = await db.auth.signOut();

  if (error) {
    alert(error.message);
  }
});

// Vérifier la session au chargement
db.auth.onAuthStateChange((event, session) => {
  if (session?.user?.id === ADMIN_UID) {
    showDashboard();
  } else {
    dashboard.hidden = true;
    loginContainer.hidden = false;

    if (session) {
      loginMessage.textContent =
        "Ce compte n'est pas autorisé à accéder à l'administration.";
    }
  }
});

// ======================================
// AJOUT DE PRODUITS
// ======================================

const CLOUDINARY_NAME = "dmyjmpyzh";
const CLOUDINARY_PRESET = "boutique_godwin";

const productFormSection = document.querySelector("#productFormSection");
const productForm = document.querySelector("#productForm");
const addProductButton = document.querySelector("#addProductButton");
const cancelProductButton = document.querySelector("#cancelProductButton");
const productImagesInput = document.querySelector("#productImages");
const imageCount = document.querySelector("#imageCount");
const existingImages = document.querySelector("#existingImages");
const productFormMessage = document.querySelector("#productFormMessage");
const saveProductButton = document.querySelector("#saveProductButton");

// Ouvrir le formulaire
addProductButton.addEventListener("click", () => {
  editingProduct = null;
  retainedImages = [];

  productForm.reset();

  document.querySelector("#productFormTitle").textContent =
    "Ajouter un produit";

  saveProductButton.textContent = "Enregistrer le produit";

  imageCount.textContent = "Aucune photo sélectionnée.";
  productFormMessage.textContent = "";

  productFormSection.hidden = false;
  productFormSection.scrollIntoView({ behavior: "smooth" });
});

// Fermer le formulaire
cancelProductButton.addEventListener("click", () => {
  productFormSection.hidden = true;
  productForm.reset();
  editingProduct = null;
  retainedImages = [];
});

// Compter les photos
productImagesInput.addEventListener("change", () => {
  const count = productImagesInput.files.length;

  imageCount.textContent = `${count} photo(s) sélectionnée(s). Minimum requis : 3.`;
});

// Envoyer une image vers Cloudinary
async function uploadImage(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Erreur d'envoi de l'image.");
  }

  return result.secure_url;
}

function renderExistingImages() {
  existingImages.innerHTML = retainedImages
    .map(
      (image, index) => `
      <div class="existing-image-item">
        <img src="${escapeHTML(image)}" alt="Photo ${index + 1}">
        <button
          type="button"
          class="remove-existing-image"
          data-index="${index}"
        >
          Retirer
        </button>
      </div>
    `,
    )
    .join("");
}

existingImages.addEventListener("click", (e) => {
  const button = e.target.closest(".remove-existing-image");
  if (!button) return;

  const index = Number(button.dataset.index);
  retainedImages.splice(index, 1);

  renderExistingImages();

  imageCount.textContent = `${retainedImages.length} ancienne(s) photo(s) conservée(s).`;
});

// Enregistrer le produit

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const files = Array.from(productImagesInput.files);

  // Vérifier le nombre total de photos
  const totalImages = retainedImages.length + files.length;

  if (totalImages < 3) {
    productFormMessage.style.color = "#dc2626";
    productFormMessage.textContent = "Le produit doit avoir au moins 3 photos.";
    return;
  }

  if (CLOUDINARY_NAME === "TON_CLOUD_NAME") {
    alert("Configure ton Cloud Name Cloudinary.");
    return;
  }

  saveProductButton.disabled = true;
  saveProductButton.textContent = "Enregistrement...";

  try {
    // Envoyer uniquement les nouvelles photos
    let newImageUrls = [];

    if (files.length > 0) {
      productFormMessage.textContent = "Envoi des nouvelles photos...";

      newImageUrls = await Promise.all(files.map((file) => uploadImage(file)));
    }

    // Conserver les anciennes photos et ajouter les nouvelles
    const finalImages = [...retainedImages, ...newImageUrls];

    const product = {
      name: document.querySelector("#productName").value.trim(),
      category: document.querySelector("#productCategory").value,
      price: Number(document.querySelector("#productPrice").value),
      description: document.querySelector("#productDescription").value.trim(),
      images: finalImages,
      available:
        document.querySelector("#productAvailability").value === "true",
    };

    productFormMessage.textContent = "Enregistrement dans Supabase...";

    let result;

    if (editingProduct) {
      // Modifier le produit existant
      result = await db
        .from("products")
        .update(product)
        .eq("id", editingProduct.id);
    } else {
      // Créer un nouveau produit
      result = await db.from("products").insert(product);
    }

    if (result.error) throw result.error;

    alert(
      editingProduct
        ? "Produit modifié avec succès !"
        : "Produit ajouté avec succès !",
    );

    // Réinitialiser le formulaire
    productForm.reset();
    editingProduct = null;
    retainedImages = [];
    renderExistingImages();

    imageCount.textContent = "Aucune photo sélectionnée.";
    productFormMessage.textContent = "";
    productFormSection.hidden = true;

    await loadProducts();
  } catch (error) {
    productFormMessage.style.color = "#dc2626";
    productFormMessage.textContent = error.message;
  } finally {
    saveProductButton.disabled = false;
    saveProductButton.textContent = editingProduct
      ? "Enregistrer les modifications"
      : "Enregistrer le produit";
  }
});

// ======================================
// SUPPRESSION DES PRODUITS
// ======================================

adminProducts.addEventListener("click", async (e) => {
  const button = e.target.closest(".delete-product-btn");

  if (!button) return;

  const productId = button.dataset.id;

  const confirmed = confirm("Voulez-vous vraiment supprimer ce produit ?");

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Suppression...";

  try {
    const { error } = await db.from("products").delete().eq("id", productId);

    if (error) throw error;

    await loadProducts();

    alert("Produit supprimé avec succès !");
  } catch (error) {
    alert("Erreur : " + error.message);
    button.disabled = false;
    button.textContent = "Supprimer";
  }
});

// ======================================
// CHARGER UN PRODUIT POUR MODIFICATION
// ======================================

adminProducts.addEventListener("click", async (e) => {
  const button = e.target.closest(".edit-product-btn");

  if (!button) return;

  const productId = button.dataset.id;

  button.disabled = true;
  button.textContent = "Chargement...";

  try {
    const { data: product, error } = await db
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;

    editingProduct = product;
    retainedImages = Array.isArray(product.images) ? [...product.images] : [];
    renderExistingImages();

    // Remplir le formulaire
    document.querySelector("#productName").value = product.name;
    document.querySelector("#productCategory").value = product.category;
    document.querySelector("#productPrice").value = product.price;
    document.querySelector("#productDescription").value =
      product.description || "";

    document.querySelector("#productAvailability").value = String(
      product.available !== false,
    );

    // Afficher les anciennes photos
    imageCount.textContent = `${retainedImages.length} ancienne(s) photo(s) conservée(s).`;

    document.querySelector("#productFormTitle").textContent =
      "Modifier le produit";

    saveProductButton.textContent = "Enregistrer les modifications";

    productFormSection.hidden = false;

    productFormSection.scrollIntoView({
      behavior: "smooth",
    });
  } catch (error) {
    alert("Erreur : " + error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Modifier";
  }
});

// ======================================Supprimer un produit

adminProducts.addEventListener("click", async (e) => {
  const button = e.target.closest(".edit-product-btn");
  if (!button) return;

  const productId = button.dataset.id;

  const { data: product, error } = await db
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    alert("Erreur : " + error.message);
    return;
  }

  editingProduct = product;
  retainedImages = [...(product.images || [])];
  renderExistingImages();

  document.querySelector("#productName").value = product.name;
  document.querySelector("#productCategory").value = product.category;
  document.querySelector("#productPrice").value = product.price;
  document.querySelector("#productDescription").value =
    product.description || "";
  document.querySelector("#productAvailability").value = String(
    product.available,
  );

  productImagesInput.value = "";
  imageCount.textContent = `${retainedImages.length} photo(s) déjà enregistrée(s).`;

  document.querySelector("#productFormTitle").textContent =
    "Modifier le produit";
  saveProductButton.textContent = "Enregistrer les modifications";

  productFormMessage.textContent = "";
  productFormSection.hidden = false;
  productFormSection.scrollIntoView({ behavior: "smooth" });
});

adminProducts.addEventListener("click", async (e) => {
  const button = e.target.closest(".delete-product-btn");
  if (!button) return;

  const productId = button.dataset.id;

  const confirmation = confirm("Voulez-vous vraiment supprimer ce produit ?");

  if (!confirmation) return;

  button.disabled = true;
  button.textContent = "Suppression...";

  const { error } = await db.from("products").delete().eq("id", productId);

  if (error) {
    alert("Erreur lors de la suppression : " + error.message);
    button.disabled = false;
    button.textContent = "Supprimer";
    return;
  }

  alert("Produit supprimé avec succès !");
  await loadProducts();
});
