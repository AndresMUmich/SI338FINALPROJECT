
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}


function calculateBurgerPrice(b) {
  const PRICES = {
    buns: { "Sesame": 1.5, "Brioche": 2, "Whole Wheat": 1.8 },
    meats: { "Beef": 4, "Chicken": 3.5, "Veggie": 3 },
    toppings: { "Lettuce": 0.5, "Tomato": 0.5, "Cheese": 1, "Onion": 0.3, "Pickles": 0.4 },
    sauces: { "Ketchup": 0.3, "Mustard": 0.3, "Mayo": 0.4, "BBQ": 0.5 },
    sides: { "Fries": 2.5, "Onion Rings": 3, "Salad": 2 },
    drinks: { "Cola": 1.5, "Lemonade": 1.5, "Water": 1 }
  };

  let t = 0;
  if (b.bun) t += PRICES.buns[b.bun] || 0;
  if (b.meat) t += PRICES.meats[b.meat] || 0;
  (b.toppings || []).forEach(x => t += PRICES.toppings[x] || 0);
  (b.sauces || []).forEach(x => t += PRICES.sauces[x] || 0);
  if (b.side) t += PRICES.sides[b.side] || 0;
  if (b.drink) t += PRICES.drinks[b.drink] || 0;

  return t.toFixed(2);
}


function renderCheckout() {
  const checkoutEl = document.getElementById("checkoutItems");
  const cart = getCart();

  if (!cart.length) {
    checkoutEl.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  checkoutEl.innerHTML = cart.map((item, idx) => `
    <div class="checkout-item">
      <h4>Burger #${idx + 1}</h4>

      <ul>
        <li><strong>Bun:</strong> ${item.bun}</li>
        <li><strong>Meat:</strong> ${item.meat}</li>
        <li><strong>Toppings:</strong> ${(item.toppings || []).join(", ") || "None"}</li>
        <li><strong>Sauces:</strong> ${(item.sauces || []).join(", ") || "None"}</li>
        <li><strong>Side:</strong> ${item.side}</li>
        <li><strong>Drink:</strong> ${item.drink}</li>
      </ul>

      <p><strong>Price:</strong> $${calculateBurgerPrice(item)}</p>
    </div>
  `).join("");

  const total = cart.reduce((sum, b) => sum + parseFloat(calculateBurgerPrice(b)), 0);

  checkoutEl.innerHTML += `
    <h3 style="text-align:center; margin-top: 1rem;">
      Total: $${total.toFixed(2)}
    </h3>
  `;
}

function initCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.fullname.value.trim();

    alert(`Thank you for your order, ${name}! Your order is on the way!`);

    localStorage.removeItem("cart");

    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckout();
  initCheckoutForm();
});
