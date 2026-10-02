document.addEventListener('DOMContentLoaded', async () => {
    const apiBaseUrl = window.location.protocol === 'file:' ? 'http://localhost:4000' : '';

    const setParagraphs = (container, text) => {
        if (!container || !text) return;
        const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        if (!paragraphs.length) return;
        container.replaceChildren(...paragraphs.map((paragraph) => {
            const node = document.createElement('p');
            node.textContent = paragraph;
            return node;
        }));
    };

    try {
        const response = await fetch(`${apiBaseUrl}/api/config`, { cache: 'no-store' });
        const result = await response.json();
        const content = result?.config?.content || {};

        const indexTitle = document.getElementById('index-about-title');
        if (indexTitle && content.index?.aboutTitle) indexTitle.textContent = content.index.aboutTitle;
        setParagraphs(document.getElementById('index-about-text'), content.index?.aboutText);

        const deliveryTitle = document.getElementById('delivery-page-title');
        if (deliveryTitle && content.delivery?.title) deliveryTitle.textContent = content.delivery.title;
        setParagraphs(document.getElementById('delivery-page-text'), content.delivery?.text);

        const map = document.getElementById('store-map');
        if (map && content.store?.mapUrl) map.src = content.store.mapUrl;
        if (content.store?.address) {
            document.querySelectorAll('[data-store-address]').forEach((node) => {
                node.textContent = content.store.address;
            });
        }
        if (content.store?.phone) {
            document.querySelectorAll('[data-store-phone]').forEach((node) => {
                node.textContent = content.store.phone;
            });
        }
        if (content.store?.hours) {
            document.querySelectorAll('[data-store-hours]').forEach((node) => {
                node.textContent = content.store.hours;
            });
        }
        if (content.store?.social) {
            const container = document.querySelector('[data-store-social]');
            if (container) {
                container.innerHTML = '';
                const social = content.store.social || {};
                const map = [
                    { key: 'instagram', iconClass: 'fab fa-instagram' },
                    { key: 'facebook', iconClass: 'fab fa-facebook-f' },
                    { key: 'telegram', iconClass: 'fab fa-telegram-plane' }
                ];

                map.forEach(({ key, iconClass }) => {
                    const href = social[key];
                    if (!href) return;
                    const a = document.createElement('a');
                    a.href = href;
                    a.target = '_blank';
                    a.rel = 'noreferrer noopener';
                    a.style.marginRight = '12px';
                    a.className = 'footer-social-link';
                    a.innerHTML = `<i class="${iconClass}"></i>`;
                    container.appendChild(a);
                });
            }
        }
    } catch (error) {
        // Static content remains visible if the API is unavailable.
    }
});
