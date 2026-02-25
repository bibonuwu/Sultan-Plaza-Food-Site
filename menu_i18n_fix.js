/*!
 * menu_i18n_fix.js
 * Исправление переводов меню (RU / KZ / EN) для категорий и позиций.
 * Использование:
 *   const { categories, items } = fixMenuTranslations(rawCategories, menuItems);
 *
 * Что делает:
 * - Полностью нормализует переводы категорий (ручные корректные значения).
 * - Для позиций:
 *   - сохраняет ru как исходный
 *   - генерирует/исправляет kz и en по словарям и правилам
 *   - сохраняет бренды и латиницу
 *   - переводит частые кулинарные термины и ингредиенты в названиях и описаниях
 *
 * Важно:
 * - Это качественная автоматическая нормализация, но для ресторанного меню рекомендуется финальная вычитка носителем (особенно KZ).
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.fixMenuTranslations = factory().fixMenuTranslations;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CATEGORY_MAP = {
    "all": { ru: "Все", kz: "Барлығы", en: "All" },
    "cold": { ru: "Холодные закуски", kz: "Суық тіскебасарлар", en: "Cold appetizers" },
    "hot-app": { ru: "Горячие закуски", kz: "Ыстық тіскебасарлар", en: "Hot appetizers" },
    "beer": { ru: "Пивные сеты", kz: "Сыра сеттері", en: "Beer sets" },
    "salads": { ru: "Салаты", kz: "Салаттар", en: "Salads" },
    "warm-salads": { ru: "Тёплые салаты", kz: "Жылы салаттар", en: "Warm salads" },
    "soups": { ru: "Супы", kz: "Сорпалар", en: "Soups" },
    "pasta": { ru: "Пасты", kz: "Паста", en: "Pasta" },
    "korean": { ru: "Корейская кухня", kz: "Кәріс асханасы", en: "Korean cuisine" },
    "k-salads": { ru: "Корейские салаты", kz: "Кәріс салаттары", en: "Korean salads" },
    "grill-meat": { ru: "Гриль-блюда из мяса", kz: "Еттен гриль тағамдары", en: "Grilled meat dishes" },
    "grill-fish": { ru: "Гриль-блюда из рыбы", kz: "Балықтан гриль тағамдары", en: "Grilled fish dishes" },
    "hot-main": { ru: "Горячие блюда", kz: "Ыстық тағамдар", en: "Main hot dishes" },
    "bird": { ru: "Блюда из птицы", kz: "Құс етінен тағамдар", en: "Poultry dishes" },
    "pizza": { ru: "Пицца", kz: "Пицца", en: "Pizza" },
    "burgers": { ru: "Бургеры", kz: "Бургерлер", en: "Burgers" },
    "kids": { ru: "Детское меню", kz: "Балалар мәзірі", en: "Kids menu" },
    "breakfast": { ru: "Завтраки", kz: "Таңғы ас", en: "Breakfast" },
    "preorder": { ru: "Блюда на заказ", kz: "Алдын ала тапсырыс тағамдары", en: "Pre-order dishes" },
    "sides": { ru: "Гарниры", kz: "Гарнирлер", en: "Sides" },
    "desserts": { ru: "Десерты", kz: "Десерттер", en: "Desserts" },
    "bread": { ru: "Хлебные изделия", kz: "Нан өнімдері", en: "Bakery" },
    "bar-drinks": { ru: "Напитки", kz: "Сусындар", en: "Drinks" },
    "bar-water": { ru: "Вода", kz: "Су", en: "Water" },
    "bar-teas": { ru: "Элитные чаи (1 л)", kz: "Премиум шайлар (1 л)", en: "Premium teas (1 L)" },
    "bar-auth-teas": { ru: "Авторские чаи (1 л)", kz: "Авторлық шайлар (1 л)", en: "Signature teas (1 L)" },
    "bar-tea-addons": { ru: "К чаю", kz: "Шайға қосымша", en: "Tea add-ons" },
    "bar-alc-cocktails": { ru: "Алкогольные коктейли", kz: "Алкогольді коктейльдер", en: "Alcoholic cocktails" },
    "bar-cigarettes": { ru: "Сигареты", kz: "Темекі", en: "Cigarettes" },
    "bar-nonalc-cocktails": { ru: "Безалкогольные коктейли", kz: "Алкогольсіз коктейльдер", en: "Non-alcoholic cocktails" },
    "bar-lemonades": { ru: "Лимонады", kz: "Лимонадтар", en: "Lemonades" },
    "bar-fresh": { ru: "Фреш 0.33", kz: "Фреш 0.33", en: "Fresh juice 0.33" },
    "bar-coffee": { ru: "Кофе", kz: "Кофе", en: "Coffee" },
    "bar-liquers": { ru: "Настойки и ликёры (50 мл)", kz: "Тұнбалар мен ликерлер (50 мл)", en: "Infusions & liqueurs (50 ml)" },
    "bar-cognac-fr": { ru: "Французский коньяк (50 мл)", kz: "Француз коньягі (50 мл)", en: "French cognac (50 ml)" },
    "bar-cognac-am": { ru: "Армянский коньяк (50 мл)", kz: "Армян брендиі (50 мл)", en: "Armenian brandy (50 ml)" },
    "bar-cognac-kz": { ru: "Казахстанский коньяк (50 мл)", kz: "Қазақстандық коньяк (50 мл)", en: "Kazakhstani cognac (50 ml)" },
    "bar-beer-bottled": { ru: "Бутылочное пиво", kz: "Бөтелкедегі сыра", en: "Bottled beer" },
    "bar-beer-draft": { ru: "Разливное пиво (0.5)", kz: "Құйма сыра (0.5)", en: "Draft beer (0.5)" },
    "bar-beer-snacks": { ru: "К пиву", kz: "Сыраға", en: "Beer snacks" },
    "bar-vodka": { ru: "Водка (50 мл)", kz: "Арақ (50 мл)", en: "Vodka (50 ml)" },
    "bar-white-wine-1": { ru: "Белые вина (Португалия/Испания/Новая Зеландия)", kz: "Ақ шараптар (Португалия/Испания/Жаңа Зеландия)", en: "White wines (Portugal/Spain/New Zealand)" },
    "bar-scotch": { ru: "Шотландский виски (50 мл)", kz: "Шотланд вискиі (50 мл)", en: "Scotch whisky (50 ml)" },
    "bar-single-malt": { ru: "Односолодовый виски (50 мл)", kz: "Бір уытты виски (50 мл)", en: "Single malt whisky (50 ml)" },
    "bar-jameson": { ru: "Jameson Family (50 мл)", kz: "Jameson топтамасы (50 мл)", en: "Jameson family (50 ml)" },
    "bar-bourbon": { ru: "Бурбон (50 мл)", kz: "Бурбон (50 мл)", en: "Bourbon (50 ml)" },
    "bar-red-wine-1": { ru: "Красные вина (Грузия/Франция/Чили/Австрия/Италия)", kz: "Қызыл шараптар (Грузия/Франция/Чили/Австрия/Италия)", en: "Red wines (Georgia/France/Chile/Austria/Italy)" },
    "bar-white-wine-2": { ru: "Белые вина (Грузия/Франция/Чили/Австрия/Италия)", kz: "Ақ шараптар (Грузия/Франция/Чили/Австрия/Италия)", en: "White wines (Georgia/France/Chile/Austria/Italy)" },
    "bar-red-wine-2": { ru: "Красные вина (Португалия/Испания/Новая Зеландия)", kz: "Қызыл шараптар (Португалия/Испания/Жаңа Зеландия)", en: "Red wines (Portugal/Spain/New Zealand)" },
    "bar-aperitifs": { ru: "Аперитивы (100 мл)", kz: "Аперитивтер (100 мл)", en: "Aperitifs (100 ml)" },
    "bar-sparkling": { ru: "Игристые вина (0.75 л)", kz: "Игристі шараптар (0.75 л)", en: "Sparkling wines (0.75 L)" },
    "bar-tequila": { ru: "Текила (50 мл)", kz: "Текила (50 мл)", en: "Tequila (50 ml)" },
    "bar-gin": { ru: "Джин (50 мл)", kz: "Джин (50 мл)", en: "Gin (50 ml)" },
    "bar-rum": { ru: "Кубинский ром (50 мл)", kz: "Кубалық ром (50 мл)", en: "Cuban rum (50 ml)" }
  };

  // Частые ручные исправления (точнее словарных правил)
  const EXACT_NAME_EN = {
    "Мясное плато": "Meat platter",
    "Рыбное плато": "Fish platter",
    "Кавказская закуска": "Caucasian appetizer",
    "Ассорти соленья": "Pickle assortment",
    "Рулетики из кабачков": "Zucchini rolls",
    "Сырное ассорти": "Cheese platter",
    "Фруктовая нарезка маленькая": "Small fruit platter",
    "Фруктовая нарезка на зеркале (средняя)": "Fruit platter on mirror tray (medium)",
    "Фруктовая нарезка на зеркале (большая)": "Fruit platter on mirror tray (large)",
    "Королевские креветки": "King prawns",
    "Острые куриные крылышки BBQ": "Spicy BBQ chicken wings",
    "Спринг роллы с курицей": "Chicken spring rolls",
    "Спринг роллы с креветками острый": "Spicy shrimp spring rolls",
    "Тортилья с курицей и сыром": "Chicken and cheese tortilla",
    "Пивной сеты № 1": "Beer set No. 1",
    "Пивной сеты № 2": "Beer set No. 2",
    "Легкий салат свеклой и козьим сыром": "Light salad with beetroot and goat cheese",
    "Салат с угрем в кисло-сладком соусе": "Eel salad in sweet-and-sour sauce",
    "Свежий салат": "Fresh salad",
    "Греческий салат с сыром «Фета»": "Greek salad with feta cheese",
    "Цезарь с курицей": "Caesar salad with chicken",
    "Цезарь с креветками": "Caesar salad with shrimp",
    "Салат с семгой и сыром «Креметта»": "Salmon salad with Cremette cheese",
    "Тёплый салат с ростбифом": "Warm roast beef salad",
    "Салат «Пиканте» с рукколой": "Picante salad with arugula",
    "Баклажаны в кляре": "Battered eggplant",
    "Тёплый салат с баклажаном и мясом": "Warm salad with eggplant and meat",
    "Шёлковый путь": "Silk Road",
    "Салат с языком и картофелем пай": "Tongue salad with shoestring potatoes",
    "Филе утки с карамелизированной грушей": "Duck fillet with caramelized pear",
    "Салат WALL STREET": "WALL STREET salad",
    "Национальный суп": "Traditional soup",
    "Суп лапша с курицей": "Chicken noodle soup",
    "Суп чечевичный": "Lentil soup",
    "Тыквенный суп в азиатском стиле с креветками": "Asian-style pumpkin soup with shrimp",
    "Пельмени с бульоном по-домашнему": "Homestyle dumplings in broth",
    "Минестроне со шпинатом и нутом": "Minestrone with spinach and chickpeas",
    "Минестроне с перепелкой": "Minestrone with quail",
    "Суп с телятиной": "Veal soup",
    "Борщ": "Borscht",
    "Суп с фасолью (острый)": "Spicy bean soup",
    "Уха из красной рыбы": "Fish soup from red fish",
    "Азиатский острый суп с лапшой": "Spicy Asian noodle soup",
    "Фетучини с курицей": "Fettuccine with chicken",
    "Фетучини с креветками": "Fettuccine with shrimp",
    "Карбонара из говядины": "Beef carbonara",
    "Фарфалле с семгой": "Farfalle with salmon",
    "Лазанья": "Lasagna",
    "Паста Алио и олио": "Aglio e olio pasta",
    "Спагетти «Болоньезе»": "Spaghetti Bolognese",
    "Том-ям": "Tom Yum",
    "Рамен с говядиной": "Beef ramen",
    "Рамен с курицей": "Chicken ramen",
    "Хе из баранины": "Lamb hye",
    "Хе из требухи": "Tripe hye",
    "Хе из рыбы": "Fish hye",
    "Пеппер стейк с картофелем по-деревенски": "Pepper steak with rustic potatoes",
    "Стейк Рибай на косточке «Тиано»": "Bone-in ribeye steak “Tiano”",
    "Медальоны с картофельным пюре и соусом «Demi-glace»": "Medallions with mashed potatoes and demi-glace sauce",
    "Овощной рулет с телятиной": "Vegetable roll with veal",
    "Семга с фруктовым салатом": "Salmon with fruit salad",
    "Дорадо на гриле": "Grilled dorado",
    "Судак под польским соусом с фрэш салатом": "Zander with Polish sauce and fresh salad",
    "Филе форели с кабачками и соусом «Биск»": "Trout fillet with zucchini and bisque sauce",
    "Сибас на гриле с цветной капустой": "Grilled sea bass with cauliflower",
    "Сибас с креветками и сыром фета": "Sea bass with shrimp and feta cheese",
    "Мясо по-Строгановски с рисом": "Beef Stroganoff with rice",
    "Телятина с овощами и пюре": "Veal with vegetables and mashed potatoes",
    "Бон филе со свеклой": "Beef tenderloin with beetroot",
    "Филе «Миньон» с овощами «Тиано»": "Filet mignon with “Tiano” vegetables",
    "Куриная грудка в сливовом соусе с брокколи": "Chicken breast in plum sauce with broccoli",
    "Цыплёнок с пюре и зелёным луком": "Chicken with mashed potatoes and green onion",
    "Кордон блю": "Cordon bleu",
    "Курица терияки с рисом": "Teriyaki chicken with rice",
    "Курица карри с овощами и рисом": "Chicken curry with vegetables and rice",
    "Жульен с курицей и грибами": "Chicken and mushroom julienne",
    "Пицца грибная": "Mushroom pizza",
    "Пицца ассорти": "Assorted pizza",
    "Шеф бургер": "Chef burger",
    "Веган бургер": "Vegan burger",
    "Наггетсы": "Nuggets",
    "Сырные палочки": "Cheese sticks",
    "Котлеты с пюре": "Cutlets with mashed potatoes",
    "Омлет с сыром": "Cheese omelet",
    "Омлет с овощами": "Vegetable omelet",
    "Клаб-сэндвич с курицей": "Chicken club sandwich",
    "Шакшука": "Shakshuka",
    "Солнечный день": "Sunny Day",
    "Ет тамак": "Et tamak",
    "Сый табак": "Sıy tabaq",
    "Королевская доска": "Royal board",
    "Царское мясо": "Royal meat",
    "Сет из рыбных стейков": "Fish steak set",
    "Праздничный плов из 4-х видов масла": "Festive pilaf with 4 types of oil",
    "Куырдак из баранины": "Lamb kuyrdak",
    "Сазан жареный целиком": "Whole fried carp",
    "Фри": "French fries",
    "Жареный картофель с грибами": "Fried potatoes with mushrooms",
    "Овощи на гриле": "Grilled vegetables",
    "Брокколи в кляре": "Battered broccoli",
    "Цветная капуста в кляре": "Battered cauliflower",
    "Картофель по-деревенски": "Rustic potatoes",
    "Рис": "Rice",
    "Круассаны в ассортименте": "Assorted croissants",
    "Чизкейк испанский": "Spanish cheesecake",
    "Медовик": "Honey cake",
    "Маффин": "Muffin",
    "Казахские сладости": "Kazakh sweets",
    "Восточные сладости": "Eastern sweets",
    "Хлебная корзина": "Bread basket",
    "Белый хлеб": "White bread",
    "Бородинский хлеб (чёрный хлеб)": "Borodinsky bread (dark bread)",
    "Чесночный хлеб": "Garlic bread",
    "Луковый хлеб": "Onion bread",
    "Баурсаки (предварительный заказ)": "Baursaks (pre-order)",
    "Самса из говядины (5 штук)": "Beef samsa (5 pcs)",
    "Чебуреки (5 штук)": "Chebureki (5 pcs)",
    "Пирожки с сёмгой (5 штук)": "Salmon pies (5 pcs)",
    "Пирожки с капустой (5 штук)": "Cabbage pies (5 pcs)",
    "Соки Gracio (ассорт.)": "Gracio juices (assorted)",
    "Ascania Лимонад": "Ascania lemonade",
    "Японская липа": "Japanese linden",
    "Дикий фрукт": "Wild fruit",
    "Зелёная сенча": "Green sencha",
    "Клубника со сливками": "Strawberries & cream",
    "Земляника со сливками": "Wild strawberries & cream",
    "Карамель со сливками": "Caramel & cream",
    "Манговый чай": "Mango tea",
    "Ройбуш Ревень-ягода": "Rooibos Rhubarb-Berry",
    "Синий барбарис": "Blue barberry",
    "Марокканский": "Moroccan tea",
    "Простудный": "Cold relief tea",
    "Облепиховый": "Sea buckthorn tea",
    "Цитрусовый": "Citrus tea",
    "Фруктовый": "Fruit tea",
    "Ягодный": "Berry tea",
    "Манго-маракуйя": "Mango-passion fruit tea",
    "Ташкентский": "Tashkent tea",
    "Лимон": "Lemon",
    "Мёд": "Honey",
    "Молоко": "Milk",
    "Лайм": "Lime",
    "Зажигалка": "Lighter",
    "Экзотика": "Exotica",
    "Молочные (ассорт.)": "Milk shakes (assorted)",
    "Немецкое": "German draft beer",
    "Чипсы Pringles": "Pringles chips",
    "Фисташки": "Pistachios",
    "Арахис": "Peanuts"
  };

  const EXACT_NAME_KZ = {
    "Мясное плато": "Ет платосы",
    "Рыбное плато": "Балық платосы",
    "Кавказская закуска": "Кавказша тіскебасар",
    "Ассорти соленья": "Тұздалған тағамдар ассортиі",
    "Рулетики из кабачков": "Кабачок рулетиктері",
    "Сырное ассорти": "Ірімшік ассортиі",
    "Фруктовая нарезка маленькая": "Жеміс турамасы (кіші)",
    "Фруктовая нарезка на зеркале (средняя)": "Айна табақтағы жеміс турамасы (орташа)",
    "Фруктовая нарезка на зеркале (большая)": "Айна табақтағы жеміс турамасы (үлкен)",
    "Королевские креветки": "Корольдік асшаяндар",
    "Острые куриные крылышки BBQ": "Ащы BBQ тауық қанаттары",
    "Спринг роллы с курицей": "Тауық еті бар спринг-роллдар",
    "Спринг роллы с креветками острый": "Ащы асшаянды спринг-роллдар",
    "Тортилья с курицей и сыром": "Тауық пен ірімшік қосылған тортилья",
    "Пивной сеты № 1": "Сыра сеты №1",
    "Пивной сеты № 2": "Сыра сеты №2",
    "Легкий салат свеклой и козьим сыром": "Қызылша мен ешкі ірімшігі қосылған жеңіл салат",
    "Салат с угрем в кисло-сладком соусе": "Тәтті-қышқыл тұздықтағы жыланбалық салаты",
    "Свежий салат": "Жаңа салат",
    "Греческий салат с сыром «Фета»": "«Фета» ірімшігі қосылған грек салаты",
    "Цезарь с курицей": "Тауық еті қосылған Цезарь",
    "Цезарь с креветками": "Асшаян қосылған Цезарь",
    "Тёплый салат с ростбифом": "Ростбиф қосылған жылы салат",
    "Баклажаны в кляре": "Клярдағы баялды",
    "Национальный суп": "Ұлттық сорпа",
    "Суп лапша с курицей": "Тауық еті бар кеспе сорпа",
    "Суп чечевичный": "Жасымық сорпасы",
    "Борщ": "Борщ",
    "Фетучини с курицей": "Тауық еті қосылған фетучини",
    "Фетучини с креветками": "Асшаян қосылған фетучини",
    "Лазанья": "Лазанья",
    "Спагетти «Болоньезе»": "«Болоньезе» спагеттиі",
    "Том-ям": "Том-ям",
    "Рамен с говядиной": "Сиыр еті бар рамен",
    "Рамен с курицей": "Тауық еті бар рамен",
    "Дорадо на гриле": "Грильдегі дорада",
    "Сибас на гриле с цветной капустой": "Түсті қырыққабатпен грильдегі сибас",
    "Мясо по-Строгановски с рисом": "Күрішпен Строгановша ет",
    "Курица терияки с рисом": "Күрішпен терияки тауық",
    "Жульен с курицей и грибами": "Тауық пен саңырауқұлақ қосылған жульен",
    "Пицца грибная": "Саңырауқұлақты пицца",
    "Пицца ассорти": "Ассорти пицца",
    "Шеф бургер": "Шеф-бургер",
    "Веган бургер": "Веган бургер",
    "Наггетсы": "Наггетстер",
    "Сырные палочки": "Ірімшік таяқшалары",
    "Омлет с сыром": "Ірімшік қосылған омлет",
    "Омлет с овощами": "Көкөніс қосылған омлет",
    "Клаб-сэндвич с курицей": "Тауық еті бар клаб-сэндвич",
    "Шакшука": "Шакшука",
    "Солнечный день": "Күн шуақты күн",
    "Казахские сладости": "Қазақтың тәттілері",
    "Восточные сладости": "Шығыс тәттілері",
    "Хлебная корзина": "Нан себеті",
    "Белый хлеб": "Ақ нан",
    "Чесночный хлеб": "Сарымсақты нан",
    "Луковый хлеб": "Пиязды нан",
    "Баурсаки (предварительный заказ)": "Баурсақ (алдын ала тапсырыс)",
    "Лимон": "Лимон",
    "Мёд": "Бал",
    "Молоко": "Сүт",
    "Лайм": "Лайм",
    "Зажигалка": "Шақпақ",
    "Фисташки": "Пісте",
    "Арахис": "Жержаңғақ",
    "Чечил": "Чечил"
  };

  const EXACT_DESC_EN = {
    "жая, казы, язык": "zhaya, kazy, tongue",
    "копченый лосось, масляная рыба эсколар, угорь": "smoked salmon, escolar (butterfish), eel",
    "Хрустящие куриные крылышки в соусе из лайма и чили": "Crispy chicken wings in lime and chili sauce",
    "рыба с овощами и чесночными гренками": "fish with vegetables and garlic croutons",
    "яичница-глазунья и сосиски": "fried eggs and sausages"
  };

  const EXACT_DESC_KZ = {
    "жая, казы, язык": "жая, қазы, тіл",
    "копченый лосось, масляная рыба эсколар, угорь": "ысталған албырт, эсколар (майлы балық), жыланбалық",
    "Хрустящие куриные крылышки в соусе из лайма и чили": "лайм мен чили тұздығындағы қытырлақ тауық қанаттары",
    "рыба с овощами и чесночными гренками": "көкөністер мен сарымсақты гренкі қосылған балық",
    "яичница-глазунья и сосиски": "қуырылған жұмыртқа мен сосискалар"
  };

  // Общие фразовые замены (порядок важен: длинные сначала)
  const PHRASES_EN = [
    ["по-деревенски", "rustic style"],
    ["на гриле", "grilled"],
    ["в кляре", "in batter"],
    ["с креветками", "with shrimp"],
    ["с курицей", "with chicken"],
    ["с говядиной", "with beef"],
    ["с телятиной", "with veal"],
    ["с бараниной", "with lamb"],
    ["с овощами", "with vegetables"],
    ["с рисом", "with rice"],
    ["с пюре", "with mashed potatoes"],
    ["с брокколи", "with broccoli"],
    ["с грибами", "with mushrooms"],
    ["с сыром", "with cheese"],
    ["острый", "spicy"],
    ["острая", "spicy"],
    ["острые", "spicy"],
    ["предварительный заказ", "pre-order"],
    ["(ассорт.)", "(assorted)"],
    ["(сух.)", "(dry)"],
    ["(полусух.)", "(semi-dry)"],
    ["(полуслад.)", "(semi-sweet)"],
    ["(полусл.)", "(semi-sweet)"],
    ["штук", "pcs"],
    ["мл", "ml"],
    ["л", "L"]
  ];

  const PHRASES_KZ = [
    ["по-деревенски", "ауылша"],
    ["на гриле", "грильде"],
    ["в кляре", "клярда"],
    ["с креветками", "асшаянмен"],
    ["с курицей", "тауық етімен"],
    ["с говядиной", "сиыр етімен"],
    ["с телятиной", "бұзау етімен"],
    ["с бараниной", "қой етімен"],
    ["с овощами", "көкөніспен"],
    ["с рисом", "күрішпен"],
    ["с пюре", "езбемен"],
    ["с брокколи", "брокколимен"],
    ["с грибами", "саңырауқұлақпен"],
    ["с сыром", "ірімшікпен"],
    ["острый", "ащы"],
    ["острая", "ащы"],
    ["острые", "ащы"],
    ["предварительный заказ", "алдын ала тапсырыс"],
    ["(ассорт.)", "(ассорт.)"],
    ["(сух.)", "(құрғақ)"],
    ["(полусух.)", "(жартылай құрғақ)"],
    ["(полуслад.)", "(жартылай тәтті)"],
    ["(полусл.)", "(жартылай тәтті)"],
    ["штук", "дана"],
    ["мл", "мл"],
    ["л", "л"]
  ];

  // Словари ингредиентов / терминов (для названий и описаний)
  const WORDS_EN = makeWordMap({
    "креветки": "shrimp",
    "креветка": "shrimp",
    "курица": "chicken",
    "куриный": "chicken",
    "куриная": "chicken",
    "куриные": "chicken",
    "куриное": "chicken",
    "говядина": "beef",
    "говяжий": "beef",
    "баранина": "lamb",
    "телятина": "veal",
    "утка": "duck",
    "утиная": "duck",
    "семга": "salmon",
    "сёмга": "salmon",
    "форель": "trout",
    "судак": "zander",
    "сибас": "sea bass",
    "дорадо": "dorado",
    "угорь": "eel",
    "язык": "tongue",
    "рыба": "fish",
    "мясо": "meat",
    "филе": "fillet",
    "вырезка": "tenderloin",
    "бон филе": "beef tenderloin",
    "ростбиф": "roast beef",
    "медальоны": "medallions",
    "стейк": "steak",
    "салат": "salad",
    "салаты": "salads",
    "суп": "soup",
    "супы": "soups",
    "лапша": "noodles",
    "паста": "pasta",
    "пицца": "pizza",
    "бургер": "burger",
    "омлет": "omelet",
    "крылышки": "wings",
    "роллы": "rolls",
    "рулет": "roll",
    "рулетики": "rolls",
    "тортилья": "tortilla",
    "плато": "platter",
    "ассорти": "assortment",
    "закуска": "appetizer",
    "гарнир": "side",
    "десерт": "dessert",
    "десерты": "desserts",
    "чай": "tea",
    "кофе": "coffee",
    "лимонад": "lemonade",
    "сок": "juice",
    "соки": "juices",
    "вода": "water",
    "молоко": "milk",
    "мёд": "honey",
    "лимон": "lemon",
    "лайм": "lime",
    "рис": "rice",
    "пюре": "mashed potatoes",
    "картофель": "potatoes",
    "фри": "fries",
    "овощи": "vegetables",
    "огурцы": "cucumbers",
    "огурец": "cucumber",
    "помидоры": "tomatoes",
    "помидор": "tomato",
    "черри": "cherry tomatoes",
    "перец": "pepper",
    "лук": "onion",
    "чеснок": "garlic",
    "морковь": "carrot",
    "свекла": "beetroot",
    "свёкла": "beetroot",
    "капуста": "cabbage",
    "пекинская капуста": "Chinese cabbage",
    "брокколи": "broccoli",
    "шампиньоны": "mushrooms",
    "шампиньон": "mushroom",
    "авокадо": "avocado",
    "руккола": "arugula",
    "зелень": "greens",
    "микс": "mix",
    "айсберг": "iceberg lettuce",
    "яйцо": "egg",
    "яйца": "eggs",
    "сыр": "cheese",
    "фета": "feta",
    "фетакса": "fetaxa",
    "моцарелла": "mozzarella",
    "пармезан": "parmesan",
    "сливки": "cream",
    "сливочный": "creamy",
    "соус": "sauce",
    "соусы": "sauces",
    "острый": "spicy",
    "кисло-сладком": "sweet-and-sour",
    "домашняя": "homemade",
    "домашний": "homemade",
    "жареный": "fried",
    "жареная": "fried",
    "жареное": "fried",
    "жареные": "fried",
    "копченый": "smoked",
    "малосольная": "lightly salted",
    "маринованные": "marinated",
    "маринованный": "marinated",
    "квашеная": "fermented",
    "свежие": "fresh",
    "свежий": "fresh",
    "свежая": "fresh",
    "фруктовый": "fruit",
    "фруктовая": "fruit",
    "ягодный": "berry",
    "цитрусовый": "citrus"
  });

  const WORDS_KZ = makeWordMap({
    "креветки": "асшаян",
    "креветка": "асшаян",
    "курица": "тауық",
    "куриный": "тауық",
    "куриная": "тауық",
    "куриные": "тауық",
    "куриное": "тауық",
    "говядина": "сиыр еті",
    "баранина": "қой еті",
    "телятина": "бұзау еті",
    "утка": "үйрек",
    "утиная": "үйрек",
    "семга": "албырт",
    "сёмга": "албырт",
    "форель": "форель",
    "судак": "көксерке",
    "сибас": "сибас",
    "дорадо": "дорада",
    "угорь": "жыланбалық",
    "язык": "тіл",
    "рыба": "балық",
    "мясо": "ет",
    "филе": "филе",
    "вырезка": "жұмсақ ет",
    "бон филе": "сиырдың жұмсақ еті",
    "ростбиф": "ростбиф",
    "медальоны": "медальондар",
    "стейк": "стейк",
    "салат": "салат",
    "салаты": "салаттар",
    "суп": "сорпа",
    "супы": "сорпалар",
    "лапша": "кеспе",
    "паста": "паста",
    "пицца": "пицца",
    "бургер": "бургер",
    "омлет": "омлет",
    "крылышки": "қанаттар",
    "роллы": "роллдар",
    "рулет": "рулет",
    "рулетики": "рулетиктер",
    "тортилья": "тортилья",
    "плато": "плато",
    "ассорти": "ассорти",
    "закуска": "тіскебасар",
    "гарнир": "гарнир",
    "десерт": "десерт",
    "десерты": "десерттер",
    "чай": "шай",
    "кофе": "кофе",
    "лимонад": "лимонад",
    "сок": "шырын",
    "соки": "шырындар",
    "вода": "су",
    "молоко": "сүт",
    "мёд": "бал",
    "лимон": "лимон",
    "лайм": "лайм",
    "рис": "күріш",
    "пюре": "езбе",
    "картофель": "картоп",
    "фри": "фри",
    "овощи": "көкөністер",
    "огурцы": "қияр",
    "огурец": "қияр",
    "помидоры": "қызанақ",
    "помидор": "қызанақ",
    "черри": "черри қызанағы",
    "перец": "бұрыш",
    "лук": "пияз",
    "чеснок": "сарымсақ",
    "морковь": "сәбіз",
    "свекла": "қызылша",
    "свёкла": "қызылша",
    "капуста": "қырыққабат",
    "пекинская капуста": "пекин қырыққабаты",
    "брокколи": "брокколи",
    "шампиньоны": "шампиньондар",
    "шампиньон": "шампиньон",
    "авокадо": "авокадо",
    "руккола": "руккола",
    "зелень": "көк шөп",
    "микс": "микс",
    "айсберг": "айсберг салаты",
    "яйцо": "жұмыртқа",
    "яйца": "жұмыртқалар",
    "сыр": "ірімшік",
    "фета": "фета",
    "фетакса": "фетакса",
    "моцарелла": "моцарелла",
    "пармезан": "пармезан",
    "сливки": "кілегей",
    "сливочный": "кілегейлі",
    "соус": "тұздық",
    "соусы": "тұздықтар",
    "острый": "ащы",
    "домашняя": "үй",
    "домашний": "үй",
    "жареный": "қуырылған",
    "жареная": "қуырылған",
    "жареные": "қуырылған",
    "копченый": "ысталған",
    "малосольная": "аз тұздалған",
    "маринованные": "маринадталған",
    "маринованный": "маринадталған",
    "квашеная": "ашытылған",
    "свежие": "жаңа",
    "свежий": "жаңа",
    "свежая": "жаңа",
    "фруктовый": "жемісті",
    "фруктовая": "жемісті",
    "ягодный": "жидекті",
    "цитрусовый": "цитрусты"
  });

  const RUSSIAN_LETTERS_RE = /[А-Яа-яЁё]/;
  const LATIN_ONLY_RE = /^[A-Za-z0-9 .,'’"“”()\-+&/№*]+$/;

  function makeWordMap(obj) {
    return Object.entries(obj).sort((a, b) => b[0].length - a[0].length);
  }

  function replaceAllSafe(text, pairs) {
    let out = text;
    for (const [from, to] of pairs) {
      const re = new RegExp(escapeRegExp(from), "gi");
      out = out.replace(re, (m) => preserveCase(m, to));
    }
    return out;
  }

  function replaceWords(text, pairs) {
    let out = text;
    for (const [ru, tr] of pairs) {
      const re = new RegExp(`(?<![A-Za-zА-Яа-яЁё])${escapeRegExp(ru)}(?![A-Za-zА-Яа-яЁё])`, "gi");
      out = out.replace(re, (m) => preserveCase(m, tr));
    }
    return out;
  }

  function preserveCase(src, target) {
    if (!src) return target;
    if (src.toUpperCase() === src) return target.toUpperCase();
    if (src[0] && src[0].toUpperCase() === src[0]) {
      return target.charAt(0).toUpperCase() + target.slice(1);
    }
    return target;
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeSpaces(s) {
    return (s || "")
      .replace(/\s+/g, " ")
      .replace(/\s+,/g, ",")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
  }

  function normalizeQuotes(s) {
    return s
      .replace(/«\s+/g, "«")
      .replace(/\s+»/g, "»")
      .replace(/“|”/g, '"');
  }

  function cleanupEn(text) {
    let t = normalizeSpaces(text);
    t = t.replace(/\bSweet chili\b/gi, "Sweet chili");
    t = t.replace(/\bBBQ\b/gi, "BBQ");
    t = t.replace(/\bLong\b/gi, "Long");
    t = t.replace(/\bShot\b/gi, "Shot");
    t = t.replace(/\bMojito\b/gi, "Mojito");
    t = t.replace(/\bPina Colada\b/gi, "Pina Colada");
    t = t.replace(/\bLong Island Iced Tea\b/gi, "Long Island Iced Tea");
    t = t.replace(/\bTequila\b/gi, "Tequila");
    t = t.replace(/\bCoca-Cola\b/g, "Coca-Cola");
    t = t.replace(/\bRed Bull\b/g, "Red Bull");
    t = t.replace(/\bIce Tea\b/g, "Iced Tea");
    t = t.replace(/  +/g, " ");
    return t.trim();
  }

  function cleanupKz(text) {
    let t = normalizeSpaces(text);
    t = t.replace(/қазы/gi, "қазы");
    t = t.replace(/ё/g, "е");
    return t.trim();
  }

  function translitRuToEn(text) {
    const map = {
      а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"yo", ж:"zh", з:"z", и:"i", й:"y", к:"k", л:"l", м:"m", н:"n",
      о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh", щ:"shch", ъ:"", ы:"y", ь:"",
      э:"e", ю:"yu", я:"ya"
    };
    return text.replace(/[А-Яа-яЁё]/g, (ch) => {
      const low = ch.toLowerCase();
      const tr = map[low] ?? ch;
      return ch === low ? tr : (tr.charAt(0).toUpperCase() + tr.slice(1));
    });
  }

  function maybeBrandOrLatin(text) {
    return !!text && LATIN_ONLY_RE.test(text) && !RUSSIAN_LETTERS_RE.test(text);
  }

  function translateNameEn(ru) {
    if (!ru) return "";
    const src = normalizeQuotes(ru).trim();

    if (EXACT_NAME_EN[src]) return EXACT_NAME_EN[src];
    if (maybeBrandOrLatin(src)) return src;

    // Бренды/названия на латинице внутри строки — сохраняем, а русские части переводим правилами
    let t = src;

    // Частые фразовые шаблоны
    t = replaceAllSafe(t, PHRASES_EN);

    // Прямые словарные замены слов
    t = replaceWords(t, WORDS_EN);

    // Спец. замены категорийно-барных терминов
    t = t
      .replace(/\bТекила санрайз\b/gi, "Tequila Sunrise")
      .replace(/\bДайкири клубничный\b/gi, "Strawberry Daiquiri")
      .replace(/\bСекс на пляже\b/gi, "Sex on the Beach")
      .replace(/\bДжин Тоник\b/gi, "Gin & Tonic")
      .replace(/\bМохито\b/gi, "Mojito")
      .replace(/\bМаргарита\b/gi, "Margarita")
      .replace(/\bХиросима\b/gi, "Hiroshima")
      .replace(/\bМедуза\b/gi, "Medusa")
      .replace(/\bЗелёный мексиканец\b/gi, "Green Mexican")
      .replace(/\bВзрыв мозга\b/gi, "Brain Explosion")
      .replace(/\bПоцелуй бармена\b/gi, "Bartender's Kiss")
      .replace(/\bНемецкое\b/gi, "German")
      .replace(/\bДербес «Прага»\b/gi, 'Derbes "Prague"')
      .replace(/\bСоки\b/gi, "Juices")
      .replace(/\bЛимонад\b/gi, "Lemonade");

    // Если осталась кириллица — транслитерируем как fallback
    if (RUSSIAN_LETTERS_RE.test(t)) t = translitRuToEn(t);

    return cleanupEn(t);
  }

  function translateNameKz(ru) {
    if (!ru) return "";
    const src = normalizeQuotes(ru).trim();

    if (EXACT_NAME_KZ[src]) return EXACT_NAME_KZ[src];
    if (maybeBrandOrLatin(src)) return src;

    let t = src;
    t = replaceAllSafe(t, PHRASES_KZ);
    t = replaceWords(t, WORDS_KZ);

    // Частые ручные доменные формы
    t = t
      .replace(/\bгреческий\b/gi, "грек")
      .replace(/\bГреческий салат\b/gi, "Грек салаты")
      .replace(/\bЦезарь\b/gi, "Цезарь")
      .replace(/\bТёплый\b/gi, "Жылы")
      .replace(/\bТеплый\b/gi, "Жылы")
      .replace(/\bСалат\b/gi, "Салат")
      .replace(/\bСуп\b/gi, "Сорпа")
      .replace(/\bПицца\b/gi, "Пицца")
      .replace(/\bПивной\b/gi, "Сыра")
      .replace(/\bдетский\b/gi, "балалар")
      .replace(/\bкоролевские\b/gi, "корольдік")
      .replace(/\bфруктовая нарезка\b/gi, "жеміс турамасы");

    return cleanupKz(t);
  }

  function translateDescEn(ru) {
    if (!ru) return "";
    const src = normalizeQuotes(ru).trim();
    if (!src) return "";
    if (EXACT_DESC_EN[src]) return EXACT_DESC_EN[src];
    if (maybeBrandOrLatin(src)) return src;

    let t = src;
    t = replaceAllSafe(t, PHRASES_EN);
    t = replaceWords(t, WORDS_EN);

    t = t
      .replace(/\bсоус «([^»]+)»/gi, 'sauce "$1"')
      .replace(/\bсоус "([^"]+)"/gi, 'sauce "$1"')
      .replace(/\bдомашняя лапша\b/gi, "homemade noodles")
      .replace(/\bпеппер\b/gi, "pepper")
      .replace(/\bкунжут\b/gi, "sesame")
      .replace(/\bорех\b/gi, "nuts")
      .replace(/\bфиники\b/gi, "dates")
      .replace(/\bхалва\b/gi, "halva")
      .replace(/\bкурт\b/gi, "kurt")
      .replace(/\bиримшик\b/gi, "irimshik")
      .replace(/\bжент\b/gi, "zhent")
      .replace(/\bсузбе\b/gi, "suzbe")
      .replace(/\bкаункак\b/gi, "qaunqaq")
      .replace(/\bнауат\b/gi, "navat")
      .replace(/\bбадам\b/gi, "badam")
      .replace(/\bказы\b/gi, "kazy")
      .replace(/\bжая\b/gi, "zhaya")
      .replace(/\bжал-жая\b/gi, "zhal-zhaya")
      .replace(/\bжамбас\b/gi, "zhambas")
      .replace(/\bкуырдак\b/gi, "kuyrdak");

    if (RUSSIAN_LETTERS_RE.test(t)) t = translitRuToEn(t);

    return cleanupEn(t);
  }

  function translateDescKz(ru) {
    if (!ru) return "";
    const src = normalizeQuotes(ru).trim();
    if (!src) return "";
    if (EXACT_DESC_KZ[src]) return EXACT_DESC_KZ[src];
    if (maybeBrandOrLatin(src)) return src;

    let t = src;
    t = replaceAllSafe(t, PHRASES_KZ);
    t = replaceWords(t, WORDS_KZ);

    t = t
      .replace(/\bсоус «([^»]+)»/gi, '«$1» тұздығы')
      .replace(/\bдомашняя лапша\b/gi, "үй кеспесі")
      .replace(/\bкунжут\b/gi, "күнжіт")
      .replace(/\bорех\b/gi, "жаңғақ")
      .replace(/\bфиники\b/gi, "құрма")
      .replace(/\bхалва\b/gi, "халва")
      .replace(/\bкурт\b/gi, "құрт")
      .replace(/\bиримшик\b/gi, "ірімшік")
      .replace(/\bжент\b/gi, "жент")
      .replace(/\bсузбе\b/gi, "сүзбе")
      .replace(/\bкаункак\b/gi, "қауынқақ")
      .replace(/\bнауат\b/gi, "науат")
      .replace(/\bбадам\b/gi, "бадам")
      .replace(/\bказы\b/gi, "қазы")
      .replace(/\bжая\b/gi, "жая")
      .replace(/\bжал-жая\b/gi, "жал-жая")
      .replace(/\bжамбас\b/gi, "жамбас")
      .replace(/\bкуырдак\b/gi, "қуырдақ");

    return cleanupKz(t);
  }

  function normalizeCategory(cat) {
    const fixed = CATEGORY_MAP[cat.id];
    if (!fixed) return { ...cat };

    return {
      ...cat,
      ru: fixed.ru,
      kz: fixed.kz,
      en: fixed.en
    };
  }

  function normalizeMenuItem(item) {
    const ruName = (item.ru || "").trim();
    const ruDesc = (item.desc && item.desc.ru ? item.desc.ru : "").trim();

    const kzName = translateNameKz(ruName);
    const enName = translateNameEn(ruName);

    const kzDesc = translateDescKz(ruDesc);
    const enDesc = translateDescEn(ruDesc);

    return {
      ...item,
      ru: ruName,
      kz: kzName || (item.kz || ruName),
      en: enName || (item.en || ruName),
      desc: {
        ru: ruDesc,
        kz: kzDesc || ((item.desc && item.desc.kz) ? item.desc.kz : ruDesc),
        en: enDesc || ((item.desc && item.desc.en) ? item.desc.en : ruDesc)
      }
    };
  }

  function fixMenuTranslations(rawCategories, menuItems) {
    const categories = Array.isArray(rawCategories) ? rawCategories.map(normalizeCategory) : [];
    const items = Array.isArray(menuItems) ? menuItems.map(normalizeMenuItem) : [];
    return { categories, items };
  }

  return { fixMenuTranslations };
});
