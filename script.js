document.addEventListener("DOMContentLoaded", () => {
    const sliderTrack = document.querySelector(".slider-track");
    const sliderDots = document.querySelector(".slider-dots");
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    let sliderTimerId = null;

    const renderSliderFromConfig = async () => {
        if (!sliderTrack || !sliderDots) {
            return;
        }

        if (sliderTimerId) {
            window.clearInterval(sliderTimerId);
            sliderTimerId = null;
        }

        const resolveBannerImage = (banner, index) => {
            if (window.innerWidth <= 768) {
                const mobileBanners = [
                    'images/banner_mob.jpeg',
                    'images/banner2_mob.jpg',
                    'images/banner3_mob.jpg',
                    'images/banner4_mob.jpeg'
                ];
                return banner.mobileImage || mobileBanners[index] || banner.image || 'images/banner.png';
            }

            return banner.image || 'images/banner.png';
        };

        try {
            const apiBaseUrl = window.location.protocol === 'file:' ? 'http://localhost:4000' : '';
            const response = await fetch(`${apiBaseUrl}/api/config`);
            const result = await response.json();
            const banners = Array.isArray(result?.config?.index?.banners) && result.config.index.banners.length
                ? result.config.index.banners
                : [
                    { image: 'images/banner.png' },
                    { image: 'images/banner2.png' },
                    { image: 'images/banner3.png' },
                    { image: 'images/banner4.png' }
                ];

            sliderTrack.innerHTML = banners.map((banner, index) =>
                `<img class="slider-slide${index === 0 ? ' active' : ''}" src="${resolveBannerImage(banner, index)}" alt="Banner slide ${index + 1}">`
            ).join('');

            sliderDots.innerHTML = banners.map((_, index) => `
                <button type="button" class="${index === 0 ? 'active' : ''}" aria-label="Слайд ${index + 1}" data-slide="${index}"></button>
            `).join('');
        } catch (error) {
            sliderTrack.innerHTML = `
                    <img class="slider-slide active" src="${window.innerWidth <= 768 ? 'images/banner_mob.jpeg' : 'images/banner.png'}" alt="Banner slide 1">
                    <img class="slider-slide" src="${window.innerWidth <= 768 ? 'images/banner2_mob.jpg' : 'images/banner2.png'}" alt="Banner slide 2">
                    <img class="slider-slide" src="${window.innerWidth <= 768 ? 'images/banner3_mob.jpg' : 'images/banner3.png'}" alt="Banner slide 3">
                    <img class="slider-slide" src="${window.innerWidth <= 768 ? 'images/banner4_mob.jpeg' : 'images/banner4.png'}" alt="Banner slide 4">
                `;
            sliderDots.innerHTML = `
                <button class="active" type="button" aria-label="Слайд 1" data-slide="0"></button>
                <button type="button" aria-label="Слайд 2" data-slide="1"></button>
                <button type="button" aria-label="Слайд 3" data-slide="2"></button>
                <button type="button" aria-label="Слайд 4" data-slide="3"></button>
            `;
        }

        const slides = Array.from(document.querySelectorAll(".slider-slide"));
        const dots = Array.from(document.querySelectorAll(".slider-dots button"));

        if (!slides.length || !dots.length) {
            return;
        }

        let activeIndex = 0;

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === activeIndex);
                dot.setAttribute("aria-pressed", dotIndex === activeIndex ? "true" : "false");
            });
        };

        const startAutoPlay = () => {
            sliderTimerId = window.setInterval(() => {
                showSlide(activeIndex + 1);
            }, 4000);
        };

        const restartAutoPlay = () => {
            if (sliderTimerId) {
                window.clearInterval(sliderTimerId);
                sliderTimerId = null;
            }
            startAutoPlay();
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const targetIndex = Number(dot.dataset.slide || 0);
                showSlide(targetIndex);
                restartAutoPlay();
            });
        });

        showSlide(0);
        startAutoPlay();
    };

    renderSliderFromConfig();

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 390 || window.innerWidth > 390) {
            renderSliderFromConfig();
        }
    });

    if (burgerBtn && mobileMenu && mobileMenuClose) {
        burgerBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            mobileMenu.setAttribute('aria-hidden', 'false');
        });

        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-hidden', 'true');
        });

        mobileMenu.addEventListener('click', (event) => {
            if (event.target === mobileMenu) {
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    const productCards = Array.from(document.querySelectorAll(".products .product-card"));
    const productModal = document.querySelector(".product-modal");
    const productModalImage = productModal?.querySelector(".product-modal__image");
    const productModalTitle = productModal?.querySelector(".product-modal__title");
    const productModalPrice = productModal?.querySelector(".product-modal__price");
    const productModalWeight = productModal?.querySelector(".product-modal__weight");
    const productModalDescription = productModal?.querySelector(".product-modal__description");
    const productModalCartButton = productModal?.querySelector(".product-modal__cart");
    const productModalCloseButtons = Array.from(document.querySelectorAll("[data-modal-close]"));

    const CART_KEY = "sushiHomeCart";
    const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:4000' : '';

    const apiFetch = async (path, options = {}) => {
        const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
        const response = await fetch(url, options);

        if (!response.ok && API_BASE_URL && url === `${API_BASE_URL}${path}`) {
            const fallbackUrl = `http://localhost:4000${path}`;
            if (fallbackUrl !== url) {
                return fetch(fallbackUrl, options);
            }
        }

        return response;
    };

    const getCart = () => {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        } catch (error) {
            return [];
        }
    };

    const parsePrice = (value) => {
        const digits = String(value || "0").replace(/[^\d]/g, "");
        return Number(digits || 0);
    };

    const renderCart = () => {
        const orderItems = document.getElementById("order-items");
        const orderTotal = document.getElementById("order-total");

        if (!orderItems || !orderTotal) {
            return;
        }

        const cart = getCart();
        if (!cart.length) {
            orderItems.innerHTML = '<p class="order-empty">Кошик порожній</p>';
            orderTotal.textContent = "0 грн";
            return;
        }

        const total = cart.reduce((sum, item) => sum + parsePrice(item.priceText) * (item.quantity || 1), 0);
        orderTotal.textContent = `${total} грн`;

        orderItems.innerHTML = cart.map((item) => `
            <div class="order-item">
                <div class="order-item__info">
                    <span class="order-item__title">${item.title}</span>
                    <span class="order-item__meta">${item.quantity || 1} × ${item.weightText || "—"}</span>
                </div>
                <div class="order-item__price">
                    <span>${parsePrice(item.priceText) * (item.quantity || 1)} грн</span>
                    <button class="order-item__remove" type="button" data-title="${item.title}" data-price="${item.priceText}" aria-label="Видалити товар">×</button>
                </div>
            </div>
        `).join("");

        orderItems.querySelectorAll(".order-item__remove").forEach((button) => {
            button.addEventListener("click", () => {
                const title = button.dataset.title;
                const priceText = button.dataset.price;
                const cartItems = getCart();
                const filtered = cartItems.filter((item) => !(item.title === title && item.priceText === priceText));
                localStorage.setItem(CART_KEY, JSON.stringify(filtered));
                renderCart();
            });
        });
    };

    const addProductToCart = (card) => {
        const title = card.querySelector(".product-info h3")?.textContent?.trim() || "Товар";
        const priceText = card.querySelector(".price-row span")?.textContent?.trim() || "0 грн";
        const weightText = card.dataset.weight || "—";
        const ingredients = card.dataset.ingredients || "";
        const imageSrc = card.querySelector(".product-image img")?.src || "";
        const cart = getCart();
        const existingIndex = cart.findIndex((item) => item.title === title && item.priceText === priceText);

        if (existingIndex >= 0) {
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            cart.push({ title, priceText, weightText, description: ingredients, image: imageSrc, quantity: 1 });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    };

    renderCart();

    populateOrderLocalities();

    const orderForm = document.getElementById("order-form");

    async function populateOrderLocalities() {
        try {
            const response = await apiFetch('/api/config');
            if (!response.ok) return;
            const data = await response.json();
            const rates = data?.config?.delivery?.rates || [];
            const select = document.getElementById('order-locality');
            if (!select) return;

            // populate options (no price displayed or attached)
            rates.forEach((rate) => {
                const opt = document.createElement('option');
                opt.value = rate.location || '';
                opt.textContent = rate.location || '';
                select.appendChild(opt);
            });
        } catch (error) {
            // ignore
        }
    }

    if (orderForm) {
        orderForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(orderForm);
            const name = String(formData.get("name") || "").trim() || "Клієнт";
            const phone = String(formData.get("phone") || "").trim() || "Номер не вказаний";
            const address = String(formData.get("address") || "").trim() || "Адреса не вказана";
            const comment = String(formData.get("comment") || "").trim();
            const cart = getCart();
            const locality = String(formData.get("locality") || "").trim();
            const successMessage = document.getElementById("order-success");

            if (!cart.length) {
                if (successMessage) {
                    successMessage.textContent = "Додайте хоча б один товар до кошика перед відправкою.";
                    successMessage.style.color = "#c62026";
                }
                return;
            }

            const total = cart.reduce((sum, item) => sum + parsePrice(item.priceText) * (item.quantity || 1), 0);
            const order = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                name,
                phone,
                address,
                comment,
                locality,
                items: cart,
                total
            };

            try {
                const response = await apiFetch("/api/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(order)
                });

                const responseText = await response.text();
                let result = {};

                if (responseText) {
                    try {
                        result = JSON.parse(responseText);
                    } catch (error) {
                        result = { message: "Сервер повернув не JSON відповідь." };
                    }
                }

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("API замовлень не знайдено. Запустіть сервер: node server.js");
                    }

                    throw new Error(result.message || "Не вдалося відправити замовлення");
                }

                localStorage.setItem(CART_KEY, JSON.stringify([]));
                orderForm.reset();
                renderCart();

                if (successMessage) {
                    successMessage.textContent = result.message || "Замовлення успішно надіслано.";
                    successMessage.style.color = "#1b8f56";
                }
            } catch (error) {
                if (successMessage) {
                    successMessage.textContent = error.message || "Помилка при відправці замовлення.";
                    successMessage.style.color = "#c62026";
                }
            }
        });
    }

    let activeProductCard = null;

    const openProductModal = (card) => {
        if (!productModal || !productModalImage || !productModalTitle || !productModalPrice || !productModalWeight || !productModalDescription) {
            return;
        }

        const image = card.querySelector(".product-image img");
        const title = card.querySelector(".product-info h3");
        const price = card.querySelector(".price-row span");

        productModalImage.src = image?.src || "";
        productModalImage.alt = image?.alt || "";
        productModalTitle.textContent = title?.textContent.trim() || "";
        productModalPrice.textContent = price?.textContent.trim() || "";
        const weight = (card.dataset.weight || "—").replace(/^Вага:\s*/i, "").trim();
        const ingredients = (card.dataset.ingredients || "—").replace(/^Склад:\s*/i, "").trim();

        productModalWeight.textContent = `Вага: ${weight}`;
        productModalDescription.textContent = `Склад: ${ingredients}`;
        activeProductCard = card;

        productModal.classList.add("active");
        productModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };

    const closeProductModal = () => {
        if (!productModal) {
            return;
        }

        productModal.classList.remove("active");
        productModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        activeProductCard = null;
    };

    productCards.forEach((card) => {
        const button = card.querySelector(".price-row button");

        if (!button) {
            return;
        }

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openProductModal(card);
        });
    });

    productModalCartButton?.addEventListener("click", () => {
        if (!activeProductCard) {
            return;
        }

        addProductToCart(activeProductCard);
        closeProductModal();
    });

    productModalCloseButtons.forEach((button) => {
        button.addEventListener("click", closeProductModal);
    });

    productModal?.addEventListener("click", (event) => {
        if (event.target === productModal) {
            closeProductModal();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeProductModal();
        }
    });
});
