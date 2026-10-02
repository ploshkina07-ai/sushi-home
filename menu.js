document.addEventListener("DOMContentLoaded", () => {
    const burgerBtn = document.querySelector(".burger-btn");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileMenuClose = document.querySelector(".mobile-menu-close");

    const openMobileMenu = () => {
        if (!mobileMenu) {
            return;
        }

        mobileMenu.classList.add("active");
        mobileMenu.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };

    const closeMobileMenu = () => {
        if (!mobileMenu) {
            return;
        }

        mobileMenu.classList.remove("active");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    };

    if (burgerBtn && mobileMenu && mobileMenuClose) {
        burgerBtn.addEventListener("click", openMobileMenu);
        mobileMenuClose.addEventListener("click", closeMobileMenu);
        mobileMenu.addEventListener("click", (event) => {
            if (event.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }

    const categoryList = document.querySelector(".category-list");
    const productsGrid = document.querySelector(".products-grid");
    const modal = document.querySelector(".product-modal");
    const modalImage = modal?.querySelector(".product-modal__image");
    const modalTitle = modal?.querySelector(".product-modal__title");
    const modalPrice = modal?.querySelector(".product-modal__price");
    const modalWeight = modal?.querySelector(".product-modal__weight");
    const modalDescription = modal?.querySelector(".product-modal__description");
    const modalCloseButtons = Array.from(document.querySelectorAll("[data-modal-close]"));

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

    const getMenuConfig = async () => {
        try {
            const response = await apiFetch("/api/config");
            const result = await response.json();
            return result.config || { index: { banners: [], newProducts: [] }, menu: { categories: [], items: [] }, delivery: { text: "" } };
        } catch (error) {
            return { index: { banners: [], newProducts: [] }, menu: { categories: [], items: [] }, delivery: { text: "" } };
        }
    };

    const reorderCategoryButtons = (config) => {
        if (!categoryList) {
            return;
        }

        const staticButtons = Array.from(categoryList.querySelectorAll('button[data-category]'));
        const configOrder = Array.isArray(config.menu?.categories)
            ? config.menu.categories.map((category) => category?.id).filter(Boolean)
            : [];
        const orderedIds = [...configOrder];

        staticButtons.forEach((button) => {
            const categoryId = button.dataset.category;
            if (!categoryId || orderedIds.includes(categoryId)) {
                return;
            }
            orderedIds.push(categoryId);
        });

        const buttonMap = new Map(staticButtons.map((button) => [button.dataset.category, button]));
        const newButtons = orderedIds
            .map((categoryId) => buttonMap.get(categoryId))
            .filter(Boolean);

        staticButtons.forEach((button) => {
            if (!newButtons.includes(button)) {
                categoryList.removeChild(button);
            }
        });

        newButtons.forEach((button) => {
            if (!button.parentNode) {
                categoryList.appendChild(button);
                return;
            }

            categoryList.appendChild(button);
        });

        const activeButton = categoryList.querySelector('button.active');
        if (activeButton && !activeButton.dataset.category) {
            activeButton.classList.remove('active');
        }
    };

    const setData = [
        ["Сет 2кг мега Щастя", "1700 грн", "2080 г / 82 шт", "Філадельфія, Каліфорнія, лосось, макі з огірком, крем-сир, Зелений дракон, Червоний дракон, Філадельфія манго, Такаяма з куркою, Такаяма з омлетом, Філадельфія тартар", "images/Sets/Set2KG.jpg"],
        ["Сет Королівський", "1020 грн", "1100 г / 40 шт", "Зелений дракон, Золотий дракон, Філадельфія з тунцем, Темпура з креветкою, Червоний дракон", "images/Sets/SetKorolivkiy.jpg"],
        ["Сет Філадельфія мікс", "800 грн", "920 г / 32 шт", "Філадельфія, Філадельфія з вугрем, Філадельфія з копченим лососем, Філадельфія з тунцем", "images/Sets/FilaMix.jpg"],
        ["Сет Кохання", "1150 грн", "1300 г / 48 шт", "Філадельфія манго, Філадельфія з чукою, Чедер з лососем, Каліфорнія масаго, Каліфорнія, Червоний дракон", "images/Sets/SetKohannya.jpg"],
        ["Сет Відпочинок", "1290 грн", "1500 г / 60 шт", "Філадельфія манго, Філадельфія з чукою, Такаяма з крем-сиром, макі зі смаженим лососем, Каліфорнія хай, Зелений дракон, Каліфорнія масаго, лосось", "images/Sets/SetVidpochynok.jpg"],
        ["Сет Осака", "890 грн", "1050 г / 44 шт", "Каліфорнія з тунцем, Філадельфія, Чедер з лососем, Такаяма з крабом, макі з огірком, лосось", "images/Sets/SetOsaka.jpg"],
        ["Сет Копчений XXL", "1065 грн", "1245 г / 46 шт", "Філадельфія з копченим лососем, Філадельфія максі з копченим лососем, Боніто з копченим лососем, Каліфорнія з копченим лососем, Чедер з копченим лососем, макі з копченим лососем", "images/Sets/SetKopcheniyXXL.jpg"],
        ["Сет Я це люблю", "1050 грн", "1200 г / 52 шт", "Філадельфія з омлетом, Каліфорнія, Такаяма з куркою, Такаяма з крем-сиром, Зелений дракон, омлет, лосось", "images/Sets/SetYaTseLyublyu.jpg"],
        ["Сет Сан Йорокобі", "590 грн", "690 г / 24 шт", "Філадельфія, Авоманг, Каліфорнія з крем-сиром", "images/Sets/SetSanYorokobi.jpg"],
        ["Сет Весна", "900 грн", "1050 г / 40 шт", "Філадельфія, Філадельфія з чукою, Такаяма з крем-сиром, Такаяма з омлетом, Зелений дракон", "images/Sets/SetVesna.jpg"],
        ["Сет Токіо", "900 грн", "1040 г / 38 шт", "Юма, Чіз рол, Філадельфія з чукою, Інь Ян №2, Сенсей", "images/Sets/SetTokio.jpg"],
        ["Сет Нацу дей", "790 грн", "625 г", "Нацу з тунцем, Нацу з вугрем, Нацу з креветкою, Нацу з мідією, Нацу з лососем", "images/Sets/SetNatsuDay.jpg"],
        ["Сет Пінний", "575 грн", "615 г / 24 шт", "Філадельфія з копченим лососем, Боніто з копченим лососем, Каліфорнія з копченим лососем", "images/Sets/SetPinnuy.jpg"],
        ["Сет Футомакі", "930 грн", "970 г / 40 шт", "Футомакі з креветкою, Футомакі з куркою, Футомакі з крем-сиром, Футомакі з крабом, Футомакі з лососем", "images/Sets/SetFutomaki.jpg"],
        ["Сет Міні бос", "590 грн", "850 г / 48 шт", "Лосось, макі з огірком, омлет, крабові палички, крем-сир, макі з чукою, макі зі смаженим лососем, макі з авокадо", "images/Sets/SetMiniBoss.jpg"],
        ["Сет Лососевий рай", "870 грн", "1100 г / 38 шт", "Філадельфія, Філадельфія міні, Філадельфія максі, Філадельфія з омлетом, лосось", "images/Sets/SetLososeviyRai.jpg"],
        ["Сет Темпура", "830 грн", "1060 г / 32 шт", "Темпура з крабом, Темпура з вугрем, Темпура з креветкою, Темпура з лососем", "images/Sets/SetTempura.jpg"],
        ["Сет Три дракони", "640 грн", "650 г / 24 шт", "Червоний дракон, Зелений дракон, Золотий дракон", "images/Sets/Set3Drakony.jpg"],
        ["Сет Такаяма фо", "810 грн", "860 г / 32 шт", "Такаяма з омлетом, Такаяма з крабом, Такаяма з крем-сиром, Такаяма з лососем", "images/Sets/SetTakayamaPho.jpg"],
        ["Сет Боніто", "550 грн", "600 г / 24 шт", "Боніто з вугрем, Боніто з лососем, Боніто зі смаженим лососем", "images/Sets/SetBonito.jpg"],
        ["Сет Мачі макі", "445 грн", "550 г / 24 шт", "Макі з крем-сиром і чедером, макі зі смаженим лососем і чедером, макі з омлетом і чедером, макі з крабовими паличками і чедером", "images/Sets/SetMachiMaki.jpg"],
        ["Сет Супер дей", "700 грн", "800 г / 36 шт", "Філадельфія міні, Каліфорнія, Футомакі з куркою, макі з огірком, лосось", "images/Sets/SetSuperDay.jpg"],
        ["Сет Гуд дей", "580 грн", "600 г / 24 шт", "Філадельфія міні, Каліфорнія, Футомакі з омлетом", "images/Sets/SetGoodDay.jpg"],
        ["Сет Макі сторіс", "295 грн", "430 г / 24 шт", "Макі з огірком, лосось, макі з омлетом, макі з крабовими паличками", "images/Sets/SetMakiStoris.jpg"],
    ];

    const filadelfiyaData = [
        ["Філадельфія максі", "245 грн", "320 г", "Норі, рис, крем-сир Філадельфія, огірок, лосось", "images/Filadelfiya/FiladelfiyaMaxi.jpg"],
        ["Філадельфія", "210 грн", "250 г", "Норі, рис, крем-сир Філадельфія, огірок, лосось", "images/Filadelfiya/Filadelfiya.jpg"],
        ["Філадельфія міні", "175 грн", "210 г", "Норі, рис, крем-сир Філадельфія, огірок, лосось", "images/Filadelfiya/FiladelfiyaMini.jpg"],
        ["Філадельфія з омлетом", "205 грн", "220 г", "Норі, рис, крем-сир Філадельфія, омлет, лосось", "images/Filadelfiya/FiladelfiyaZOmletom.jpg"],
        ["Філадельфія максі з копченим лососем", "245 грн", "310 г", "Норі, рис, крем-сир Філадельфія, огірок, копчений лосось", "images/Filadelfiya/FiladelfiyaMaxiZKopchenimLososem.jpg"],
        ["Філадельфія з копченим лососем", "205 грн", "220 г", "Норі, рис, крем-сир ФІладельфІя, огІрок, копчений лосось", "images/Filadelfiya/FiladelfiyaZKopchenimLososem.jpg"],
        ["Огата Філадельфія", "485 грн", "610 г", "Норі, рис, крем-сир Філадельфія, огірок, лосось", "images/Filadelfiya/OgataFiladelfiya.jpg"],
        ["Філадельфія манго", "205 грн", "240 г", "Норі, рис, крем-сир Філадельфія, манго, соус унагі", "images/Filadelfiya/FiladelfiyaMango.jpg"],
        ["Філадельфія з чукою", "195 грн", "200 г", "Норі, рис, крем-сир Філадельфія, лосось, чука", "images/Filadelfiya/FiladelfiyaZChukoy.jpg"],
        ["Філадельфія з вугрем", "215 грн", "240 г", "Норі, рис, крем-сир Філадельфія, вугор, соус унагі", "images/Filadelfiya/FiladelfiyaZVugrem.jpg"],
        ["Філадельфія з тунцем", "205 грн", "220 г", "Норі, рис, крем-сир Філадельфія, огірок, тунець", "images/Filadelfiya/FiladelfiyaZTuncom.jpg"],
        ["Філадельфія тартар", "195 грн", "220 г", "Норі, рис, крем-сир Філадельфія, огірок, лосось, соус спайсі, соус унагі", "images/Filadelfiya/FiladelfiyaTartar.jpg"],
    ];

    const firmoviData = [
        ["Рол «Чедер» з копченим лососем", "205 грн", "220 г", "Рис, норі, крем-сир Філадельфія, копчений лосось, чедер, соус унагі", "images/Firmovi/RolChederZKopchenimLososem.jpg"],
        ["Рол з креветкою та сиром", "220 грн", "210 г", "Норі, рис, крем-сир Філадельфія, огірок, креветки, ікра масаго", "images/Firmovi/RolZKrevetkoyuTaSirom.jpg"],
        ["Рол з манго та сиром", "165 грн", "210 г", "Норі, рис, крем-сир Філадельфія, манго, соус унагі", "images/Firmovi/RolZMangoyuTaSirom.jpg"],
        ["Рол з авокадо та сиром", "165 грн", "210 г", "Норі, рис, крем-сир Філадельфія, авокадо, соус унагі", "images/Firmovi/RolZAvokadoyuTaSirom.jpg"],
        ["Рол «Масаго» з тунцем", "210 грн", "180 г", "Норі, рис, крем-сир Філадельфія, тунець, ікра масаго", "images/Firmovi/RolMasagoZTuncom.jpg"],
        ["Чіз рол", "195 грн", "220 г", "Норі, рис, лосось, авокадо, крем-сир Філадельфія, соус унагі", "images/Firmovi/ChizRol.jpg"],
        ["Рол «Авоманг» з креветкою", "205 грн", "225 г", "Норі, рис, крем-сир Філадельфія, манго, креветка, авокадо, соус унагі", "images/Firmovi/RolAvomangZKrevetkoyu.jpg"],
        ["Рол «Юма» з філадельфією та фореллю", "185 грн", "195 г", "Норі, рис, кунжут, крем-сир Філадельфія, форель", "images/Firmovi/RolYumaZFiladelfiyeyuTaForellyu.jpg"],
        ["Рол «Квітень» з філадельфією та авокадо", "205 грн", "200 г", "Норі, рис, крем-сир Філадельфія, чедер, авокадо, соус унагі", "images/Firmovi/RolKvitеньZFiladelfiyeyuTaAvokadoyu.jpg"],
        ["Рол «Від шефа»", "235 грн", "250 г", "Норі, рис, крем-сир Філадельфія, авокадо, вугор, лосось, кунжут, соус унагі", "images/Firmovi/RolVidShefa.jpg"],
        ["Рол «Сенсей» з філадельфією та чукою", "220 грн", "255 г", "Норі, рис, крем-сир Філадельфія, лосось, чука, соус унагі", "images/Firmovi/RolSensheyZFiladelfiyeyuTaChukoyu.jpg"],
        ["Рол «Сакура» з креветкою, манго та лососем", "250 грн", "295 г", "Норі, рис, крем-сир Філадельфія, креветка, манго, лосось, соус унагі, кунжут", "images/Firmovi/RolSakuraZKrevetkoyuMangoyuTaLososem.jpg"],
        ["Рол «Сонячний» з креветкою та огірком", "195 грн", "205 г", "Норі, рис, крем-сир Філадельфія, креветка, огірок, кунжут", "images/Firmovi/RolSonjachniyZKrevetkoyuTaOgirkom.jpg"],
        ["Рол «Нацу» з лососем та манго", "170 грн", "125 г", "Норі, крем-сир Філадельфія, манго, лосось, ікра масаго, соус унагі", "images/Firmovi/RolNatsZLososemTaMangoyu.jpg"],
        ["Рол «Нацу» з креветкою та манго", "170 грн", "125 г", "Норі, крем-сир Філадельфія, манго, креветка, ікра масаго, соус унагɪ", "images/Firmovi/RolNatsZKrevetkoyuTaMangoyu.jpg"],
        ["Рол «Нацу» з тунцем та манго", "170 грн", "125 г", "Норі, крем-сир Філадельфія, манго, тунець, ікра масаго, соус унагі", "images/Firmovi/RolNatsZTuncomTaMangoyu.jpg"],
        ["Рол «Нацу» з вугрем та авокадо", "170 грн", "125 г", "Норі, крем-сир Філадельфія, авокадо, вугор, ікра масаго, соус унагі", "images/Firmovi/RolNatsZVugremTaAvokadoyu.jpg"],
        ["Рол «Нацу» з мідією та авокадо", "170 грн", "125 г", "Норі, крем-сир Філадельфія, авокадо, мідія, ікра масаго, соус унагі", "images/Firmovi/RolNatsZMidiyeyuTaAvokadoyu.jpg"],
    ];

    const kaliforniyaData = [
        ["Огата Каліфорнія", "385 грн", "395 г", "Норі, рис, крабові палички, огірок, авокадо, соус які, соус унагі, кунжут", "images/Kaliforniya/OgataKaliforniya.jpg"],
        ["Каліфорнія", "205 грн", "200 г", "Норі, рис, крабові палички, огірок, авокадо, соус які, кунжут", "images/Kaliforniya/Kaliforniya.jpg"],
        ["Каліфорнія хай", "210 грн", "200 г", "Норі, рис, крем-сир Філадельфія, огірок, смажений лосось, кунжут, соус унагі", "images/Kaliforniya/KaliforniyaHay.jpg"],
        ["Каліфорнія з вугрем", "210 грн", "190 г", "Норі, рис, вугор, огірок, авокадо, кунжут, соус унагі", "images/Kaliforniya/KaliforniyaZVugrem.jpg"],
        ["Каліфорнія масаго", "220 грн", "200 г", "Норі, рис, смажений лосось, огірок, авокадо, соус які, ікра масаго", "images/Kaliforniya/KaliforniyaMasago.jpg"],
        ["Каліфорнія з лососем", "205 грн", "200 г", "Норі, рис, лосось, огірок, авокадо, соус які, кунжут", "images/Kaliforniya/KaliforniyaZLososem.jpg"],
        ["Каліфорнія фіш", "205 грн", "200 г", "Норі, рис, смажений лосось, огірок, авокадо, соус які, кунжут", "images/Kaliforniya/KaliforniyaFish.jpg"],
        ["Каліфорнія з копченим лососем", "205 грн", "195 г", "Норі, рис, копчений лосось, огірок, авокадо, соус які, кунжут", "images/Kaliforniya/KaliforniyaZKopchenimLososem.jpg"],
        ["Каліфорнія з тунцем", "205 грн", "195 г", "Норі, рис, тунець, огірок, авокадо, соус які, кунжут", "images/Kaliforniya/KaliforniyaZTuncom.jpg"],
        ["Каліфорнія з крем-сиром", "210 грн", "225 г", "Норі, рис, крем-сир Філадельфія, крабові палички, огірок, ікра масаго", "images/Kaliforniya/KaliforniyaZKremSytom.jpg"],
    ];

    const drakonyData = [
        ["Червоний дракон", "235 грн", "230 г", "Норі, рис, огірок, авокадо, вугор, кунжут, соус унагі, лосось, соус які", "images/Drakony/ChervoniyDrakon.jpg"],
        ["Зелений дракон", "215 грн", "210 г", "Норі, рис, смажений лосось, огірок, соус які, крабові палички, авокадо, кунжут, соус унагі", "images/Drakony/ZeluyiDrakon.jpg"],
        ["Золотий дракон", "245 грн", "230 г", "Норі, рис, авокадо, огірок, смажений лосось, соус які, вугор, кунжут, соус унагі", "images/Drakony/ZolotiyDrakon.jpg"],
        ["Королівський дракон", "235 грн", "255 г", "Норі, рис, креветки, авокадо, чука, крем-сир Філадельфія, лосось, соус унагі", "images/Drakony/KorolivskiyDrakon.jpg"],
    ];

    const bonitoData = [
        ["Боніто з копченим лососем", "195 грн", "200 г", "Норі, рис, крем-сир Філадельфія, копчений лосось, авокадо, стружка тунця", "images/Bonito/BonitoZKopchenimLososem.jpg"],
        ["Боніто з лососем", "195 грн", "200 г", "Норі, рис, крем-сир Філадельфія, лосось, авокадо, стружка тунця", "images/Bonito/BonitoZLososem.jpg"],
        ["Боніто фіш", "195 грн", "200 г", "Норі, рис, крем-сир Філадельфія, смажений лосось, авокадо, стружка тунця", "images/Bonito/BonitoFish.jpg"],
        ["Боніто з вугрем", "195 грн", "200 г", "Норі, рис, крем-сир Філадельфія, вугор, авокадо, стружка тунця", "images/Bonito/BonitoZVugrem.jpg"],
    ];

    const zKrevetkamiData = [
        ["Темпура з креветкою", "205 грн", "260 г", "Норі, рис, крем-сир Філадельфія, огірок, креветки, кляр, паніровка панко, соус які", "images/ZKrevetkami/TempuraZKrevetkoyu.jpg"],
        ["Рол «Авоманг» з креветкою", "205 грн", "225 г", "Норі, рис, крем-сир Філадельфія, манго, креветка, авокадо, соус унагі", "images/ZKrevetkami/AvomangZKrevetkoyu.jpg"],
        ["Креветка з сиром", "220 грн", "210 г", "Норі, рис, крем-сир Філадельфія, огірок, креветки, ікра масаго", "images/ZKrevetkami/KrevetkaZSytom.jpg"],
        ["Королівський дракон", "235 грн", "255 г", "Норі, рис, креветки, авокадо, чука, крем-сир Філадельфія, лосось, соус унагі", "images/Drakony/KorolivskiyDrakon.jpg"],
        ["Рол «Сакура» з креветкою, лососем та манго", "250 грн", "295 г", "Норі, рис, крем-сир Філадельфія, креветка, манго, лосось, соус унагі, кунжут", "images/ZKrevetkami/SakuraZKrevetkoyuLososemTMango.jpg"],
        ["Рол «Сонячний» з креветкою", "195 грн", "205 г", "Норі, рис, крем-сир Філадельфія, креветка, огірок, кунжут", "images/ZKrevetkami/SonyachniyZKrevet koyu.jpg"],
        ["Рол «Такаяма» з креветкою", "205 грн", "220 г", "Норі, рис, огірок, креветка, сирний заміс, соус унагі", "images/ZKrevetkami/TakayamaZKrevetkoyu.jpg"],
        ["Хоткраб з креветками", "205 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, креветки", "images/ZKrevetkami/HotkrabZKrevetkami.jpg"],
        ["Бургер панко з креветками", "255 грн", "350 г", "Додаються рукавички", "images/ZKrevetkami/BurgerPankoZKrevetkami.jpg"],
    ];

    const zMidiyamiData = [
        ["Рол «Такаяма» з мідіями", "205 грн", "220 г", "Норі, рис, огірок, сирний заміс, соус унагі", "images/ZMidiyami/TakayamaZMidiyami.jpg"],
        ["Хоткраб з мідіями", "205 грн", "220 г", "Норі, рис, огірок, крабовий заміс, соус унагі", "images/ZMidiyami/HotkrabZMidiyami.jpg"],
        ["Макі з мідією", "100 грн", "110 г", "Норі, рис, мідія, соус унагі", "images/ZMidiyami/MakiZMidiyami.jpg"],
        ["Рол «Нацу» з мідією та авокадо", "170 грн", "125 г", "Норі, крем-сир Філадельфія, авокадо, мідія, ікра масаго, соус унагі", "images/ZMidiyami/NatsuZMidiyamiTAvokado.jpg"],
    ];

    const zapeczeniData = [
        ["Рол «Такаяма» з куркою", "225 грн", "215 г", "Норі, рис, огірок, смажене філе курки, сирна шапочка, соус унагі", "images/Zapeczeni/TakayamaZKurkoyu.jpg"],
        ["Рол «Такаяма» з крабовими паличками", "225 грн", "215 г", "Норі, рис, огірок, крабові палички, сирна шапочка, соус унагі", "images/Zapeczeni/TakayamaZKrabovymiPalichkami.jpg"],
        ["Рол «Такаяма» з омлетом", "215 грн", "215 г", "Норі, рис, огірок, омлет, сирна шапочка, соус унагі", "images/Zapeczeni/TakayamaZOmletom.jpg"],
        ["Рол «Такаяма» з крем-сиром", "225 грн", "215 г", "Норі, рис, огірок, крем-сир Філадельфія, сирна шапочка, соус унагі", "images/Zapeczeni/TakayamaZKrem-sirom.jpg"],
        ["Рол «Такаяма» з вугрем", "225 грн", "215 г", "Норі, рис, огірок, вугор, сирна шапочка, соус унагі", "images/Zapeczeni/TakayamaZVugrem.jpg"],
        ["Рол «Такаяма» з креветкою", "225 грн", "220 г", "Норі, рис, огірок, креветка, сирний заміс, соус унагі", "images/Zapeczeni/TakayamaZKrevetkoyu.jpg"],
        ["Рол «Такаяма» з тунцем", "225 грн", "220 г", "Норі, рис, огірок, тунець, сирний заміс, соус унагі", "images/Zapeczeni/TakayamaZTuncom.jpg"],
        ["Рол «Такаяма» з лососем", "225 грн", "215 г", "Норі, рис, огірок, смажений лосось, сирна шапочка, соус унагі", "images/Zapeczeni/TakayamaZLososem.jpg"],
        ["Рол «Такаяма» з мідіями", "215 грн", "220 г", "Норі, рис, огірок, сирний заміс, соус унагі", "images/Zapeczeni/TakayamaZMidiyami.jpg"],
        ["Хоткраб з омлетом", "215 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, омлет", "images/Zapeczeni/HotkrabZOmletom.jpg"],
        ["Хоткраб з вугрем", "225 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, вугор", "images/Zapeczeni/HotkrabZVugrem.jpg"],
        ["Хоткраб з куркою", "225 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, куряче філе", "images/Zapeczeni/HotkrabZKurkoyu.jpg"],
        ["Хоткраб з тунцем", "225 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, тунець", "images/Zapeczeni/HotkrabZTuncom.jpg"],
        ["Хоткраб з крем-сиром", "225 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, крем-сир Філадельфія", "images/Zapeczeni/HotkrabZKrem-sirom.jpg"],
        ["Хоткраб з креветками", "225 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, креветки", "images/Zapeczeni/HotkrabZKrevetkoyu.jpg"],
        ["Хоткраб з лососем", "225 грн", "210 г", "Норі, рис, огірок, гостра крабова шапочка, соус унагі, кунжут, лосось", "images/Zapeczeni/HotkrabZLososem.jpg"],
        ["Хоткраб з мідіями", "215 грн", "220 г", "Норі, рис, огірок, крабовий заміс, соус унагі", "images/Zapeczeni/HotkrabZMidiyami.jpg"],
        ["Сет Мачі макі", "445 грн", "550 г / 24 шт", "Макі з крем-сиром і чедером, макі зі смаженим лососем і чедером, макі з омлетом і чедером, макі з крабовими паличками і чедером", "images/Zapeczeni/SetMachiMaki.jpg"],
        ["Сет Такаяма фо", "810 грн", "860 г / 32 шт", "Такаяма з омлетом, Такаяма з крабовими паличками, Такаяма з крем-сиром, Такаяма з лососем", "images/Zapeczeni/SetTakayamaFo.jpg"],
    ];

    const tempuraData = [
        ["Темпура з вугрем", "225 грн", "260 г", "Норі, рис, крем-сир Філадельфія, огірок, крабові палички, кляр, паніровка панко, соус унагі", "images/Tempura/TempuraZVugrem.jpg"],
        ["Темпура з креветкою", "225 грн", "260 г", "Норі, рис, крем-сир Філадельфія, огірок, креветки, кляр, паніровка панко, соус які", "images/Tempura/TempuraZKrevetkoyu.jpg"],
        ["Темпура з лососем", "225 грн", "270 г", "Норі, рис, крем-сир Філадельфія, огірок, лосось, кляр, паніровка панко", "images/Tempura/TempuraZLososem.jpg"],
        ["Темпура з крабовими паличками", "225 грн", "270 г", "Норі, рис, крем-сир Філадельфія, огірок, крабові палички, кляр, паніровка панко, соус які", "images/Tempura/TempuraZKrabovymiPali4kami.jpg"],
        ["Сет Темпура", "830 грн", "1060 г / 32 шт", "Темпура з крабом, Темпура з вугрем, Темпура з креветкою, Темпура з лососем", "images/Tempura/SetTempura.jpg"],
    ];

    const futomakiData = [
        ["Футомакі з куркою", "195 грн", "195 г", "Норі, рис, смажене куряче філе, огірок, салат, соус унагі, соус спайсі", "images/Futomaki/FutomakiZKurkoyu.jpg"],
        ["Футомакі з креветкою", "195 грн", "185 г", "Норі, рис, креветка, огірок, салат, соус унагі, соус спайсі", "images/Futomaki/FutomakiZKrevetkoyu.jpg"],
        ["Футомакі з омлетом", "195 грн", "195 г", "Норі, рис, омлет, огірок, салат, соус унагі, соус спайсі", "images/Futomaki/FutomakiZOmletom.jpg"],
        ["Футомакі з крабовими паличками", "195 грн", "195 г", "Норі, рис, крабові палички, огірок, салат, соус унагі, соус спайсі", "images/Futomaki/FutomakiZKrabovymiPali4kami.jpg"],
        ["Футомакі з крем-сиром", "195 грн", "195 г", "Норі, рис, крем-сир, огірок, салат, соус унагі, соус спайсі", "images/Futomaki/FutomakiZKremSytom.jpg"],
        ["Сет Футомакі", "930 грн", "970 г / 40 шт", "Футомакі з креветкою, Футомакі з куркою, Футомакі з крем-сиром, Футомакі з крабом, Футомакі з лососем", "images/Futomaki/SetFutomaki.jpg"],
    ];

    const inyanData = [
        ["Рол «Інь Ян» з лососем та огірком", "125 грн", "160 г", "Норі, рис, огірок, кунжут, лосось, соус унагі", "images/Inyan/RolInYanZLososemTaOgirkom.jpg"],
        ["Рол «Інь Ян» з філадельфією та лососем", "145 грн", "180 г", "Норі, рис, лосось, крем-сир Філадельфія, соус унагі", "images/Inyan/RolInYanZFilyadelfieyuTaLososem.jpg"],
        ["Рол «Інь Ян» з філадельфією та вугрем", "145 грн", "170 г", "Норі, рис, крем-сир Філадельфія, вугор, кунжут, соус унагі", "images/Inyan/RolInYanZFilyadelfieyuTaVugrem.jpg"],
        ["Рол «Інь Ян» з тигровими креветками та філадельфією", "145 грн", "180 г", "Норі, рис, тигрові креветки, крем-сир Філадельфія, соус унагі", "images/Inyan/RolInYanZTigrovimiKrevetkamiTaFilyadelfieyu.jpg"],
    ];

    const makiData = [
        ["Макі з тунцем", "90 грн", "110 г", "Норі, рис, тунець", "images/Maki/MakiZTuncom.jpg"],
        ["Макі з мідією", "100 грн", "110 г", "Норі, рис, мідія, соус унагі", "images/Maki/MakiZMidiyeyu.jpg"],
        ["Макі з чукою", "80 грн", "100 г", "Норі, рис, чука", "images/Maki/MakiZChukoyu.jpg"],
        ["Макі з крабовими паличками", "80 грн", "110 г", "Норі, рис, крабові палички", "images/Maki/MakiZKrabovymiPali4kami.jpg"],
        ["Макі з огірком", "60 грн", "110 г", "Норі, рис, огірок, кунжут, соус унагі", "images/Maki/MakiZOgirkom.jpg"],
        ["Макі з лососем", "90 грн", "100 г", "Норі, рис, лосось", "images/Maki/MakiZLososem.jpg"],
        ["Макі з вугрем", "95 грн", "100 г", "Норі, рис, вугор, кунжут, соус унагі", "images/Maki/MakiZVugrem.jpg"],
        ["Макі з авокадо", "80 грн", "110 г", "Норі, рис, авокадо, соус унагі", "images/Maki/MakiZAvokado.jpg"],
        ["Макі зі смаженим лососем", "100 грн", "110 г", "Норі, рис, смажений лосось, соус унагі", "images/Maki/MakiZSmazhenimLososem.jpg"],
        ["Макі з крем-сиром", "85 грн", "110 г", "Норі, рис, крем-сир Філадельфія", "images/Maki/MakiZKremSytom.jpg"],
        ["Макі з омлетом", "75 грн", "110 г", "Норі, рис, омлет", "images/Maki/MakiZOmletom.jpg"],
        ["Макі з креветкою", "100 грн", "100 г", "Норі, рис, креветки, соус унагі", "images/Maki/MakiZKrevetkoyu.jpg"],
        ["Макі з манго", "85 грн", "110 г", "Норі, рис, манго, соус унагі", "images/Maki/MakiZMangoyu.jpg"],
        ["Макі з копченим лососем", "95 грн", "110 г", "Рис, норі, копчений лосось", "images/Maki/MakiZKopchenimLososem.jpg"],
    ];

    const sushiData = [
        ["Суші з лососем преміум", "75 / 200 грн", "70 / 210 г", "Рис, лосось", "images/Sushi/SushiZLososemPremium.jpg"],
        ["Суші з лососем", "55 / 150 грн", "30 / 90 г", "Рис, лосось", "images/Sushi/SushiZLososem.jpg"],
        ["Суші з вугрем", "60 / 170 грн", "30 / 90 г", "Рис, норі, вугор, соус унагі", "images/Sushi/SushiZVugrem.jpg"],
        ["Суші з тунцем", "60 / 160 грн", "40 / 120 г", "Рис, тунець", "images/Sushi/SushiZTuncom.jpg"],
    ];

    const solodkiRolyData = [
        ["Канмі манго", "170 грн", "160 г", "Рисовий папір, крем-сир, манго, топінг манго, шматочки манго", "images/SolodkiRoly/KanmiMango.jpg"],
        ["Канмі банана", "170 грн", "160 г", "Рисовий папір, крем-сир, банан, шоколадний топінг, шматочки банана", "images/SolodkiRoly/KanmiBanana.jpg"],
        ["Канмі цитрус", "170 грн", "160 г", "Рисовий папір, крем-сир, ківі, апельсин, вишневий топінг, шматочки ківі та апельсина", "images/SolodkiRoly/KanmiCitrus.jpg"],
        ["Сет Канмі", "500 грн", "480 г", "Канмі манго, Канмі банана, Канмі цитрус", "images/SolodkiRoly/SetKanmi.jpg"],
    ];

    const frityurData = [
        ["Картопля фрі середня", "80 / 150грн", "120 г", "Картопля фрі середня - 80грн", "Картопля фрі велика - 150грн", "images/Frityur/KartoplyaFri.jpg"],
        ["Нагетси", "85 / 160 грн", "6 / 12 шт", "Куряче філе в паніровці", "images/Frityur/Nagetsi.jpg"],
        ["Цибулеві кільця", "85 грн", "8 шт", "Цибуля в паніровці", "images/Frityur/CibulevieKiltsya.jpg"],
        ["Соус", "20 грн", "—", "Майонезний, сирний, тартар, кетчуп, кисло-солодкий або унагі", "images/Frityur/Soys.jpg"],
    ];

    const supyData = [
        ["Місо суп з морепродуктами", "180 грн", "—", "Місо-суп з морепродуктами", "images/Supy/MisoSupZMoreproduktami.jpg"],
    ];

    const salatyData = [
        ["Хіяші з горіховим соусом", "90 грн", "75/25 г", "Хіяші, горіховий соус", "images/Salaty/HiyashiZGorihovimSoysom.jpg"],
    ];

    
    const napoiGroups = [
        { title: "Кава", items: [
            ["Еспресо / Ристрето", "35 грн", "—", "Кава"], ["Еспресо макіато", "40 грн", "—", "Еспресо, молочна піна"], ["Еспресо лунго", "40 грн", "—", "Еспресо"], ["Допіо", "55 грн", "—", "Подвійний еспресо"], ["Американо", "45 грн", "—", "Еспресо, вода"], ["Американо з молоком", "50 грн", "—", "Еспресо, вода, молоко"], ["Латте", "55 грн", "—", "Еспресо, молоко"], ["Капучино", "55 грн", "—", "Еспресо, молоко"], ["Флет-вайт", "60 грн", "—", "Подвійний еспресо, молоко"], ["Шоколад", "60 грн", "—", "Шоколад, молоко"],
        ] },
        { title: "Холодна кава", items: [
            ["Еспресо Тонік", "85 грн", "—", "Еспресо, тонік"], ["Кофі Чері/Оранж", "90 грн", "—", "Кава, вишня / апельсин"], ["Айс Лате", "85 грн", "—", "Еспресо, молоко, лід"],
        ] },
        { title: "Bubble Tea", items: [
            ["Бабл Кохве", "85 грн", "—", "—"], ["Бабл Теа", "85 грн", "—", "—"],
        ] },
        { title: "Чай", items: [
            ["Чайник чаю", "110 грн", "—", "Зелений «Саусеп», зелений «Жасмин», трав'яний «Альпійський луг», чорний «Англійський сніданок», чорний Earl Grey"], ["Чашка чаю", "60 грн", "—", "Зелений «Саусеп», зелений «Жасмин», трав'яний «Альпійський луг», чорний «Англійський сніданок», чорний Earl Grey"], ["Фірмовий чай", "60 грн", "—", "Малина, обліпиха, імбир, смородина, глінтвейн вишневий"],
        ] },
        { title: "Лимонад", items: [
            ["Мохіто класичне", "85 грн", "—", "—"], ["Мохіто полуниця", "85 грн", "—", "—"], ["Мохіто цитрус", "85 грн", "—", "—"], ["Мохіто ківі", "85 грн", "—", "—"], ["Лимонад полуничний", "85 грн", "—", "—"], ["Лимонад Маракуя Диня", "85 грн", "—", "—"], ["Лимонад Цитрус", "85 грн", "—", "—"], ["Лимонад Ананас", "85 грн", "—", "—"], ["Лимонад Ківі", "85 грн", "—", "—"], ["Коктейль «Блакитний чил»", "85 грн", "—", "—"],
        ] },
        { title: "Напої", items: [
            ["Пепсі 1,25 л", "75 грн", "1,25 л", "Pepsi"], ["7UP 1,25 л", "75 грн", "1,25 л", "7UP"], ["Schweppes 1 л", "80 грн", "1 л", "Schweppes"], ["Пепсі 0,5 л", "45 грн", "0,5 л", "Pepsi"], ["Mirinda / 7UP 0,5 л", "45 грн", "0,5 л", "Mirinda або 7UP"], ["Пепсі з/б", "40 грн", "—", "Pepsi"], ["Моно жуйчик з/б", "40 грн", "—", "—"], ["Вода", "40 грн", "0,5 л", "Карпатська джерельна, газована / негазована"], ["Сандора", "140 грн", "0,95 л", "Яблучний, гранатовий, томатний з сіллю, виноградний, вишневий, мультивітамінний нектар, апельсиновий"], ["Сандора", "85 грн", "0,5 л", "Мультивітамінний нектар, вишневий нектар, бананово-яблучно-полуничний нектар"], ["Садочок", "80 грн", "0,5 л", "Мультифрукт, яблуко-виноград, мультивітамін"], ["Пепсі з льодом", "55 грн", "—", "Pepsi, лід"], ["Сік з льодом", "65 грн", "—", "Сік, лід"], ["Молочний коктейль", "110 грн", "—", "—"], ["Ванільний або банановий", "110 грн", "—", "Ванільний або банановий смак"],
        ] },
    ];

    const templateCards = Array.from(productsGrid?.querySelectorAll(".product-card") || []).slice(-setData.length);

    const formatWeight = (value) => `Вага: ${value}`;

    const applyProductData = (card, data) => {
        if (!card || !data) {
            return;
        }

        const [titleText, priceText, weightText, ingredients, imageSrc] = data;
        const info = card.querySelector(".product-info");
        const title = card.querySelector(".product-info h3");
        const priceRow = card.querySelector(".price-row");
        let weight = card.querySelector(".weight");
        let description = card.querySelector(".description");

        if (title) {
            title.textContent = titleText;
        }

        const price = card.querySelector(".price-row span");
        if (price) {
            price.textContent = `ЦІНА: ${priceText}`;
        }

        const image = card.querySelector(".product-image img");
        if (image && imageSrc) {
            image.src = imageSrc;
            image.alt = titleText;
            card.classList.add('has-image');
        } else {
            card.classList.remove('has-image');
        }

        if (card.dataset.weight === undefined) {
            card.dataset.weight = weightText;
        }
        if (card.dataset.ingredients === undefined) {
            card.dataset.ingredients = ingredients;
        }

        if (!info || !priceRow) {
            return;
        }

        if (!weight) {
            weight = document.createElement("p");
            weight.className = "weight";
        }

        if (!description) {
            description = document.createElement("p");
            description.className = "description";
        }

        weight.textContent = formatWeight(weightText);
        description.textContent = `Склад: ${ingredients}`;

        if (!weight.parentNode) {
            info.insertBefore(weight, priceRow);
        }

        if (!description.parentNode) {
            info.insertBefore(description, priceRow);
        }
    };

    if (productsGrid) {
        const existingCards = Array.from(productsGrid.querySelectorAll('.product-card'));

        // If the grid already contains non-set cards (e.g. filadelfiya) preserve them and append sets.
        const hasNonSet = existingCards.some(c => {
            const cats = (c.dataset.categories || '').split(/\s+/).filter(Boolean);
            return cats.length && !cats.every(s => s === 'sety');
        });

        // Choose a template: prefer the last existing card, or create a minimal template if none.
        const baseTemplate = existingCards[existingCards.length - 1] || null;

        const createEmptyCard = () => {
            const el = document.createElement('article');
            el.className = 'product-card';
            el.innerHTML = `
                <div class="product-image">
                    <img src="" alt="">
                </div>
                <div class="product-info">
                    <h3></h3>
                    <p class="weight"></p>
                    <p class="description"></p>
                    <div class="price-row">
                        <span></span>
                        <button class="product-expand" type="button" aria-expanded="false" aria-label="Розгорнути картку">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                `;
            return el;
        };

        if (!existingCards.length || !hasNonSet) {
            // No custom product cards present — replace with sets as before
            productsGrid.innerHTML = '';

            setData.forEach((data, index) => {
                const template = templateCards[index] || templateCards[0];
                const card = template ? template.cloneNode(true) : createEmptyCard();

                applyProductData(card, data);
                card.dataset.categories = 'sety';

                const button = card.querySelector('.price-row button');
                if (button) {
                    button.type = 'button';
                    button.setAttribute('aria-expanded', 'false');
                    button.setAttribute('aria-label', 'Розгорнути картку');
                }

                productsGrid.appendChild(card);
            });
        } else {
            // Preserve existing cards (including filadelfiya) and append set cards
            setData.forEach((data, index) => {
                const template = baseTemplate ? baseTemplate : null;
                const card = template ? template.cloneNode(true) : createEmptyCard();

                applyProductData(card, data);
                card.dataset.categories = 'sety';

                const button = card.querySelector('.price-row button');
                if (button) {
                    button.type = 'button';
                    button.setAttribute('aria-expanded', 'false');
                    button.setAttribute('aria-label', 'Розгорнути картку');
                }

                productsGrid.appendChild(card);
            });
        }

        const filadelfiyaTemplate = productsGrid.querySelector(".product-card");
        filadelfiyaData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "filadelfiya";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        firmoviData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "firmovi";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        kaliforniyaData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "kaliforniya";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        drakonyData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "drakony";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        bonitoData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "bonito";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        zKrevetkamiData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "z-krevetkami";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        zMidiyamiData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "z-midiyami";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        zapeczeniData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "zapeczeni";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        tempuraData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "tempura";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        futomakiData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "futomaki";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        inyanData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "inyan";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        makiData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "maki";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        sushiData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "sushi";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        solodkiRolyData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "solodki-roly";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        frityurData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "frityur";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        supyData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "supy";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        salatyData.forEach((data) => {
            const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

            applyProductData(card, data);
            card.dataset.categories = "salaty";

            const button = card.querySelector(".price-row button");
            if (button) {
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", "Розгорнути картку");
            }

            productsGrid.appendChild(card);
        });

        // Напої: показуємо підкатегорії як окремі блоки з заголовками.
        napoiGroups.forEach((group) => {
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'drink-group-title';
            groupTitle.dataset.groupCategory = 'napoi';
            groupTitle.textContent = group.title;
            productsGrid.appendChild(groupTitle);

            group.items.forEach((data) => {
                const card = filadelfiyaTemplate ? filadelfiyaTemplate.cloneNode(true) : createEmptyCard();

                applyProductData(card, data);
                card.dataset.categories = "napoi";

                const button = card.querySelector('.price-row button');
                if (button) {
                    button.type = 'button';
                    button.setAttribute('aria-expanded', 'false');
                    button.setAttribute('aria-label', 'Розгорнути картку');
                }

                productsGrid.appendChild(card);
            });
        });

    }

    const renderAdminMenuItems = async () => {
        const config = await getMenuConfig();
        const categoryList = document.querySelector(".category-list");
        const productsGrid = document.querySelector(".products-grid");

        // A migrated catalogue is managed entirely in the admin panel. Remove
        // the old hard-coded cards before drawing it, otherwise edits would
        // leave an outdated duplicate on the public menu.
        if (productsGrid && config.meta?.catalogImported === true) {
            productsGrid.innerHTML = '';
        }

        if (categoryList && Array.isArray(config.menu?.categories)) {
            const existingCategoryIds = new Set(
                Array.from(categoryList.querySelectorAll('button[data-category]')).map((button) => button.dataset.category)
            );

            config.menu.categories.forEach((category) => {
                if (!category || !category.id || existingCategoryIds.has(category.id)) {
                    return;
                }

                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.category = category.id;
                button.textContent = category.name || category.id;
                button.addEventListener('click', () => {
                    applyCategory(button.dataset.category || 'sety');
                });
                categoryList.appendChild(button);
                existingCategoryIds.add(category.id);
            });

            reorderCategoryButtons(config);
        }

        if (productsGrid && Array.isArray(config.menu?.items)) {
            const existingProductKeys = new Set(
                Array.from(productsGrid.querySelectorAll('.product-card')).map((card) => {
                    const title = card.querySelector('.product-info h3')?.textContent?.trim() || '';
                    const category = card.dataset.categories || 'custom';
                    return card.dataset.productKey || `${title}:${category}`;
                })
            );

            config.menu.items.forEach((item) => {
                if (!item) {
                    return;
                }

                const key = `${item.id || item.title || ''}:${item.category || 'custom'}`;
                if (existingProductKeys.has(key)) {
                    return;
                }

                const card = document.createElement('article');
                card.className = `product-card${item.image ? ' has-image' : ''}`;
                card.dataset.categories = item.category || 'custom';
                card.dataset.adminItem = 'true';
                card.dataset.productKey = key;
                card.dataset.weight = item.weight || '—';
                card.dataset.ingredients = item.ingredients || '';
                card.innerHTML = `
                    <div class="product-image">
                        <img src="${item.image || ''}" alt="${item.title || 'Товар'}">
                    </div>
                    <div class="product-info">
                        <h3>${item.title || 'Товар'}</h3>
                        <p class="weight">Вага: ${item.weight || '—'}</p>
                        <p class="description">Склад: ${item.ingredients || '—'}</p>
                        <div class="price-row">
                            <span>ЦІНА: ${item.price || '0 грн'}</span>
                            <button class="product-expand" type="button" aria-expanded="false" aria-label="Розгорнути картку">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                `;
                productsGrid.appendChild(card);
                existingProductKeys.add(key);
            });
        }
    };

    const buttons = Array.from(document.querySelectorAll(".category-list button[data-category]"));
    const cards = Array.from(document.querySelectorAll(".products-grid .product-card"));
    const drinkGroupTitles = Array.from(document.querySelectorAll('.drink-group-title'));

    const inferCategorySlug = (text) => {
        if (!text) return null;
        const t = text.toLowerCase();

        if (t.includes('філад')) return 'filadelfiya';
        if (t.includes('фірм') || t.includes('фiрм')) return 'firmovi';
        if (t.includes('каліф') || t.includes('калiф') || t.includes('кал')) return 'kaliforniya';
        if (t.includes('дракон')) return 'drakony';
        if (t.includes('боніто') || t.includes('bonito')) return 'bonito';
        if (t.includes('кревет')) return 'z-krevetkami';
        if (t.includes('мід') || t.includes('міді') || t.includes('мид')) return 'z-midiyami';
        if (t.includes('запеч')) return 'zapeczeni';
        if (t.includes('темпура')) return 'tempura';
        if (t.includes('футом') || t.includes('футомак')) return 'futomaki';
        if (t.includes('інь') || t.includes('инь')) return 'inyan';
        if (t.includes('макі') || t.includes('маки')) return 'maki';
        if (t.includes('суші') || t.includes('суш')) return 'sushi';
        if (t.includes('солод')) return 'solodki-roly';
        if (t.includes('фрит') || t.includes('фритю')) return 'frityur';
        if (t.includes('бургер')) return 'burgeri';
        if (t.includes('суп')) return 'supy';
        if (t.includes('салат')) return 'salaty';
        if (t.includes('сет') || t.includes('сети')) return 'sety';

        return null;
    };

    const getCart = () => {
        try {
            return JSON.parse(localStorage.getItem("sushiHomeCart") || "[]");
        } catch (error) {
            return [];
        }
    };

    const saveCart = (items) => {
        localStorage.setItem("sushiHomeCart", JSON.stringify(items));
    };

    const addProductToCart = (card) => {
        const title = card.querySelector(".product-info h3")?.textContent?.trim() || "Товар";
        const priceText = card.querySelector(".price-row span")?.textContent?.trim() || "0 грн";
        const weightText = card.querySelector(".weight")?.textContent?.trim() || "—";
        const descriptionText = card.querySelector(".description")?.textContent?.replace(/^Склад:\s*/i, "").trim() || "";
        const imageSrc = card.querySelector(".product-image img")?.src || "";

        const cart = getCart();
        const itemIndex = cart.findIndex((item) => item.title === title && item.priceText === priceText);

        if (itemIndex >= 0) {
            cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + 1;
        } else {
            cart.push({
                title,
                priceText,
                weightText,
                description: descriptionText,
                image: imageSrc,
                quantity: 1,
            });
        }

        saveCart(cart);
    };

    const modalCartButton = modal?.querySelector(".product-modal__cart");
    let activeProductCard = null;

    const openModal = (card) => {
        if (!modal || !modalImage || !modalTitle || !modalPrice || !modalWeight || !modalDescription) {
            return;
        }

        const image = card.querySelector(".product-image img");
        const title = card.querySelector(".product-info h3");
        const price = card.querySelector(".price-row span");
        const weightEl = card.querySelector(".weight");
        const descriptionEl = card.querySelector(".description, .ingredients");

        const explicitWeight = card.dataset.weight || weightEl?.textContent?.trim() || "";
        const explicitIngredients = card.dataset.ingredients || descriptionEl?.textContent?.trim() || "";

        let weightText = explicitWeight ? ` ${explicitWeight.trim()}` : ":";
        const descText = explicitIngredients ? ` ${explicitIngredients.trim()}` : "Склад: норі, рис, кунжут, крем сир філадельфія, лосось";

        modalImage.src = image?.src || "";
        modalImage.alt = image?.alt || "";
        modalTitle.textContent = title?.textContent.trim() || "";
        modalPrice.textContent = price?.textContent.trim() || "";
        modalWeight.textContent = weightText;
        modalDescription.textContent = descText;
        activeProductCard = card;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };

    const closeModal = () => {
        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        activeProductCard = null;
    };

    cards.forEach((card) => {
        // Preserve existing data-categories when present; otherwise try to infer from title/alt text
        const existing = (card.dataset.categories || '').trim();
        if (!existing) {
            const titleEl = card.querySelector('.product-info h3');
            const imgAlt = card.querySelector('.product-image img')?.alt || '';
            const titleText = `${titleEl?.textContent || ''} ${imgAlt}`.trim();
            const inferred = inferCategorySlug(titleText);
            card.dataset.categories = inferred || 'sety';
        }

        const expandButton = card.querySelector(".product-expand");
        if (expandButton) {
            expandButton.type = "button";
            expandButton.setAttribute("aria-expanded", "false");
            expandButton.setAttribute("aria-label", "Розгорнути картку");
        }
    });

    const setActive = (activeCategory) => {
        const liveButtons = Array.from(document.querySelectorAll(".category-list button[data-category]"));
        liveButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.category === activeCategory);
        });
    };

    const filterCards = (category) => {
        const currentCards = Array.from(document.querySelectorAll('.products-grid .product-card'));
        currentCards.forEach((card) => {
            const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
            card.classList.toggle("is-hidden", !(categories.includes(category)));
            card.classList.remove("expanded");

            const button = card.querySelector(".price-row button");
            if (button) {
                button.setAttribute("aria-expanded", "false");
            }
        });

        const liveGroupTitles = Array.from(document.querySelectorAll('.drink-group-title'));
        liveGroupTitles.forEach((title) => {
            const shouldShow = title.dataset.groupCategory === category;
            title.classList.toggle('is-hidden', !shouldShow);
        });
    };

    const applyCategory = (category) => {
        filterCards(category);
        setActive(category);
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            applyCategory(button.dataset.category || "novinki");
        });
    });

    renderAdminMenuItems().then(() => {
        const liveButtons = Array.from(document.querySelectorAll(".category-list button[data-category]"));
        liveButtons.forEach((button) => {
            if (button.dataset.bound === "true") {
                return;
            }
            button.dataset.bound = "true";
            button.addEventListener("click", () => {
                applyCategory(button.dataset.category || "novinki");
            });
        });

        const initialCategory = document.querySelector(".category-list button.active")?.dataset.category || liveButtons[0]?.dataset.category || "sety";
        applyCategory(initialCategory);
    });

    // Use event delegation for product card buttons so listeners work even if cards are added later
    productsGrid?.addEventListener('click', (event) => {
        const expandBtn = event.target.closest('.product-expand');
        if (!expandBtn) return;
        const card = expandBtn.closest('.product-card');
        if (!card) return;
        event.preventDefault();
        event.stopPropagation();
        openModal(card);
    });

    modalCartButton?.addEventListener('click', () => {
        if (!activeProductCard) return;
        addProductToCart(activeProductCard);
        closeModal();
    });

    if (!buttons.length || !cards.length) {
        return;
    }

    modalCloseButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
            closeModal();
        }
    });

    applyCategory(document.querySelector(".category-list button.active")?.dataset.category || "sety");
});
