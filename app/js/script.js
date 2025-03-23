const cart = {};

// Initialize website on load
document.addEventListener("DOMContentLoaded", () => {
  updateOrderSummary();

  const content = document.querySelector(".content");

  fetch("/data.json")
    .then((response) => response.json())
    .then((foodItems) => {
      foodItems.forEach((item) => {
        const foodCard = document.createElement("div");
        foodCard.classList.add("food-card");

        foodCard.innerHTML = `
              <img class="food-card__image" src="${item.image.mobile}" alt="${
          item.name
        }" />
              <button class="add-to-cart-btn">
                <img src="assets/images/icon-add-to-cart.svg" alt="Add to Cart" /> Add to Cart
              </button>
            <div class="food-card__description">
              <p class="text-set4 category">${item.category}</p>
              <h3 class="item-name text-set3">${item.name}</h3>
              <p class="price text-set3">$${item.price.toFixed(2)}</p>
            </div>
      `;

        content.appendChild(foodCard);
      });
      setTimeout(() => {
        const foodCard = document.querySelector(".food-card");
        if (foodCard) {
          console.log("Food card found!", getComputedStyle(foodCard));
        } else {
          console.error("No .food-card found after adding elements.");
        }
      }, 500);
    })
    .catch((err) => console.error("Error loading food data", err));
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".add-to-cart-btn")) {
    handleAddToCart(event);
  }
});

// Handle adding items to cart
const handleAddToCart = (event) => {
  const addToCartBtn = event.target.closest(".add-to-cart-btn");
  if (!addToCartBtn) return;

  const foodCard = addToCartBtn.closest(".food-card");
  if (!foodCard) return;

  const itemNameElement = foodCard.querySelector(".item-name");
  if (!itemNameElement) return;
  const itemName = itemNameElement.textContent.trim();

  const itemPrice = parseFloat(
    foodCard.querySelector(".price").textContent.replace("$", "")
  );

  if (!cart[itemName]) {
    const itemImage = foodCard.querySelector(".food-card__image").src;
    cart[itemName] = { quantity: 1, price: itemPrice, image: itemImage };
  } else {
    cart[itemName].quantity += 1;
  }

  foodCard.querySelector(".food-card__image").classList.add("border-highlight");

  // Replace button with quantity controls
  const quantityControls = document.createElement("div");
  quantityControls.classList.add("quantity-controls");
  quantityControls.innerHTML = `
    <button class="decrease-btn">-</button>
    <span class="quantity-display">${cart[itemName].quantity}</span>
    <button class="increase-btn">+</button>
  `;

  addToCartBtn.replaceWith(quantityControls);

  setupQuantityControls(quantityControls, itemName, foodCard);

  updateOrderSummary();
};

// Setup quantity controls
const setupQuantityControls = (quantityElement, itemName, foodCard) => {
  const decreaseBtn = quantityElement.querySelector(".decrease-btn");
  const increaseBtn = quantityElement.querySelector(".increase-btn");
  const quantityDisplay = quantityElement.querySelector(".quantity-display");

  const updateQuantity = () => {
    quantityDisplay.textContent = cart[itemName].quantity;
    updateOrderSummary();
  };

  increaseBtn.addEventListener("click", () => {
    cart[itemName].quantity += 1;
    updateQuantity();
  });

  decreaseBtn.addEventListener("click", () => {
    if (cart[itemName].quantity > 1) {
      cart[itemName].quantity -= 1;
      updateQuantity();
    } else {
      delete cart[itemName];
      updateOrderSummary();
      revertToAddToCartButton(quantityElement, foodCard);
      foodCard
        .querySelector(".food-card__image")
        .classList.remove("border-highlight");
    }
  });
};

const revertToAddToCartButton = (quantityElement, foodCard) => {
  const addToCartBtn = document.createElement("button");
  addToCartBtn.className = "add-to-cart-btn";
  addToCartBtn.innerHTML = `
    <img src="assets/images/icon-add-to-cart.svg" alt="Add to Cart" /> Add to Cart
  `;

  quantityElement.replaceWith(addToCartBtn);
  addToCartBtn.addEventListener("click", handleAddToCart);

  if (foodCard) {
    foodCard
      .querySelector(".food-card__image")
      .classList.remove("border-highlight");
  }
};

const revertItemToAddToCart = (itemName) => {
  const foodCards = document.querySelectorAll(".food-card");

  foodCards.forEach((foodCard) => {
    const nameElement = foodCard.querySelector(".item-name");
    if (nameElement.textContent.trim() === itemName) {
      const quantityControls = foodCard.querySelector(".quantity-controls");
      if (quantityControls) {
        revertToAddToCartButton(quantityControls, foodCard);

        foodCard
          .querySelector(".food-card__image")
          .classList.remove("border-highlight");
      }
    }
  });
};

// Update cart display
const updateOrderSummary = () => {
  const cartContainer = document.querySelector(".cart-container");
  if (!cartContainer) {
    console.error("Cart container not found");
    return;
  }

  cartContainer.innerHTML = "";
  const cartOrder = document.createElement("div");
  cartOrder.classList.add("cart");

  const cartItems = Object.keys(cart);
  if (cartItems.length === 0) {
    cartOrder.innerHTML = `
        <div class="empty-cart">
      <img
        src="assets/images/illustration-empty-cart.svg"
        alt="add to cart"
      />
      <p class="text-set4__bold cart__summary">
        Your added items will appear here
      </p>
    </div>
  `;
    cartOrder.classList.add("empty-cart");
  } else {
    cartOrder.classList.remove("empty-cart");
    let totalPrice = 0;
    let cartHTML = `<p class="text-set2 cart__title">Your Cart (${cartItems.length})</p>`;

    cartItems.forEach((item) => {
      const { quantity, price } = cart[item];
      const itemTotal = quantity * price;
      totalPrice += itemTotal;

      cartHTML += `
        <div class="cart__block">
          <p class="cart__item text-set4__bold">${item}</p>
          <div class="cart__quantity">
            <div class="cart__price__info">
              <span class="text-set4__bold cart__number">${quantity}x</span>
              <span class="text-set4 cart__price">@$${price.toFixed(2)}</span>
              <span class="text-set4__bold cart__total">$${itemTotal.toFixed(
                2
              )}</span>
            </div>
            <img
              class="remove-icon"
              src="assets/images/icon-remove-item.svg"
              alt="remove item"
              data-item="${item}"
            />
          </div>
        </div>
      `;
    });

    cartHTML += `
      <div class="cart__order__total">
         <div class="text-set4">Order Total</div>
        <span class="text-set2">$${totalPrice.toFixed(2)}</span>   
      </div>
        <div class="carbon__info text-set4">
          
          <p>
          <img src="assets/images/icon-carbon-neutral.svg" alt="carbon" />
            This is a <span class="text-set4__bold">carbon-neutral</span> delivery
          </p>
          <button class="btn text-set3 confirm__btn">Confirm Order</button>
        </div>
    `;

    cartOrder.innerHTML = cartHTML;
  }

  cartContainer.appendChild(cartOrder);

  // Remove items from cart
  document.querySelectorAll(".remove-icon").forEach((button) => {
    button.addEventListener("click", (event) => {
      const itemToRemove = event.target.dataset.item;
      delete cart[itemToRemove];
      updateOrderSummary();
      revertItemToAddToCart(itemToRemove);
    });
  });
};

//modal section

document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.querySelector(".modal-container");
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");
  document.body.appendChild(modalOverlay);

  const confirmOrderBtn = document.querySelector(".confirm__btn");
  const startNewOrderBtn = modalContainer.querySelector(".new-order__btn");

  const showModal = () => {
    document
      .querySelector(".modal-container")
      .classList.remove("visually-hidden");
    document.querySelector(".modal-overlay").classList.add("show");
  };

  const hideModal = () => {
    document.querySelector(".modal-container").classList.add("visually-hidden");
    document.querySelector(".modal-overlay").classList.remove("show");
    resetCart();
    location.reload();
  };

  const populateModal = () => {
    const modalContent = document.querySelector(".modal-container");

    modalContent.innerHTML = `
      <div class="modal__heading">
       <img class="modal__check" src="assets/images/icon-order-confirmed.svg" alt="checkmark" />
      <h2>Order Confirmed</h2>
      <p class="text-set4">We hope you enjoyed your food</p>
      </div>
      <div class="order-items modal-bg"></div>
      <div class="cart__order__total modal-bg modal__total">
        <div class="text-set4">Order Total</div>
        <span class="text-set2" id="order-total">$0.00</span>
      </div>
      <button class="btn text-set3 new-order__btn">Start New Order</button>
    `;

    const orderItemsContainer = modalContent.querySelector(".order-items");
    let totalPrice = 0;

    Object.keys(cart).forEach((itemName) => {
      const { quantity, price, image } = cart[itemName];
      const itemTotal = quantity * price;
      totalPrice += itemTotal;

      const orderItem = document.createElement("div");
      orderItem.classList.add("order");
      orderItem.innerHTML = `
        <div class="order__item">
          <img src="${image}" alt="${itemName}" />
          <div class="order__description modal__description">
            <p class="cart__item text-set4__bold">${itemName}</p>
            <p class="cart__order__quantity">
              <span class="text-set4__bold cart__number">${quantity}x</span> 
              <span class="text-set4 cart__price">@$${price.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <div class="order__price">
          <span class="text-set4__bold">$${itemTotal.toFixed(2)}</span>
        </div>
      `;

      orderItemsContainer.appendChild(orderItem);
    });

    // Update order total
    modalContent.querySelector(
      "#order-total"
    ).textContent = `$${totalPrice.toFixed(2)}`;
  };

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("confirm__btn")) {
      populateModal();
      showModal();
    }
  });

  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", () => {
      populateModal();
      showModal();
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("new-order__btn")) {
      hideModal();
    }
  });

  modalOverlay.addEventListener("click", hideModal);

  const resetCart = () => {
    Object.keys(cart).forEach((item) => {
      delete cart[item];
    });
    updateOrderSummary();
  };
});
