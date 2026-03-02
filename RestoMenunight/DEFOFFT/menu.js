/* ===== Dataset (обновлённое меню по фото + исходное барное меню) ===== */
const MENU = [
  {
    id: 'cold',
    name: 'Холодные закуски',
    color: '#e6f4ea',
    img: 'img/cold.png',
    items: [
      { n: 'Мясное плато', p: 12500, d: 'жая, казы, язык' },
      { n: 'Рыбное плато', p: 15000, d: 'копченый лосось, масляная рыба эсколар, угорь' },
      { n: 'Кавказская закуска', p: 5490, d: 'огурцы, свежие помидоры, перец болгарский, фетакса, маслины, зелень' },
      { n: 'Рулетики из кабачков', p: 2000, d: 'кабачок, куриная грудка, сыр Пармезан, соус чесночный' },
      { n: 'Фруктовая нарезка', p: 5100, d: 'яблоки, груша, виноград, киви, банан, апельсин' }
    ]
  },
  {
    id: 'salads',
    name: 'Салаты',
    color: '#efe9ff',
    img: 'img/27.png',
    items: [
      { n: 'Цезарь с курицей', p: 3200, d: 'классический салат с хрустящим салатом айсберг и традиционным соусом «Цезарь» с куриным филе на гриле' },
      { n: 'Греческий салат с сыром «Фета»', p: 2299, d: 'комбинация из хрустящих овощей и свежей зелени с греческим сыром фетакса с соусом «Цитронет»' }
    ]
  },
  {
    id: 'main',
    name: 'Вторые блюда',
    color: '#fee2e2',
    img: 'img/gril.png',
    items: [
      { n: 'Цыпленок с пюре и зеленым луком', p: 3900, d: 'куриная грудка, ножка филе, соус «Жу»' },
      { n: 'Семга с фруктовым салатом', p: 6500, d: 'семга, фруктовый салат по сезону, соус «Средиземноморский»' },
      { n: 'Спагетти «Болоньезе»', p: 3600, d: 'бон филе, айсберг, помидор, сыр, лук репчатый, соус «Секретный»' },
      { n: 'Фетучини с курицей', p: 3600, d: 'куриное филе, репчатый лук, шампиньоны, сливки, зелень' }
    ]
  },
  {
    id: 'soups',
    name: 'Супы',
    color: '#e6f3ff',
    img: 'img/5.png',
    items: [
      { n: 'Суп лапша с курицей', p: 1700 },
      { n: 'Борщ', p: 1800 },
      { n: 'Пельмени', p: 1799 }
    ]
  },
  {
    id: 'pizza',
    name: 'Пицца',
    color: '#e0e7ff',
    img: 'img/21.png',
    items: [
      { n: 'Пепперони', p: 3400 },
      { n: 'Маргарита', p: 3400 }
    ]
  }
];


const BAR = [
  { id: 'bar-drinks', name: 'Напитки', color: '#f9fafb', img: '', items: [
    { n:'Coca-Cola 0.25', p:900 },
    { n:'Pepsi 0.25', p:900 },
    { n:'Coca-Cola 1', p:1800 },
    { n:'Red Bull 0.25', p:1500 },
    { n:'Соки Gracio (ассорт.)', p:2000 },
    { n:'Piko (ассорт.)', p:2000 },
    { n:'Ararat Сок', p:2500 },
    { n:'Ascania Лимонад', p:1500 },
  ]},
  { id: 'bar-water', name: 'Вода', color: '#f9fafb', img: '', items: [
    { n:'Bon Aqua 1', p:600 },
    { n:'Bon Aqua 0.33', p:350 },
    { n:'Borjomi 0.5', p:1500 },
    { n:'Tassay 1', p:1200 },
    { n:'Tassay 0.5 (стекло)', p:1200 },
    { n:'Chortaq', p:1000 },
  ]},
  { id: 'bar-teas', name: 'Элитные чаи (1 л)', color: '#f9fafb', img: '', items: [
    { n:'Жасмин', p:2300 },
    { n:'Сенча', p:2300 },
    { n:'Японская липа', p:2300 },
    { n:'Грёзы Султана', p:2300 },
    { n:'Нахальный фрукт', p:2300 },
    { n:'Эрл грей', p:2300 },
    { n:'Ассам', p:2300 },
    { n:'Клубника со сливками', p:2300 },
    { n:'Карамель со сливками', p:2300 },
    { n:'Дикий фрукт', p:2300 },
    { n:'Ройбуш «Ревень-ягода»', p:2300 },
    { n:'Синий барбарис', p:2300 },
    { n:'Загадка фараона', p:2300 },
  ]},
  { id: 'bar-auth-teas', name: 'Авторские чаи (1 л)', color: '#f9fafb', img: '', items: [
    { n:'Марокканский', p:2500 },
    { n:'Простудный', p:2500 },
    { n:'Облепиховый', p:2500 },
    { n:'Цитрусовый', p:2500 },
    { n:'Фруктовый', p:2500 },
    { n:'Ягодный', p:2500 },
    { n:'Манго-маракуйя', p:2500 },
    { n:'Ташкентский', p:2500 },
  ]},
  { id: 'bar-tea-addons', name: 'К чаю', color: '#f9fafb', img: '', items: [
    { n:'Лимон', p:500 },
    { n:'Мёд', p:500 },
    { n:'Молоко', p:350 },
    { n:'Лайм', p:700 },
    { n:'Шоколад «Kazakhstan»', p:1500 },
    { n:'Raffaello', p:5500 },
    { n:'Merci', p:7000 },
  ]},
  { id: 'bar-alc-cocktails', name: 'Алкогольные коктейли', color: '#f9fafb', img: '', items: [
    { n:'B-52 (Shot 60 мл)', p:1800 },
    { n:'B-53 (Shot 60 мл)', p:1800 },
    { n:'Медуза (Shot 60 мл)', p:1800 },
    { n:'Хиросима (Shot 60 мл)', p:1800 },
    { n:'Зелёный мексиканец (Shot 60 мл)', p:1800 },
    { n:'Взрыв мозга (Shot 60 мл)', p:1800 },
    { n:'Поцелуй бармена (Shot 60 мл)', p:1800 },
    { n:'Маргарита (Long)', p:2200 },
    { n:'Cosmopolitan (Long)', p:2500 },
    { n:'Pina Colada (Long)', p:2200 },
    { n:'Long Island Iced Tea (Long)', p:2500 },
    { n:'Mojito (Long)', p:2200 },
    { n:'Текила санрайз (Long)', p:2200 },
    { n:'Дайкири клубничный (Long)', p:2200 },
    { n:'Секс на пляже (Long)', p:2200 },
    { n:'Джин Тоник (Long)', p:2500 },
  ]},
  { id: 'bar-cigarettes', name: 'Сигареты', color: '#f9fafb', img: '', items: [
    { n:'Parliament', p:2500 },
    { n:'Esse', p:2500 },
    { n:'Зажигалка', p:500 },
    { n:'Орбит', p:500 },
  ]},
  { id: 'bar-nonalc-cocktails', name: 'Безалкогольные коктейли', color: '#f9fafb', img: '', items: [
    { n:'Экзотика', p:2200 },
    { n:'Мохито (ассорт.)', p:1400 },
    { n:'Молочные (ассорт.)', p:2200 },
    { n:'Ice Tea (ассорт.)', p:2200 },
  ]},
  { id: 'bar-lemonades', name: 'Лимонады', color: '#f9fafb', img: '', items: [
    { n:'Цитрусовый', p:2500 },
    { n:'Клубничный с бананом', p:2500 },
    { n:'Киви лайм', p:2500 },
    { n:'Апельсин с карамелью', p:2500 },
    { n:'Вишня имбирь', p:2500 },
    { n:'Манго маракуйя', p:2500 },
    { n:'Ягодный', p:2500 },
    { n:'Ананас дыня', p:2500 },
    { n:'Манго дыня', p:2500 },
    { n:'Вишня персик', p:2500 },
  ]},
  { id: 'bar-fresh', name: 'Фреш 0.33', color: '#f9fafb', img: '', items: [
    { n:'Яблочный', p:2800 },
    { n:'Апельсиновый', p:2800 },
    { n:'Морковный', p:2800 },
    { n:'Цитрусовый', p:2800 },
  ]},
  { id: 'bar-coffee', name: 'Кофе', color: '#f9fafb', img: '', items: [
    { n:'Эспрессо', p:1200 },
    { n:'Американо', p:1200 },
    { n:'Гляссе', p:1200 },
    { n:'Флэт Уайт', p:2000 },
    { n:'Капучино', p:1500 },
    { n:'Латте', p:1500 },
    { n:'Сироп', p:200 },
  ]},
  { id: 'bar-liquers', name: 'Настойки и ликёры (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Cointreau', p:3000 },
    { n:'Kahlua', p:3500 },
    { n:'Jagermeister', p:3000 },
    { n:'Sambuca', p:1200 },
    { n:'Absinthe', p:1200 },
    { n:'Malibu', p:3400 },
    { n:'Baileys', p:3500 },
  ]},
  { id: 'bar-cognac-fr', name: 'Французский коньяк (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Martell V.S', p:3900 },
    { n:'Martell V.S.O.P', p:7000 },
    { n:'Hennessy V.S', p:4500 },
    { n:'Hennessy V.S.O.P', p:7500 },
    { n:'Hennessy X.O', p:15000 },
    { n:'Lheraud V.S', p:3600 },
    { n:'Lheraud V.S.O.P', p:6090 },
  ]},
  { id: 'bar-cognac-am', name: 'Армянский коньяк (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'ARARAT 5 y.o', p:1500 },
    { n:'ARARAT Ани 7 y.o', p:3300 },
  ]},
  { id: 'bar-cognac-kz', name: 'Казахстанский коньяк (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Shustoff Old History', p:700 },
    { n:'Казахстан 3* Global Wine', p:900 },
    { n:'Казахстан 5* Global Wine', p:1100 },
  ]},
  { id: 'bar-beer-bottled', name: 'Бутылочное пиво', color: '#f9fafb', img: '', items: [
    { n:'Miller 0.33', p:1800 },
    { n:'Heineken 0.33', p:1700 },
    { n:'Corona Extra 0.33', p:3500 },
    { n:'Tsintao 0.33', p:2200 },
    { n:'Estrella Galicia 0.33', p:3000 },
    { n:'Budweiser Budvar 0.33', p:2700 },
    { n:'Paulaner Munchiner Hell 0.5', p:4000 },
    { n:'Paulaner Weissbier 0.5', p:4000 },
    { n:'Bud 0.33', p:1500 },
  ]},
  { id: 'bar-beer-draft', name: 'Разливное пиво (0.5)', color: '#f9fafb', img: '', items: [
    { n:'Немецкое', p:1800 },
  ]},
  { id: 'bar-beer-snacks', name: 'К пиву', color: '#f9fafb', img: '', items: [
    { n:'Чипсы Pringles', p:1500 },
    { n:'Фисташки', p:1200 },
    { n:'Арахис', p:1000 },
    { n:'Чечил', p:800 },
  ]},
  { id: 'bar-vodka', name: 'Водка (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Absolut Elyx', p:3500 },
    { n:'Absolut Blue', p:1500 },
    { n:'Absolut Kurant', p:1800 },
    { n:'Absolut Gitron', p:2000 },
    { n:'Grey Goose', p:2800 },
    { n:'Beluga', p:3000 },
    { n:'Finlandia', p:1600 },
    { n:'Мороша уровень мягкости №1', p:800 },
    { n:'Мороша Премиум', p:1800 },
    { n:'Айдабульская', p:800 },
    { n:'Altyn Gasyr', p:800 },
    { n:'Kyzylzhar', p:1000 },
    { n:'Хортица', p:1000 },
    { n:'Русский стандарт', p:1200 },
    { n:'Reyka', p:2500 },
    { n:'Чистые росы', p:3000 },
    { n:'Belvedere', p:3500 },
    { n:'Qazaq Eli', p:800 },
    { n:'Mont Blanc', p:4000 },
    { n:'Askaneli Чача', p:800 },
    { n:'Nemiroff', p:1500 },
  ]},
  { id: 'bar-wine-spain-red', name: 'Испания — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Campo Viejo Rioja (Tempranillo) — красное сухое', p:15000 },
    { n:'Campo Viejo Rioja Reserva — красное сухое', p:15000 },
    { n:'Campo Viejo Rioja Gran Reserva — красное сухое', p:30000 },
    { n:'San Valentin — красное сухое', p:19000 },
    { n:'Terra Linda (Garnacha) — красное сухое', p:15000 },
    { n:'Ganadero (Garnacha) — красное сухое', p:23000 },
    { n:'Natureo (Garnacha) — красное сухое', p:24000 },
  ]},
  { id: 'bar-wine-spain-white', name: 'Испания — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'San Valentin — белое полусухое', p:15000 },
    { n:'Terra Linda (Chardonnay) — белое сухое', p:15000 },
    { n:'Ganadero — белое сухое', p:23000 },
    { n:'Natureo (Muscat) — белое сухое', p:24000 },
  ]},
  { id: 'bar-wine-italy-red', name: 'Италия — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Villa Antinori (Toscana) — красное сухое', p:40000 },
    { n:'Ruffino — красное сухое', p:23000 },
    { n:'Villa Cardini (Chianti) — красное сухое', p:12000 },
  ]},
  { id: 'bar-wine-italy-white', name: 'Италия — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Villa Antinori (Toscana) — белое сухое', p:22000 },
    { n:'Ruffino — белое сухое', p:23000 },
    { n:'Lamelle — белое сухое', p:33000 },
    { n:'Casasole Orvieto — белое полусладкое', p:25000 },
  ]},
  { id: 'bar-wine-nz-red', name: 'Новая Зеландия — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Brancott Estate (Pinot Noir) — красное сухое', p:23000 },
    { n:'Villa Maria (Pinot Noir) — красное сухое', p:28000 },
    { n:'Villa Maria Reserva (Pinot Noir) — красное сухое', p:49000 },
    { n:'Cloudy Bay (Te Wāhi) — красное сухое', p:150000 },
    { n:'Cloudy Bay — красное сухое', p:104000 },
    { n:'Nuala (Pinot Noir) — красное сухое', p:39000 },
  ]},
  { id: 'bar-wine-nz-white', name: 'Новая Зеландия — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Brancott Estate (Sauvignon Blanc) — белое сухое', p:22000 },
    { n:'Nuala (Sauvignon Blanc) — белое сухое', p:38500 },
    { n:'Curly Sheep (Sauvignon Blanc) — белое сухое', p:24000 },
  ]},
  { id: 'bar-wine-france-red', name: 'Франция — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Château Timberlay (Merlot-Cabernet) — красное сухое', p:22000 },
    { n:'Cruse Cabernet Sauvignon — красное сухое', p:12000 },
  ]},
  { id: 'bar-wine-france-white', name: 'Франция — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Château Timberlay (Sauvignon) — белое сухое', p:22000 },
    { n:'Cruse Sauvignon — белое сухое', p:20000 },
    { n:'Chablis — белое сухое', p:50000 },
    { n:'Le Grand Noir (Moscato) — белое полусладкое', p:25000 },
    { n:'Le Grand Noir (Sauvignon Blanc) — белое сухое', p:23000 },
    { n:'Le Grand Noir (Chardonnay) — белое сухое', p:23000 },
  ]},
  { id: 'bar-wine-georgia-red', name: 'Грузия — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Алазанская долина — красное полусладкое', p:9000 },
    { n:'Саперави Мускат — красное полусладкое', p:10000 },
    { n:'Киндзмараули — красное полусладкое', p:12000 },
    { n:'Хванчкара — красное полусладкое', p:22000 },
    { n:'Мукузани — красное сухое', p:25000 },
  ]},
  { id: 'bar-wine-georgia-white', name: 'Грузия — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Алазанская долина — белое полусладкое', p:9000 },
    { n:'Твиши — белое полусладкое', p:17500 },
    { n:'Цинандали — белое сухое', p:9000 },
  ]},
  { id: 'bar-wine-chile-white', name: 'Чили — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'El Chivo — белое полусладкое', p:10500 },
    { n:'Tocornal (Chardonnay) — белое сухое', p:18000 },
  ]},
  { id: 'bar-wine-chile-red', name: 'Чили — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'El Chivo (Merlot) — красное сухое', p:10500 },
    { n:'Tocornal (Cabernet Sauvignon) — красное сухое', p:18000 },
  ]},
  { id: 'bar-wine-austria-red', name: 'Австрия — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Domaene Gobelsburg — красное сухое', p:23000 },
  ]},
  { id: 'bar-wine-austria-white', name: 'Австрия — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Domaene Gobelsburg — белое сухое', p:23000 },
  ]},
  { id: 'bar-wine-australia-red', name: 'Австралия — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Fox Grove — красное сухое', p:13000 },
  ]},
  { id: 'bar-wine-australia-white', name: 'Австралия — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Fox Grove — белое сухое', p:13000 },
  ]},
  { id: 'bar-wine-germany-red', name: 'Германия — Красные вина', color: '#f9fafb', img: '', items: [
    { n:'Vie la Vie 0,0% (Cabernet Sauvignon) — красное сухое', p:15000 },
  ]},
  { id: 'bar-wine-germany-white', name: 'Германия — Белые вина', color: '#f9fafb', img: '', items: [
    { n:'Vie la Vie 0,0% (Sauvignon Blanc) — белое сладкое', p:15000 },
  ]},
  { id: 'bar-scotch', name: 'Шотландский виски (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Chivas Regal 12 y.o', p:3000 },
    { n:'Chivas Regal 13 y.o', p:4000 },
    { n:'Chivas Regal XV 15 y.o', p:6000 },
    { n:'Chivas Regal 18 y.o', p:8000 },
    { n:'Ballantine’s Finest', p:2000 },
    { n:'Passport Scotch', p:1500 },
  ]},
  { id: 'bar-single-malt', name: 'Односолодовый виски (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'The Glenlivet Founder’s Reserve', p:6000 },
    { n:'The Glenlivet «Excellence» 12 y.o', p:7000 },
    { n:'Macallan 12 y.o', p:11500 },
    { n:'Glenfiddich 12 y.o', p:5500 },
    { n:'Glenfiddich 18 y.o', p:10000 },
    { n:'Glenmorangie the Original 10 y.o', p:6000 },
  ]},
  { id: 'bar-jameson', name: 'Jameson Family (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Jameson Original', p:2000 },
    { n:'Jameson Crested', p:2500 },
    { n:'Jameson Black Barell', p:2200 },
    { n:'Jameson Caskmates IPA Edition', p:2000 },
  ]},
  { id: 'bar-bourbon', name: 'Бурбон (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Four Roses Original', p:3000 },
    { n:'Jack Daniel’s', p:2700 },
    { n:'Jack Daniel’s Apple', p:1750 },
    { n:'Jack Daniel’s Honey', p:1400 },
  ]},
  { id: 'bar-aperitifs', name: 'Аперитивы (100 мл)', color: '#f9fafb', img: '', items: [
    { n:'Martini Fiero', p:3000 },
    { n:'Martini Bianco', p:3000 },
    { n:'Martini Rosso', p:3000 },
    { n:'Martini Extra Dry', p:3000 },
  ]},
  { id: 'bar-sparkling', name: 'Игристые вина (0.75 л)', color: '#f9fafb', img: '', items: [
    { n:'Campo Viejo CAVA Brut Reserva', p:19000 },
    { n:"Jacob’s Creek Sparkling Moscato", p:18000 },
    { n:"Jacob’s Creek Sauvignon Blanc", p:12000 },
    { n:'Martini Prosecco', p:18000 },
    { n:'Martini Asti', p:18000 },
    { n:'Moet Chandon Brut Rose', p:120000 },
    { n:'Moet Chandon Brut Imperial', p:96000 },
  ]},
  { id: 'bar-tequila', name: 'Текила (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Olmeca Blanco', p:1500 },
    { n:'Olmeca Gold', p:3000 },
    { n:'Jimador Reposado', p:3000 },
    { n:'Jimador Bianco', p:3500 },
  ]},
  { id: 'bar-gin', name: 'Джин (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'Beefeater Original', p:2500 },
  ]},
  { id: 'bar-rum', name: 'Кубинский ром (50 мл)', color: '#f9fafb', img: '', items: [
    { n:'HAVANA CLUB 3 y.o', p:1600 },
    { n:'HAVANA CLUB 7 y.o', p:3000 },
    { n:'HAVANA CLUB Especial', p:2000 },
    { n:'HAVANA CLUB Cuban Spiced', p:2200 },
    { n:'Bacardi Gold', p:2400 },
    { n:'Bacardi Negra Rum', p:2400 },
    { n:'Bacardi Oakheart', p:2400 },
    { n:'Bacardi Rum Carta Oro', p:2400 },
  ]},
];

const i18n = {
  ui: {
    remove_btn: { ru: "Удалить", kk: "Өшіру", en: "Remove" },
    toast_added: { ru:"Добавлено в корзину", kk:"Себетке қосылды", en:"Added to cart" },
    toast_removed: { ru:"Удалено", kk:"Өшірілді", en:"Removed" },
    toast_selected: { ru:"Выбрано", kk:"Таңдалды", en:"Selected" },
    toast_qty_inc: { ru:"Количество увеличено", kk:"Саны артты", en:"Quantity increased" },
    toast_qty_dec: { ru:"Количество уменьшено", kk:"Саны азайды", en:"Quantity decreased" },
    title_menu: { ru: "Меню", kk: "Мәзір", en: "Menu" },
    title_bar: { ru: "Бар", kk: "Бар", en: "Bar" },
    search_menu_ph: { ru: "Поиск по меню", kk: "Мәзірден іздеу", en: "Search menu" },
    search_bar_ph: { ru: "Поиск по бару", kk: "Бардан іздеу", en: "Search bar" },
    tab_category: { ru: "Категория", kk: "Санат", en: "Category" },
    tab_bar: { ru: "Бар", kk: "Бар", en: "Bar" },
    tab_orders: { ru: "Заказы", kk: "Тапсырыстар", en: "Orders" },
    cart_title: { ru: "Моя корзина", kk: "Менің себетім", en: "My cart" },
    total_label: { ru: "Итого:", kk: "Барлығы:", en: "Total:" },
    btn_checkout: { ru: "Оформить заказ", kk: "Рәсімдеу", en: "Checkout" },
    empty_cart: { ru: "Корзина пуста", kk: "Себет бос", en: "Cart is empty" },

    checkout_title: { ru: "Оформление заказа", kk: "Тапсырысты рәсімдеу", en: "Checkout" },
    room_label: { ru: "Номер комнаты*", kk: "Бөлме нөмірі*", en: "Room number*" },
    name_label: { ru: "Имя*", kk: "Аты*", en: "Name*" },
    comment_label: { ru: "Комментарии", kk: "Пікір", en: "Comment" },
    pay_kaspi: { ru: "KASPI bank", kk: "KASPI bank", en: "KASPI bank" },
    pay_jusan: { ru: "Jusan bank", kk: "Jusan bank", en: "Jusan bank" },
    pay_halyk: { ru: "Halyk bank", kk: "Halyk bank", en: "Halyk bank" },
    pay_cash: { ru: "Наличка", kk: "Қолма-қол", en: "Cash" },
    btn_send: { ru: "Отправить", kk: "Жіберу", en: "Send" },
    btn_cancel: { ru: "Отмена", kk: "Бас тарту", en: "Cancel" },
    hint_required: { ru: "* — обязательные поля", kk: "* — міндетті өрістер", en: "* — required fields" },

    success_title: { ru: "Заказ уже собираем", kk: "Тапсырысыңыз дайындалуда", en: "We are preparing your order" },
    success_thanks: { ru: "Рахмет!", kk: "Рақмет!", en: "Thank you!" },
    success_desc: { ru: "Ваши товары были размещены и находятся в стадии обработки.", kk: "Тапсырысыңыз қабылданды және өңделуде.", en: "Your order has been placed and is being processed." },
    btn_home: { ru: "На главную", kk: "Басты бетке", en: "Home" }
  },
  menu: {
    categories: {
      // Restaurant
      cold: { ru: "Холодные закуски", kk: "Суық тіскебасарлар", en: "Cold appetizers" },
      "hot-app": { ru: "Горячие закуски", kk: "Ыстық тіскебасарлар", en: "Hot appetizers" },
      beer: { ru: "Пивные сеты", kk: "Сыра сеттері", en: "Beer sets" },
      salads: { ru: "Салаты", kk: "Салаттар", en: "Salads" },
      "warm-salads": { ru: "Тёплые салаты", kk: "Жылы салаттар", en: "Warm salads" },
      soups: { ru: "Супы", kk: "Сорпалар", en: "Soups" },
      pasta: { ru: "Пасты", kk: "Паста", en: "Pasta" },
      korean: { ru: "Корейская кухня", kk: "Кәріс асханасы", en: "Korean cuisine" },
      "k-salads": { ru: "Корейские салаты", kk: "Кәріс салаттары", en: "Korean salads" },
      "grill-meat": { ru: "Гриль-блюдо мясо", kk: "Гриль-еті", en: "Grill — meat" },
      "grill-fish": { ru: "Гриль-блюдо рыба", kk: "Гриль-балығы", en: "Grill — fish" },
      "hot-main": { ru: "Горячие блюда", kk: "Ыстық тағамдар", en: "Hot dishes" },
      bird: { ru: "Блюдо из птицы", kk: "Құс тағамдары", en: "Poultry" },
      pizza: { ru: "Пицца", kk: "Пицца", en: "Pizza" },
      burgers: { ru: "Бургеры", kk: "Бургерлер", en: "Burgers" },
      kids: { ru: "Детское меню", kk: "Балалар мәзірі", en: "Kids menu" },
      breakfast: { ru: "Завтраки", kk: "Таңғы ас", en: "Breakfast" },
      preorder: { ru: "Блюда на заказ", kk: "Алдын ала тапсырыс", en: "Preorder dishes" },
      sides: { ru: "Гарниры", kk: "Гарнирлер", en: "Sides" },
      desserts: { ru: "Десерты", kk: "Десерттер", en: "Desserts" },
      bread: { ru: "Хлебные изделия", kk: "Нан өнімдері", en: "Bakery" },
      // Bar
      "bar-drinks": { ru:"Напитки", kk:"Сусындар", en:"Drinks" },
      "bar-water": { ru:"Вода", kk:"Су", en:"Water" },
      "bar-teas": { ru:"Элитные чаи (1 л)", kk:"Элиталы шайлар (1 л)", en:"Premium teas (1 L)" },
      "bar-auth-teas": { ru:"Авторские чаи (1 л)", kk:"Авторлық шайлар (1 л)", en:"Signature teas (1 L)" },
      "bar-tea-addons": { ru:"К чаю", kk:"Шайға қосымша", en:"Tea add‑ons" },
      "bar-alc-cocktails": { ru:"Алкогольные коктейли", kk:"Алкогольді коктейльдер", en:"Alcoholic cocktails" },
      "bar-cigarettes": { ru:"Сигареты", kk:"Темекі", en:"Cigarettes" },
      "bar-nonalc-cocktails": { ru:"Безалкогольные коктейли", kk:"Алкогольсіз коктейльдер", en:"Non‑alcoholic cocktails" },
      "bar-lemonades": { ru:"Лимонады", kk:"Лимонадтар", en:"Lemonades" },
      "bar-fresh": { ru:"Фреш 0.33", kk:"Фреш 0.33", en:"Fresh juice 0.33" },
      "bar-coffee": { ru:"Кофе", kk:"Кофе", en:"Coffee" },
      "bar-liquers": { ru:"Настойки и ликёры (50 мл)", kk:"Тұнбалар мен ликерлер (50 мл)", en:"Liqueurs (50 ml)" },
      "bar-cognac-fr": { ru:"Французский коньяк (50 мл)", kk:"Француз коньягі (50 мл)", en:"French cognac (50 ml)" },
      "bar-cognac-am": { ru:"Армянский коньяк (50 мл)", kk:"Армян коньягі (50 мл)", en:"Armenian brandy (50 ml)" },
      "bar-cognac-kz": { ru:"Казахстанский коньяк (50 мл)", kk:"Қазақстан коньягі (50 мл)", en:"Kazakhstani cognac (50 ml)" },
      "bar-beer-bottled": { ru:"Бутылочное пиво", kk:"Бөтелкедегі сыра", en:"Bottled beer" },
      "bar-beer-draft": { ru:"Разливное пиво (0.5)", kk:"Құймалы сыра (0.5)", en:"Draft beer (0.5)" },
      "bar-beer-snacks": { ru:"К пиву", kk:"Сыраға", en:"Beer snacks" },
      "bar-vodka": { ru:"Водка (50 мл)", kk:"Арақ (50 мл)", en:"Vodka (50 ml)" },
      "bar-wine-spain-red": { ru:"Испания — Красные вина", kk:"Испания — Қызыл шараптар", en:"Spain — Red wines" },
      "bar-wine-spain-white": { ru:"Испания — Белые вина", kk:"Испания — Ақ шараптар", en:"Spain — White wines" },
      "bar-wine-italy-red": { ru:"Италия — Красные вина", kk:"Италия — Қызыл шараптар", en:"Italy — Red wines" },
      "bar-wine-italy-white": { ru:"Италия — Белые вина", kk:"Италия — Ақ шараптар", en:"Italy — White wines" },
      "bar-wine-nz-red": { ru:"Новая Зеландия — Красные вина", kk:"Жаңа Зеландия — Қызыл шараптар", en:"New Zealand — Red wines" },
      "bar-wine-nz-white": { ru:"Новая Зеландия — Белые вина", kk:"Жаңа Зеландия — Ақ шараптар", en:"New Zealand — White wines" },
      "bar-wine-france-red": { ru:"Франция — Красные вина", kk:"Франция — Қызыл шараптар", en:"France — Red wines" },
      "bar-wine-france-white": { ru:"Франция — Белые вина", kk:"Франция — Ақ шараптар", en:"France — White wines" },
      "bar-wine-georgia-red": { ru:"Грузия — Красные вина", kk:"Грузия — Қызыл шараптар", en:"Georgia — Red wines" },
      "bar-wine-georgia-white": { ru:"Грузия — Белые вина", kk:"Грузия — Ақ шараптар", en:"Georgia — White wines" },
      "bar-wine-chile-white": { ru:"Чили — Белые вина", kk:"Чили — Ақ шараптар", en:"Chile — White wines" },
      "bar-wine-chile-red": { ru:"Чили — Красные вина", kk:"Чили — Қызыл шараптар", en:"Chile — Red wines" },
      "bar-wine-austria-red": { ru:"Австрия — Красные вина", kk:"Австрия — Қызыл шараптар", en:"Austria — Red wines" },
      "bar-wine-austria-white": { ru:"Австрия — Белые вина", kk:"Австрия — Ақ шараптар", en:"Austria — White wines" },
      "bar-wine-australia-red": { ru:"Австралия — Красные вина", kk:"Австралия — Қызыл шараптар", en:"Australia — Red wines" },
      "bar-wine-australia-white": { ru:"Австралия — Белые вина", kk:"Австралия — Ақ шараптар", en:"Australia — White wines" },
      "bar-wine-germany-red": { ru:"Германия — Красные вина", kk:"Германия — Қызыл шараптар", en:"Germany — Red wines" },
      "bar-wine-germany-white": { ru:"Германия — Белые вина", kk:"Германия — Ақ шараптар", en:"Germany — White wines" },
      "bar-white-wine-1": { ru:"Белые вина (Португалия/Испания/Новая Зеландия)", kk:"Ақ шараптар (Португалия/Испания/Жаңа Зеландия)", en:"White wines (PT/ES/NZ)" },
      "bar-scotch": { ru:"Шотландский виски (50 мл)", kk:"Шотланд вискиі (50 мл)", en:"Scotch whisky (50 ml)" },
      "bar-single-malt": { ru:"Односолодовый виски (50 мл)", kk:"Бір салтты виски (50 мл)", en:"Single malt whisky (50 ml)" },
      "bar-jameson": { ru:"Jameson Family (50 мл)", kk:"Jameson (50 мл)", en:"Jameson family (50 ml)" },
      "bar-bourbon": { ru:"Бурбон (50 мл)", kk:"Бурбон (50 мл)", en:"Bourbon (50 ml)" },
      "bar-red-wine-1": { ru:"Красные вина (Грузия/Франция/Чили/Австрия/Италия)", kk:"Қызыл шараптар (Грузия/Франция/Чили/Австрия/Италия)", en:"Red wines (GE/FR/CL/AT/IT)" },
      "bar-white-wine-2": { ru:"Белые вина (Грузия/Франция/Чили/Австрия/Италия)", kk:"Ақ шараптар (Грузия/Франция/Чили/Австрия/Италия)", en:"White wines (GE/FR/CL/AT/IT)" },
      "bar-red-wine-2": { ru:"Красные вина (Португалия/Испания/Новая Зеландия)", kk:"Қызыл шараптар (Португалия/Испания/Жаңа Зеландия)", en:"Red wines (PT/ES/NZ)" },
      "bar-aperitifs": { ru:"Аперитивы (100 мл)", kk:"Апперитивтер (100 мл)", en:"Aperitifs (100 ml)" },
      "bar-sparkling": { ru:"Игристые вина (0.75 л)", kk:"Газдалған шараптар (0.75 л)", en:"Sparkling (0.75 L)" },
      "bar-tequila": { ru:"Текила (50 мл)", kk:"Текила (50 мл)", en:"Tequila (50 ml)" },
      "bar-gin": { ru:"Джин (50 мл)", kk:"Джин (50 мл)", en:"Gin (50 ml)" },
      "bar-rum": { ru:"Кубинский ром (50 мл)", kk:"Куба ромы (50 мл)", en:"Cuban rum (50 ml)" }
    }
  }
};

// Локальные доп. переводы для нового упрощённого набора категорий/блюд.
try {
  i18n.menu = i18n.menu || {};
  i18n.menu.categories = i18n.menu.categories || {};
  i18n.menu.items = i18n.menu.items || {};
  i18n.menu.descs = i18n.menu.descs || {};

  i18n.menu.categories.main = {
    ru: 'Вторые блюда',
    kk: 'Екінші тағамдар',
    en: 'Main courses'
  };

  i18n.menu.items.main = Object.assign({}, i18n.menu.items.main || {}, {
    'Цыпленок с пюре и зеленым луком': {
      ru: 'Цыпленок с пюре и зеленым луком',
      kk: 'Картоп езбесі мен көк пияз қосылған балапан еті',
      en: 'Chicken with mashed potatoes and green onions'
    },
    'Семга с фруктовым салатом': {
      ru: 'Семга с фруктовым салатом',
      kk: 'Жеміс салатымен берілетін албырт',
      en: 'Salmon with fruit salad'
    },
    'Спагетти «Болоньезе»': {
      ru: 'Спагетти «Болоньезе»',
      kk: 'Спагетти «Болоньезе»',
      en: 'Spaghetti Bolognese'
    },
    'Фетучини с курицей': {
      ru: 'Фетучини с курицей',
      kk: 'Тауық еті қосылған фетучини',
      en: 'Fettuccine with chicken'
    }
  });

  i18n.menu.descs.main = Object.assign({}, i18n.menu.descs.main || {}, {
    'куриная грудка, ножка филе, соус «Жу»': {
      ru: 'куриная грудка, ножка филе, соус «Жу»',
      kk: 'тауық төсі, сан еті, «Жу» соусы',
      en: 'chicken breast, thigh fillet, jus sauce'
    },
    'семга, фруктовый салат по сезону, соус «Средиземноморский»': {
      ru: 'семга, фруктовый салат по сезону, соус «Средиземноморский»',
      kk: 'албырт, маусымдық жеміс салаты, «Жерорта теңізі» соусы',
      en: 'salmon, seasonal fruit salad, Mediterranean sauce'
    },
    'бон филе, айсберг, помидор, сыр, лук репчатый, соус «Секретный»': {
      ru: 'бон филе, айсберг, помидор, сыр, лук репчатый, соус «Секретный»',
      kk: 'сиыр филесі, айсберг, қызанақ, ірімшік, пияз, «Құпия» соусы',
      en: 'beef fillet, iceberg lettuce, tomato, cheese, onion, Secret sauce'
    },
    'куриное филе, репчатый лук, шампиньоны, сливки, зелень': {
      ru: 'куриное филе, репчатый лук, шампиньоны, сливки, зелень',
      kk: 'тауық филесі, пияз, шампиньондар, кілегей, көк',
      en: 'chicken fillet, onion, mushrooms, cream, greens'
    },
    'классический салат с хрустящим салатом айсберг и традиционным соусом «Цезарь» с куриным филе на гриле': {
      ru: 'классический салат с хрустящим салатом айсберг и традиционным соусом «Цезарь» с куриным филе на гриле',
      kk: 'қытырлақ айсберг пен дәстүрлі «Цезарь» соусы қосылған гриль тауық еті бар классикалық салат',
      en: 'classic salad with crispy iceberg lettuce, traditional Caesar dressing, and grilled chicken fillet'
    },
    'комбинация из хрустящих овощей и свежей зелени с греческим сыром фетакса с соусом «Цитронет»': {
      ru: 'комбинация из хрустящих овощей и свежей зелени с греческим сыром фетакса с соусом «Цитронет»',
      kk: 'қытырлақ көкөністер мен балғын шөптер, грек фетакса ірімшігі және «Цитронет» соусы',
      en: 'a combination of crisp vegetables and fresh greens with Greek fetaxa cheese and citronette dressing'
    }
  });
} catch (e) {
  console.warn('menu.js i18n patch error', e);
}
