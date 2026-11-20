const DB_NAME = "BoutiqueGodwinDB";
const STORE_NAME = "products";

let db;
let selectedImages = [];
let existingImages = [];

// ELEMENTS
const form = document.getElementById("product-form");
const productId = document.getElementById("product-id");
const productName = document.getElementById("product-name");
const productCategory = document.getElementById("product-category");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");
const imageInput = document.getElementById("product-images");
const imagePreview = document.getElementById("image-preview");
const imageCount = document.getElementById("image-count");
const productsList = document.getElementById("products-list");
const productCount = document.getElementById("product-count");
const formTitle = document.getElementById("form-title");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-edit");
const productAvailability = document.getElementById("product-availability");

// OPEN DATABASE
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

// DATABASE TRANSACTION
function getStore(mode = "readonly") {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

// GET ALL PRODUCTS
function getAllProducts() {
  return new Promise((resolve, reject) => {
    const request = getStore().getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// SAVE PRODUCT
function saveProduct(product) {
  return new Promise((resolve, reject) => {
    const store = getStore("readwrite");
    const request = product.id ? store.put(product) : store.add(product);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    /*  product = {
      name: productName.value.trim(),
      category: productCategory.value,
      price: Number(productPrice.value),
      description: productDescription.value.trim(),
      available: productAvailability.value === "true",
      images,
      createdAt: oldProduct?.createdAt || new Date().toISOString(),
    }; */
  });
}

// DELETE PRODUCT
function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// IMAGE PREVIEW
imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files);

  selectedImages = files.filter((file) => file.type.startsWith("image/"));

  showImagePreview();
});

/* function showImagePreview() {
  imagePreview.innerHTML = "";

  const photos = [
    ...existingImages.map((file, index) => ({
      file,
      type: "existing",
      index,
    })),
    ...selectedImages.map((file, index) => ({
      file,
      type: "selected",
      index,
    })),
  ];

  imageCount.textContent = `${photos.length} photo(s) au total. Minimum requis : 3.`;

  photos.forEach((photo, position) => {
    const card = document.createElement("div");

    card.style.cssText = `
            border:1px solid #e4e7ec;
            border-radius:8px;
            overflow:hidden;
            background:white;
        `;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(photo.file);
    img.alt = "Photo du produit";
    img.style.cssText = `
            width:100%;
            height:100px;
            object-fit:cover;
            display:block;
        `;

    card.appendChild(img);

    if (position === 0) {
      const badge = document.createElement("div");
      badge.textContent = "★ Photo principale";
      badge.style.cssText = `
                background:#155eef;
                color:white;
                text-align:center;
                padding:6px;
                font-size:11px;
            `;
      card.appendChild(badge);
    }

    const controls = document.createElement("div");
    controls.style.cssText = `
            display:flex;
            justify-content:space-around;
            padding:7px;
            gap:5px;
        `;

    function createButton(label, action, disabled = false) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = disabled;
      button.style.cssText = `
                border:0;
                border-radius:5px;
                padding:6px 9px;
                cursor:pointer;
                background:${disabled ? "#eaecf0" : "#eff4ff"};
                color:${disabled ? "#98a2b3" : "#155eef"};
            `;
      button.addEventListener("click", action);
      return button;
    }

    // MOVE LEFT
    controls.appendChild(
      createButton("←", () => movePhoto(position, -1), position === 0),
    );

    // MOVE RIGHT
    controls.appendChild(
      createButton(
        "→",
        () => movePhoto(position, 1),
        position === photos.length - 1,
      ),
    );

    // DELETE
    controls.appendChild(createButton("×", () => removePhoto(photo)));

    card.appendChild(controls);
    imagePreview.appendChild(card);
  });
} */

// MOVE PHOTO
function movePhoto(position, direction) {
  const photos = [
    ...existingImages.map((file) => ({
      file,
      type: "existing",
    })),
    ...selectedImages.map((file) => ({
      file,
      type: "selected",
    })),
  ];

  const newPosition = position + direction;

  if (newPosition < 0 || newPosition >= photos.length) return;

  [photos[position], photos[newPosition]] = [
    photos[newPosition],
    photos[position],
  ];

  existingImages = photos
    .filter((photo) => photo.type === "existing")
    .map((photo) => photo.file);

  selectedImages = photos
    .filter((photo) => photo.type === "selected")
    .map((photo) => photo.file);

  showImagePreview();
}

// REMOVE PHOTO
/* function removePhoto(photo) {
  if (photo.type === "existing") {
    existingImages.splice(photo.index, 1);
  } else {
    selectedImages.splice(photo.index, 1);
  }

  showImagePreview();
} */

function replacePhoto(photo) {
  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file || !file.type.startsWith("image/")) return;

    if (photo.type === "existing") {
      existingImages[photo.index] = file;
    } else {
      selectedImages[photo.index] = file;
    }

    showImagePreview();
  });

  input.click();
}

function showImagePreview() {
  imagePreview.innerHTML = "";

  const photos = [
    ...existingImages.map((file, index) => ({
      file,
      type: "existing",
      index,
    })),
    ...selectedImages.map((file, index) => ({
      file,
      type: "selected",
      index,
    })),
  ];

  imageCount.textContent = `${photos.length} photo(s) au total. Minimum requis : 3.`;

  photos.forEach((photo, position) => {
    const card = document.createElement("div");

    card.style.cssText = `
            border:1px solid #e4e7ec;
            border-radius:8px;
            overflow:hidden;
            background:white;
        `;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(photo.file);
    img.alt = "Photo du produit";
    img.style.cssText = `
            width:100%;
            height:100px;
            object-fit:cover;
            display:block;
        `;

    card.appendChild(img);

    if (position === 0) {
      const badge = document.createElement("div");
      badge.textContent = "★ Photo principale";
      badge.style.cssText = `
                background:#155eef;
                color:white;
                text-align:center;
                padding:6px;
                font-size:11px;
            `;
      card.appendChild(badge);
    }

    const controls = document.createElement("div");
    controls.style.cssText = `
            display:flex;
            flex-wrap:wrap;
            justify-content:space-around;
            padding:5px;
            gap:1px;
        `;

    function createButton(label, action, disabled = false) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = disabled;
      button.style.cssText = `
                border:0;
                border-radius:5px;
                padding:6px 9px;
                cursor:pointer;
                background:${disabled ? "#eaecf0" : "#eff4ff"};
                color:${disabled ? "#98a2b3" : "#155eef"};
            `;
      button.addEventListener("click", action);
      return button;
    }

    // MOVE LEFT
    controls.appendChild(
      createButton("←", () => movePhoto(position, -1), position === 0),
    );

    // MOVE RIGHT
    controls.appendChild(
      createButton(
        "→",
        () => movePhoto(position, 1),
        position === photos.length - 1,
      ),
    );

    // REPLACE
    controls.appendChild(createButton("↻", () => replacePhoto(photo)));

    // DELETE
    // DELETE
    const deleteButton = createButton("✕", () => removePhoto(photo));

    deleteButton.style.background = "#fee4e2";
    deleteButton.style.color = "#d92d20";
    deleteButton.style.fontWeight = "bold";
    deleteButton.style.fontSize = "18px";

    controls.appendChild(deleteButton);

    card.appendChild(controls);
    imagePreview.appendChild(card);
  });
}

// MOVE PHOTO
function movePhoto(position, direction) {
  const photos = [
    ...existingImages.map((file) => ({
      file,
      type: "existing",
    })),
    ...selectedImages.map((file) => ({
      file,
      type: "selected",
    })),
  ];

  const newPosition = position + direction;

  if (newPosition < 0 || newPosition >= photos.length) return;

  [photos[position], photos[newPosition]] = [
    photos[newPosition],
    photos[position],
  ];

  existingImages = photos
    .filter((photo) => photo.type === "existing")
    .map((photo) => photo.file);

  selectedImages = photos
    .filter((photo) => photo.type === "selected")
    .map((photo) => photo.file);

  showImagePreview();
}

// REMOVE PHOTO
function removePhoto(photo) {
  if (photo.type === "existing") {
    existingImages.splice(photo.index, 1);
  } else {
    selectedImages.splice(photo.index, 1);
  }

  showImagePreview();
}

// RESET FORM
function resetForm() {
  form.reset();
  productId.value = "";
  selectedImages = [];
  existingImages = [];
  imagePreview.innerHTML = "";
  imageCount.textContent = "Aucune photo sélectionnée.";
  formTitle.textContent = "Ajouter un produit";
  saveButton.textContent = "Enregistrer le produit";
  cancelButton.hidden = true;
  imageInput.required = true;
  productAvailability.value = "true";
}

// CREATE / UPDATE
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = productId.value ? Number(productId.value) : null;

  const oldProduct = id
    ? (await getAllProducts()).find((p) => p.id === id)
    : null;

  const images = [...existingImages, ...selectedImages];

  if (images.length < 3) {
    alert("Un produit doit avoir au minimum 3 photos.");
    return;
  }

  const product = {
    name: productName.value.trim(),
    category: productCategory.value,
    price: Number(productPrice.value),
    description: productDescription.value.trim(),
    images,
    createdAt: oldProduct?.createdAt || new Date().toISOString(),
  };

  if (id) product.id = id;

  if (
    !product.name ||
    !product.description ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    alert("Vérifie les informations du produit.");
    return;
  }

  try {
    await saveProduct(product);
    alert("Produit enregistré avec succès !");
    resetForm();
    await renderProducts();
  } catch (error) {
    console.error(error);
    alert("Erreur pendant l'enregistrement du produit.");
  }
});

// DISPLAY PRODUCTS
async function renderProducts() {
  const products = await getAllProducts();

  productsList.innerHTML = "";
  productCount.textContent = `${products.length} produit(s)`;

  if (products.length === 0) {
    productsList.innerHTML = `
            <p class="empty-message">
                Aucun produit enregistré pour le moment.
            </p>
        `;
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.style.cssText = `
            display:flex;
            gap:15px;
            align-items:center;
            padding:15px 0;
            border-bottom:1px solid #e4e7ec;
        `;

    const image = document.createElement("img");
    image.src = URL.createObjectURL(product.images[0]);
    image.alt = product.name;
    image.style.cssText = `
            width:90px;
            height:80px;
            object-fit:cover;
            border-radius:8px;
        `;

    const info = document.createElement("div");
    info.style.flex = "1";

    const name = document.createElement("h4");
    name.textContent = product.name;

    const category = document.createElement("p");
    category.textContent = product.category;
    category.style.color = "#667085";

    const price = document.createElement("strong");
    price.textContent = product.price.toLocaleString("fr-FR") + " FCFA";

    const editButton = document.createElement("button");
    editButton.textContent = "Modifier";
    editButton.type = "button";
    editButton.style.cssText =
      "padding:8px 12px;margin-top:8px;cursor:pointer;";
    editButton.addEventListener("click", () => editProduct(product.id));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.type = "button";
    deleteButton.style.cssText =
      "padding:8px 12px;margin:8px 0 0 6px;color:#d92d20;cursor:pointer;";
    deleteButton.addEventListener("click", () => removeProduct(product.id));

    info.append(
      name,
      category,
      price,
      document.createElement("br"),
      editButton,
      deleteButton,
    );

    card.append(image, info);
    productsList.appendChild(card);
  });
}

// EDIT PRODUCT
async function editProduct(id) {
  const products = await getAllProducts();
  const product = products.find((p) => p.id === id);
  productAvailability.value = product.available === false ? "false" : "true";

  if (!product) return;

  productId.value = product.id;
  productName.value = product.name;
  productCategory.value = product.category;
  productPrice.value = product.price;
  productDescription.value = product.description;

  existingImages = [...product.images];
  selectedImages = [];

  imageInput.required = false;
  imageInput.value = "";

  formTitle.textContent = "Modifier le produit";
  saveButton.textContent = "Enregistrer les modifications";
  cancelButton.hidden = false;

  showImagePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// REMOVE PRODUCT
async function removeProduct(id) {
  const confirmed = confirm("Veux-tu vraiment supprimer ce produit ?");

  if (!confirmed) return;

  await deleteProduct(id);
  await renderProducts();

  if (Number(productId.value) === id) {
    resetForm();
  }
}

// CANCEL EDIT
cancelButton.addEventListener("click", resetForm);

// START
async function init() {
  try {
    await openDatabase();
    await renderProducts();
  } catch (error) {
    console.error(error);
    alert("Impossible d'ouvrir la base de données locale.");
  }
}

init();

const exportButton = document.getElementById("export-button");

function getImageExtension(image) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensions[image.type] || "jpg";
}

async function exportCatalog() {
  try {
    const products = await getAllProducts();

    if (products.length === 0) {
      alert("Aucun produit à exporter.");
      return;
    }

    if (typeof JSZip === "undefined") {
      alert(
        "La bibliothèque ZIP n'est pas chargée. Vérifie ta connexion Internet.",
      );
      return;
    }

    const zip = new JSZip();
    const exportedProducts = [];

    for (const product of products) {
      const imagePaths = [];

      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];

        const extension = getImageExtension(image);

        const imagePath = `assets/products/${product.id}/image-${i + 1}.${extension}`;

        zip.file(imagePath, image);

        imagePaths.push(imagePath);
      }

      exportedProducts.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        available: product.available !== false,
        images: imagePaths,
        createdAt: product.createdAt,
      });
    }

    zip.file("data/products.json", JSON.stringify(exportedProducts, null, 2));

    const blob = await zip.generateAsync({
      type: "blob",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Boutique-Godwin-Export.zip";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    alert("Catalogue exporté avec succès !");
  } catch (error) {
    console.error(error);
    alert("Une erreur est survenue pendant l'exportation.");
  }
}

exportButton.addEventListener("click", exportCatalog);
