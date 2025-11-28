function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = getCart().length;
}

const PRICES = {
  buns: { "Sesame": 1.5, "Brioche": 2, "Whole Wheat": 1.8 },
  meats: { "Beef": 4, "Chicken": 3.5, "Veggie": 3 },
  toppings: { "Lettuce": 0.5, "Tomato": 0.5, "Cheese": 1, "Onion": 0.3, "Pickles": 0.4 },
  sauces: { "Ketchup": 0.3, "Mustard": 0.3, "Mayo": 0.4, "BBQ": 0.5 },
  sides: { "Fries": 2.5, "Onion Rings": 3, "Salad": 2 },
  drinks: { "Cola": 1.5, "Lemonade": 1.5, "Water": 1 }
};

function calculateBurgerPrice(b) {
  let t = 0;
  if (b.bun) t += PRICES.buns[b.bun] || 0;
  if (b.meat) t += PRICES.meats[b.meat] || 0;
  (b.toppings || []).forEach(x => t += PRICES.toppings[x] || 0);
  (b.sauces || []).forEach(x => t += PRICES.sauces[x] || 0);
  if (b.side) t += PRICES.sides[b.side] || 0;
  if (b.drink) t += PRICES.drinks[b.drink] || 0;
  return t.toFixed(2);
}

let burgerBuilder = JSON.parse(localStorage.getItem("burgerBuilder")) || {
  bun: "",
  meat: "",
  toppings: [],
  sauces: [],
  side: "",
  drink: ""
};

function saveProgress() {
  localStorage.setItem("burgerBuilder", JSON.stringify(burgerBuilder));
}


function annotateOptionsWithPrices() {
  document.querySelectorAll("form").forEach(form => {
    const formId = form.id;
    let category = "";
    if (formId.includes("bun")) category = "buns";
    else if (formId.includes("meat")) category = "meats";
    else if (formId.includes("topping")) category = "toppings";
    else if (formId.includes("sauce")) category = "sauces";
    else if (formId.includes("side")) category = "sides";
    else if (formId.includes("drink")) category = "drinks";
    if (!category) return;

    form.querySelectorAll("label").forEach(label => {
      const input = label.querySelector("input");
      if (!input) return;
      const value = input.value;
      const price = PRICES[category]?.[value];
      if (price == null) return;

      let nameSpan = label.querySelector("span");
      if (!nameSpan) {
        nameSpan = document.createElement("span");
        nameSpan.textContent = value;
        label.appendChild(nameSpan);
      }

      if (!nameSpan.textContent.includes("$")) {
        nameSpan.textContent = `${nameSpan.textContent} — $${price.toFixed(2)}`;
      }
    });
  });
}

function showStep(stepId) {
  document.querySelectorAll(".builder-step").forEach((s) => (s.hidden = true));
  const step = document.getElementById(stepId);
  if (step) step.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const steps = [
  { name: "bun", next: "step-meat", back: null },
  { name: "meat", next: "step-toppings", back: "step-bun" },
  { name: "toppings", next: "step-sauces", back: "step-meat" },
  { name: "sauces", next: "step-side", back: "step-toppings" },
  { name: "side", next: "step-drink", back: "step-sauces" },
  { name: "drink", next: "step-summary", back: "step-side" }
];

steps.forEach((step) => {
  const form = document.getElementById(`${step.name}Form`);
  if (!form) return;
  const nextBtn = document.getElementById(`${step.name}Next`);
  const backBtn = document.getElementById(`${step.name}Back`);
  if (backBtn && step.back) backBtn.addEventListener("click", () => showStep(step.back));

  if (form.querySelector("input[type='radio']")) {
    form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        nextBtn.disabled = false;
        burgerBuilder[step.name] = input.value;
        saveProgress();
      });
    });
  }

  if (form.querySelector("input[type='checkbox']")) {
    nextBtn?.addEventListener("click", () => {
      const selected = Array.from(form.querySelectorAll("input:checked")).map((i) => i.value);
      burgerBuilder[step.name] = selected;
      saveProgress();
      if (step.next) showStep(step.next);
    });
  }

  nextBtn?.addEventListener("click", () => {
    if (!form.querySelector("input[type='checkbox']") && burgerBuilder[step.name]) {
      if (step.next) {
        if (step.next === "step-summary") updateSummary();
        showStep(step.next);
      }
    }
  });
});

const summaryContent = document.getElementById("summaryContent");
const summaryBack = document.getElementById("summaryBack");
const addToCart = document.getElementById("addToCart");

function updateSummary() {
  if (!summaryContent) return;
  const { bun, meat, toppings, sauces, side, drink } = burgerBuilder;
  const total = calculateBurgerPrice(burgerBuilder);
  summaryContent.innerHTML = `
    <ul>
      <li><strong>Bun:</strong> ${bun || "-"} ${bun ? `($${PRICES.buns[bun].toFixed(2)})` : ""}</li>
      <li><strong>Meat:</strong> ${meat || "-"} ${meat ? `($${PRICES.meats[meat].toFixed(2)})` : ""}</li>
      <li><strong>Toppings:</strong> ${
        (toppings || []).length
          ? toppings.map(t => `${t} ($${PRICES.toppings[t].toFixed(2)})`).join(", ")
          : "None"
      }</li>
      <li><strong>Sauces:</strong> ${
        (sauces || []).length
          ? sauces.map(s => `${s} ($${PRICES.sauces[s].toFixed(2)})`).join(", ")
          : "None"
      }</li>
      <li><strong>Side:</strong> ${side || "-"} ${side ? `($${PRICES.sides[side].toFixed(2)})` : ""}</li>
      <li><strong>Drink:</strong> ${drink || "-"} ${drink ? `($${PRICES.drinks[drink].toFixed(2)})` : ""}</li>
    </ul>
    <h3>Total: $${total}</h3>
  `;
}

summaryBack?.addEventListener("click", () => showStep("step-drink"));

addToCart?.addEventListener("click", () => {
  const cart = getCart();
  const item = { id: Date.now(), ...burgerBuilder };
  cart.push(item);
  saveCart(cart);

  burgerBuilder = { bun: "", meat: "", toppings: [], sauces: [], side: "", drink: "" };
  saveProgress();

  window.location.href = "index.html";
});

const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const clearCart = document.getElementById("clearCart");

openCart?.addEventListener("click", () => {
  renderCart();
  cartDrawer.hidden = false;
});
closeCart?.addEventListener("click", () => (cartDrawer.hidden = true));
cartDrawer?.addEventListener("click", (e) => {
  if (e.target === cartDrawer) cartDrawer.hidden = true;
});
clearCart?.addEventListener("click", () => {
  saveCart([]);
  renderCart();
});

function renderCart() {
  if (!cartItemsEl) return;
  const cart = getCart();
  if (!cart.length) {
    cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }
  cartItemsEl.innerHTML = cart
    .map((item, idx) => {
      const itemTotal = calculateBurgerPrice(item);
      return `
        <div class="cart-item" data-id="${item.id}">
          <h4>Burger #${idx + 1}</h4>
          <div><strong>Bun:</strong> ${item.bun || "-"}</div>
          <div><strong>Meat:</strong> ${item.meat || "-"}</div>
          <div><strong>Toppings:</strong> ${(item.toppings || []).join(", ") || "None"}</div>
          <div><strong>Sauces:</strong> ${(item.sauces || []).join(", ") || "None"}</div>
          <div><strong>Side:</strong> ${item.side || "-"}</div>
          <div><strong>Drink:</strong> ${item.drink || "-"}</div>
          <div><strong>Price:</strong> $${itemTotal}</div>
          <div class="cart-actions">
            <button class="removeItem">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");
  const totalAll = cart.reduce((sum, it) => sum + parseFloat(calculateBurgerPrice(it)), 0);
  cartItemsEl.innerHTML += `<h3 style="text-align:center;">Cart Total: $${totalAll.toFixed(2)}</h3>`;
  cartItemsEl.querySelectorAll(".removeItem").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const wrapper = e.target.closest(".cart-item");
      const id = Number(wrapper.dataset.id);
      const newCart = getCart().filter((it) => it.id !== id);
      saveCart(newCart);
      renderCart();
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname;
  if (currentPage.includes("shop.html")) {
    localStorage.removeItem("burgerBuilder");
    burgerBuilder = { bun: "", meat: "", toppings: [], sauces: [], side: "", drink: "" };
  }

  updateCartCount();
  annotateOptionsWithPrices();

  if (burgerBuilder.drink) { updateSummary(); showStep("step-summary"); }
  else if (burgerBuilder.side) showStep("step-drink");
  else if ((burgerBuilder.sauces || []).length) showStep("step-side");
  else if ((burgerBuilder.toppings || []).length) showStep("step-sauces");
  else if (burgerBuilder.meat) showStep("step-toppings");
  else if (burgerBuilder.bun) showStep("step-meat");
  else showStep("step-bun");
});
