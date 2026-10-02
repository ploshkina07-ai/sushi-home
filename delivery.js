document.addEventListener('DOMContentLoaded', async () => {
    const ratesBody = document.getElementById('delivery-rates-body');
    if (!ratesBody) return;

    const apiBaseUrl = window.location.protocol === 'file:' ? 'http://localhost:4000' : '';

    try {
        const response = await fetch(`${apiBaseUrl}/api/config`);
        const result = await response.json();
        const rates = result?.config?.delivery?.rates;
        if (!response.ok || !Array.isArray(rates) || !rates.length) return;

        ratesBody.replaceChildren();
        rates.forEach((rate) => {
            const row = document.createElement('tr');
            const location = document.createElement('td');
            const price = document.createElement('td');
            const conditions = document.createElement('td');
            location.textContent = rate.location || '';
            price.textContent = rate.price != null ? String(rate.price) : '';
            conditions.textContent = rate.conditions || '';
            row.append(location, price, conditions);
            ratesBody.appendChild(row);
        });
    } catch (error) {
        // The original markup remains visible if the local API is unavailable.
    }
});
