/* ===== Dataset (Категории и блюда) + приложение ===== */
const MENU = [
  { id: 'cold', name: 'Холодные закуски', color: '#e6f4ea',img: 'img/cold.png', items: [
    { n:'Мясное плато', p:12500, d:'жая, казы, язык' },
    { n:'Рыбное плато', p:15000, d:'копченый лосось, масляная рыба эсколар, угорь' },
    { n:'Кавказская закуска', p:5490, d:'огурцы, свежие помидоры, перец болгарский, фетакса, маслины, зелень' },
    { n:'Ассорти соленья', p:6100, d:'Квашеная капуста, черри, маринованные корнишоны, сельдь малосольная, грибы маринованные, хлеб ржаной, лимон, зелень' },
    { n:'Рулетики из кабачков', p:2800 },
    { n:'Сырное ассорти', p:5600 },
    { n:'Фруктовая нарезка маленькая', p:5100 },
    { n:'Фруктовая нарезка на зеркале (средняя)', p:10600 },
    { n:'Фруктовая нарезка на зеркале (большая)', p:18000 },
  ]},
  { id: 'hot-app', name: 'Горячие закуски', color: '#fff1e6', img: 'img/hot.png', items: [
    { n:'Королевские креветки', p:5400 },
    { n:'Крылышки «Sweet chili»', p:3300, d:'Хрустящие куриные крылышки в соусе из лайма и чили' },
    { n:'Острые куриные крылышки BBQ', p:3500 },
    { n:'Спринг роллы с курицей', p:3300, d:'куриная грудка, морковь, огурцы, перец светофор, айсберг, чеснок, соус «Sweet chili»' },
    { n:'Спринг роллы с креветками острый', p:4300, d:'креветки, пекинская капуста, морковь, дунганский перец, соус чили' },
    { n:'Тортилья с курицей и сыром', p:2200 },
  ]},
  { id: 'beer', name: 'Пивные сеты', color: '#ffe7ea', img: 'img/ht.png', items: [
    { n:'Пивной сеты № 1', p:7600, d:'креветки, куриные крылышки, бараньи семечки, чипсы, черви, тар-тар и соусы для барбекю' },
    { n:'Пивной сеты № 2', p:5200, d:'чечил, чесночные гренки, картофель фри, куриные крылышки, червь, чесночный соус и кетчуп' },
  ]},
  { id: 'salads', name: 'Салаты', color: '#efe9ff', img: 'img/27.png', items: [
    { n:'Легкий салат свеклой и козьим сыром', p:3300, d:'свекла отварная, микс зелени, черри, сыр «Сертаки», соус медово-горчичный' },
    { n:'Салат с угрем в кисло-сладком соусе', p:3400, d:'микс салата с угрём и апельсином, соус из чили и лайма' },
    { n:'Свежий салат', p:2100, d:'свежие огурцы, помидоры, смешанный салат, болгарский перец' },
    { n:'Греческий салат с сыром «Фета»', p:2500, d:'овощи и зелень с фетаксой, соус «Цитронет»' },
    { n:'Цезарь с курицей', p:3200, d:'курица, айсберг, сухари, соус «Цезарь»' },
    { n:'Цезарь с креветками', p:3500, d:'креветки, айсберг, сухари, соус «Цезарь»' },
    { n:'Салат с семгой и сыром «Креметта»', p:3800, d:'салатные листья, лола росса, руккола, огурцы, перец, свекла, черри, семга, сыр «Креметта», лимон, оливковое масло' },
  ]},
  { id: 'warm-salads', name: 'Тёплые салаты', color: '#fff8e1', img: 'img/26.png', items: [
    { n:'Тёплый салат с ростбифом', p:3600, d:'микс салата, ростбиф, шампиньоны, авокадо, черри, «Пармезан»' },
    { n:'Салат «Пиканте» с рукколой', p:3200, d:'микс салата с овощами, телятиной в мексиканском соусе, руккола' },
    { n:'Баклажаны в кляре', p:2600 },
    { n:'Тёплый салат с баклажаном и мясом', p:3200, d:'бон филе, баклажаны, черри, микс салата, сыр фета, соус «Бульгоги»' },
    { n:'Шёлковый путь', p:3600, d:'баклажан, говядина, помидоры, перец, салаты, кунжут, соус чили' },
    { n:'Салат с языком и картофелем пай', p:2800, d:'язык, корнишоны, яйцо, перец, картофель пай, шампиньоны' },
    { n:'Филе утки с карамелизированной грушей', p:3800, d:'утиная грудка, микс салата, груша, черри, ореховый соус' },
    { n:'Салат WALL STREET', p:3200, d:'конина, апельсины, микс салата, черри, картофель пай, соус «Demi-glace», орех' },
  ]},
  { id: 'soups', name: 'Супы', color: '#e6f3ff', img: 'img/5.png', items: [
    { n:'Национальный суп', p:2100 },
    { n:'Суп лапша с курицей', p:1700 },
    { n:'Суп чечевичный', p:1900 },
    { n:'Тыквенный суп в азиатском стиле с креветками', p:2700, d:'тыква, креветки, кокосовое молоко, имбирь, специи' },
    { n:'Пельмени с бульоном по-домашнему', p:1799 },
    { n:'Минестроне со шпинатом и нутом', p:1700, d:'овощи, шпинат, нут, «Пармезан»' },
    { n:'Минестроне с перепелкой', p:2100 },
    { n:'Суп с телятиной', p:1800, d:'вырезка, картофель, морковь, брокколи, перепелиное яйцо, специи, зелень' },
    { n:'Борщ', p:1800, d:'говядина, капуста, свекла, морковь, сметана, пампушки' },
    { n:'Суп с фасолью (острый)', p:1950, d:'филе говядины, лук, перец, помидор, фасоль, специи' },
    { n:'Уха из красной рыбы', p:2200, d:'рыба с овощами и чесночными гренками' },
    { n:'Азиатский острый суп с лапшой', p:2200, d:'домашняя лапша, телятина, перцы, томаты' },
  ]},
  { id: 'pasta', name: 'Пасты', color: '#f3f4f6', img: 'img/13.png', items: [
    { n:'Фетучини с курицей', p:3600, d:'куриное филе, лук, шампиньоны, сливки, зелень' },
    { n:'Фетучини с креветками', p:4100, d:'креветки, лук, шампиньоны, сливки, зелень' },
    { n:'Карбонара из говядины', p:3800 },
    { n:'Фарфалле с семгой', p:4500 },
    { n:'Лазанья', p:3500 },
    { n:'Паста Алио и олио', p:2600 },
    { n:'Спагетти «Болоньезе»', p:3600, d:'бон филе, салат, помидор, сыр, лук, соус «Секретный»' },
  ]},
  { id: 'korean', name: 'Корейская кухня', color: '#ffe4e6', img: 'img/14.png', items: [
    { n:'Том-ям', p:3800 },
    { n:'Рамен с говядиной', p:2600 },
    { n:'Рамен с курицей', p:2400 },
    { n:'Пук-тяй', p:2000 },
    { n:'Поккедянь', p:2000 },
  ]},
  { id: 'k-salads', name: 'Корейские салаты', color: '#fde68a', img: 'img/ks.png', items: [
    { n:'Хе из баранины', p:3200 },
    { n:'Хе из требухи', p:2800 },
    { n:'Хе из рыбы', p:2400 },
  ]},
  { id: 'grill-meat', name: 'Гриль-блюдо мясо', color: '#dcfce7', img: 'img/meat.png', items: [
    { n:'Пеппер стейк с картофелем по-деревенски', p:6800, d:'вырезка со смесью 5 перцев' },
    { n:'Стейк Рибай на косточке «Тиано»', p:7400, d:'мраморная говядина, специальный маринад' },
    { n:'Медальоны с картофельным пюре и соусом «Demi-glace»', p:5400, d:'вырезка, пюре, шампиньоны, шпинат' },
    { n:'Овощной рулет с телятиной', p:4900, d:'бон филе, цукини, баклажан, помидоры, перец, лук, «Моцарелла», «Демиглас»' },
  ]},
  { id: 'grill-fish', name: 'Гриль-блюдо рыба', color: '#cffafe', img: 'img/fish.png', items: [
    { n:'Семга с фруктовым салатом', p:6500, d:'соус «Средиземноморский»' },
    { n:'Дорадо на гриле', p:4800, d:'соус из ароматного масла и белого вина' },
    { n:'Судак под польским соусом с фрэш салатом', p:4800, d:'листья салата, лола росса, черри, оливковое масло, зелень' },
    { n:'Филе форели с кабачками и соусом «Биск»', p:4200 },
    { n:'Сибас на гриле с цветной капустой', p:4500 },
    { n:'Сибас с креветками и сыром фета', p:4200, d:'сибас, креветки, «Фетакса», лимон, цукини, баклажан, черри, перец, лук, сливочный соус' },
  ]},
  { id: 'hot-main', name: 'Горячие блюда', color: '#fee2e2', img: 'img/gril.png', items: [
    { n:'Мясо по-Строгановски с рисом', p:4800, d:'бон филе, лук, шампиньоны, сливки, «Пармезан»' },
    { n:'Телятина с овощами и пюре', p:4800, d:'бон филе, перец, лук, сливки, пюре' },
    { n:'Бон филе со свеклой', p:5000, d:'микс зелени, соус «Демиглас»' },
    { n:'Филе «Миньон» с овощами «Тиано»', p:5000, d:'овощи, соус маринара, «Пармезан»' },
  ]},
  { id: 'bird', name: 'Блюдо из птицы', color: '#e5e7eb', img: 'img/11.png', items: [
    { n:'Куриная грудка в сливовом соусе с брокколи', p:4100 },
    { n:'Цыплёнок с пюре и зелёным луком', p:3900 },
    { n:'Кордон блю', p:4100, d:'куриное филе, ветчина, «Моцарелла»' },
    { n:'Курица терияки с рисом', p:3800, d:'куриная грудка, овощи, соус «Терияки», кунжут, рис' },
    { n:'Курица карри с овощами и рисом', p:3800 },
    { n:'Жульен с курицей и грибами', p:3200 },
  ]},
  { id: 'pizza', name: 'Пицца', color: '#e0e7ff', img: 'img/21.png', items: [
    { n:'Пепперони', p:3400, d:'салями, «Голландский», помидоры, соус орегано' },
    { n:'Мексиканская', p:3800, d:'фарш говядина, «Голландский», соус, перец чили' },
    { n:'Фрикассе', p:4100, d:'куриная грудка, шампиньоны, «Голландский», сливочный соус' },
    { n:'Пицца грибная', p:3000, d:'сыр, шампиньоны, пицца-соус' },
    { n:'Пицца ассорти', p:4100, d:'сыр, казы, колбаса, курица, помидоры, пицца-соус' },
    { n:'Маргарита', p:3400, d:'сыр, помидоры, пицца-соус' },
  ]},
  { id: 'burgers', name: 'Бургеры', color: '#fae8ff', img: 'img/1.png', items: [
    { n:'Шеф бургер', p:3100, d:'бон филе, айсберг, помидор, сыр, лук, соус «Секретный»' },
    { n:'Веган бургер', p:2000, d:'картофель, лук, помидор, айсберг, сыр, соус «Секретный»' },
  ]},
  { id: 'kids', name: 'Детское меню', color: '#fef3c7', img: 'img/3.png', items: [
    { n:'Наггетсы', p:2800 },
    { n:'Сырные палочки', p:2000 },
    { n:'Котлеты с пюре', p:2000 },
  ]},
  { id: 'breakfast', name: 'Завтраки', color: '#ecfeff', img: 'img/bf.png', items: [
    { n:'Омлет с сыром', p:1500 },
    { n:'Омлет с овощами', p:1200 },
    { n:'Клаб-сэндвич с курицей', p:1400, d:'тостер, курица, помидоры, яйцо, сыр, листья салата' },
    { n:'Шакшука', p:2200, d:'яйцо, помидоры, лук, чеснок, тостер' },
    { n:'Солнечный день', p:1400, d:'яичница-глазунья и сосиски' },
  ]},
  { id: 'preorder', name: 'Блюда на заказ', color: '#f1f5f9', img: 'img/pre.png', items: [
    { n:'Сый табак', p:85000, d:'казы-карта, жал-жая, жамбас' },
    { n:'Ет тамак', p:30000, d:'мясо баранины, говядины, курдюк' },
    { n:'Ет тамак (конина/говядина/казы)', p:32000, d:'мясо конины, говядины, казы' },
    { n:'Ет тамак на 10 человек', p:56000, d:'мясо конины, говядины, казы' },
    { n:'Королевская доска', p:36000, d:'рибай, медальоны, T-бон, соус «Демиглас»' },
    { n:'Царское мясо', p:28000, d:'рёбра говядины, томлёные с картофелем и розмарином' },
    { n:'Сет из рыбных стейков', p:39000, d:'семга, радужная форель, сазан, судак' },
    { n:'Праздничный плов из 4-х видов масла', p:25000, d:'баранина, кунжутное, оливковое, сливочное и растительное масла' },
    { n:'Куырдак из баранины', p:25000 },
    { n:'Сазан жареный целиком', p:16500 },
  ]},
  { id: 'sides', name: 'Гарниры', color: '#fdf2f8', img: 'img/9.png', items: [
    { n:'Фри', p:1000 },
    { n:'Жареный картофель с грибами', p:1200 },
    { n:'Овощи на гриле', p:1200 },
    { n:'Брокколи в кляре', p:1500 },
    { n:'Цветная капуста в кляре', p:1500 },
    { n:'Картофель по-деревенски', p:1200 },
    { n:'Рис', p:600 },
  ]},
  { id: 'desserts', name: 'Десерты', color: '#f0f9ff', img: 'img/des.png', items: [
    { n:'Тирамису', p:2000 },
    { n:'Круассаны в ассортименте', p:800 },
    { n:'Чизкейк испанский', p:2000 },
    { n:'Медовик', p:1700 },
    { n:'Вупи пай', p:1800 },
    { n:'Фисташковый', p:2100 },
    { n:'Маффин', p:1200 },
    { n:'Казахские сладости', p:4800, d:'жент, сузбе, каункак, финики, курт, халва, иримшик' },
    { n:'Восточные сладости', p:7000, d:'изюм (2 вида), миндаль, кешью, грецкий орех, фисташки, чак-чак, науат, бадам, курага' },
  ]},
  { id: 'bread', name: 'Хлебные изделия', color: '#ede9fe', img: 'img/bre.png', items: [
    { n:'Хлебная корзина', p:1100, d:'кунжутный, с грецким орехом, бородинский, чесночный, гриссини — маковые и сырные' },
    { n:'Белый хлеб', p:300, d:'с грецким орехом и кунжутом' },
    { n:'Бородинский хлеб (чёрный хлеб)', p:300 },
    { n:'Чесночный хлеб', p:350 },
    { n:'Луковый хлеб', p:350 },
    { n:'Баурсаки (предварительный заказ)', p:1400 },
    { n:'Самса из говядины (5 штук)', p:1600 },
    { n:'Чебуреки (5 штук)', p:1600 },
    { n:'Пирожки с сёмгой (5 штук)', p:1600 },
    { n:'Пирожки с капустой (5 штук)', p:1200 },
  ]},
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
    { n:'Японская липа', p:2300 },
    { n:'Дикий фрукт', p:2300 },
    { n:'Зелёная сенча', p:2300 },
    { n:'Эрл Грей', p:2300 },
    { n:'Жасмин', p:2300 },
    { n:'Клубника со сливками', p:2300 },
    { n:'Земляника со сливками', p:2300 },
    { n:'Карамель со сливками', p:2300 },
    { n:'Манговый чай', p:2300 },
    { n:'Ассам', p:2300 },
    { n:'Ройбуш Ревень-ягода', p:2300 },
    { n:'Синий барбарис', p:2300 },
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
    { n:'Organic Honey Dew 0.5', p:4000 },
    { n:'Tsintao 0.33', p:2200 },
    { n:'London Pride 0.5', p:4000 },
    { n:'Estrella Galicia 0.33', p:3000 },
    { n:'Coors 0.33', p:2500 },
    { n:'Budweiser Budvar 0.33', p:2700 },
    { n:'Blue Moon 0.33', p:2500 },
    { n:'Paulaner Munchiner Hell 0.5', p:4000 },
    { n:'Paulaner Weissbier 0.5', p:4000 },
    { n:'Bud 0.33', p:1500 },
    { n:'Blanc', p:1500 },
    { n:'Holsten Light 0.5', p:1300 },
  ]},
  { id: 'bar-beer-draft', name: 'Разливное пиво (0.5)', color: '#f9fafb', img: '', items: [
    { n:'Немецкое', p:1800 },
    { n:'Дербес «Прага»', p:1600 },
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
  { id: 'bar-white-wine-1', name: 'Белые вина (Португалия/Испания/Новая Зеландия)', color: '#f9fafb', img: '', items: [
    { n:'Rei Do Minho Vinho Verde (сух.)', p:10500 },
    { n:'Circus Number 2 Strong (сух.)', p:15000 },
    { n:'Campo Viejo Blanco (сух.)', p:12000 },
    { n:'Campo Viejo White (сух.)', p:12000 },
    { n:'San Valentin (полуслад.)', p:16000 },
    { n:'Brancott Estate Sauvignon Blanc', p:22000 },
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
  { id: 'bar-red-wine-1', name: 'Красные вина (Грузия/Франция/Чили/Австрия/Италия)', color: '#f9fafb', img: '', items: [
    { n:'Алазанская долина (полуслад.)', p:9000 },
    { n:'Киндзмараули (полуслад.)', p:12000 },
    { n:'Хванчкара (полуслад.)', p:22000 },
    { n:'Саперави (сух.)', p:10000 },
    { n:'Тамада Пиросмани (полуслад.)', p:6500 },
    { n:'Comte Allexandre (полуслад.)', p:10500 },
    { n:'Comte Allexandre (полусух.)', p:10500 },
    { n:'Chateau Timberlay (сух.)', p:22000 },
    { n:'Каберне Совиньон', p:12000 },
    { n:'Undurraga', p:16000 },
    { n:'Domaene Gobelsburg', p:23000 },
    { n:'Fox Grove Cabernet', p:13000 },
    { n:'Villa Antinori Rosso (полусл.)', p:40000 },
    { n:'Ruffino Chianti-Toscana (сух.)', p:23000 },
    { n:'Cenate Vecchie (сух.)', p:18000 },
    { n:'Villa Cardini Chianti (сух.)', p:12000 },
  ]},
  { id: 'bar-white-wine-2', name: 'Белые вина (Грузия/Франция/Чили/Австрия/Италия)', color: '#f9fafb', img: '', items: [
    { n:'Алазанская долина (полуслад.)', p:9000 },
    { n:'Твиши (полуслад.)', p:9000 },
    { n:'Цинандали (сух.)', p:9000 },
    { n:'Comte Allexandre (полуслад.)', p:10500 },
    { n:'Domine Sainte Cecile-Сира (сух.)', p:22000 },
    { n:'Domine Sainte Cecile-Sauvignon Blanc (полуслад.)', p:22000 },
    { n:'Chateau Timberlay (сух.)', p:22000 },
    { n:'Chablis (сух.)', p:25000 },
    { n:'El Chivo (полуслад.)', p:10500 },
    { n:'El Chivo (сух.)', p:10500 },
    { n:'Domaene Gobelsburg', p:23000 },
    { n:'Lamella', p:33000 },
    { n:'Fox Grove Chardonnay', p:13000 },
    { n:'Villa Antinori Bianco', p:22000 },
    { n:'Ruffino Orvieto Classico', p:23000 },
  ]},
  { id: 'bar-red-wine-2', name: 'Красные вина (Португалия/Испания/Новая Зеландия)', color: '#f9fafb', img: '', items: [
    { n:'Bergamota Dao (полуслад.)', p:19000 },
    { n:'Rosso Salento (полуслад.)', p:18000 },
    { n:'Bodegas Canopy Ganadero (сух.)', p:23000 },
    { n:'Bodegas Coral Duero R’Sedas', p:32000 },
    { n:'Terra Linda Гарнача (сух.)', p:15000 },
    { n:'Campo Viejo Tempranillo (полуслад.)', p:15000 },
    { n:'Campo Viejo Reserva', p:30000 },
    { n:'San Valentin (полуслад.)', p:19000 },
    { n:'Brancott Estate Pinot Noir LSTM', p:23000 },
    { n:'Cloudy Bay Pinot Noir 2019', p:150000 },
    { n:'Cloudy Bay Pinot Noir 2022', p:65000 },
    { n:'Nuala Pinot Noir', p:39000 },
    { n:'Villa Maria Reserve Pinot Noir', p:49000 },
    { n:'Villa Maria Private Pinot Noir', p:28000 },
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

/* ===== Telegram config ===== */
// ВНИМАНИЕ: хранить токен в клиенте НЕЛЬЗЯ для публичного сайта (GitHub Pages).
// Я включил прямую отправку для теста (через скрытый iframe). Для продакшена используйте прокси/сервер (см. ниже).
const TELEGRAM_PROXY_URL = ''; // укажите URL вашего серверного endpoint'а, если будет
const TG_DIRECT_TOKEN = '8464068483:AAEiCJ6_xERVQyhP9QPqH8wSrHerPLSAdb0'; // НЕБЕЗОПАСНО в проде
const TG_CHAT_ID = '8265753984';

/* ===== Helpers ===== */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const fmt = v => v.toLocaleString('ru-RU') + ' ₸';

/* ===== State ===== */
const state = {
  tab: 'explore',
  view: 'categories', // 'categories' | 'products'
  activeCategory: MENU[0].id,

  // For "Бар"
  barView: 'categories', // 'categories' | 'products'
  activeBarCategory: null,

  cart: JSON.parse(localStorage.getItem('cart')||'{}')
};

/* ===== Render functions ===== */
function renderCategories(){
  const grid = $('#categoryGrid');
  grid.innerHTML = MENU.map(cat => `
    <button class="category-card" style="background:${cat.color}" data-id="${cat.id}" aria-label="${cat.name}">
      ${cat.img ? `<img class="cimg" src="${cat.img}" alt="${cat.name}" />` : ''}
      <div class="category-name">${cat.name}</div>
      <div class="category-count">${cat.items.length} поз.</div>
    </button>
  `).join('');

  grid.addEventListener('click', e => {
    const card = e.target.closest('.category-card');
    if(!card) return;
    openCategory(card.dataset.id);
    showToast(MENU.find(c=>c.id===state.activeCategory).name);
  });
}

function renderProducts(){
  const cat = MENU.find(c=>c.id===state.activeCategory);
  const list = $('#productList');
  list.innerHTML = `<button class='cat-chip' id='backCats' type='button' role='button' tabindex='0'>${cat.name}</button>` + cat.items
    .filter(filterSearch($('#searchInput').value))
    .map((item) => {
      const key = keyOf(cat.id, item.n);
      const qty = state.cart[key]?.qty || 0;
      return `
      <div class="product" data-key="${key}">
        <div>
          <div class="p-name">${item.n}</div>
          ${item.d ? `<div class="p-desc">${item.d}</div>`:''}
        </div>
        <div class="p-actions">
  <div class="price">${fmt(item.p)}</div>
  <div class="p-controls">
    ${qty ? qtyControl(qty) : `<button class="btn btn-primary add">+</button>`}
  </div>
</div>
      </div>`;
    }).join('');

  // навешиваем обработчик на кнопку "назад"
  const backBtn = document.getElementById('backCats');
  if(backBtn){
    backBtn.addEventListener('click', backToCategories);
    backBtn.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); backToCategories(); }
    });
  }
}

/* ===== Bar rendering ===== */
function renderBarCategories(){
  const grid = document.querySelector('#barCategoryGrid');
  if(!grid) return;
  grid.innerHTML = BAR.map(cat => `
    <button class="category-card" style="background:${cat.color}" data-id="${cat.id}" aria-label="${cat.name}">
      <div class="category-name">${cat.name}</div>
      <div class="category-count">${cat.items.length} поз.</div>
    </button>
  `).join('');

  grid.onclick = (e) => {
    const card = e.target.closest('.category-card');
    if(!card) return;
    openBarCategory(card.dataset.id);
    const cur = BAR.find(c=>c.id===state.activeBarCategory);
    if(cur) showToast(cur.name);
  };
}

function renderBarProducts(){
  const cat = BAR.find(c=>c.id===state.activeBarCategory);
  const list = document.querySelector('#barProductList');
  if(!cat || !list) return;
  const q = (document.querySelector('#barSearchInput')?.value || '');
  list.innerHTML = `<button class='cat-chip' id='backBarCats' type='button' role='button' tabindex='0'>${cat.name}</button>` +
    cat.items.filter(filterSearch(q)).map(item=>{
      const key = keyOf(cat.id, item.n);
      const qty = state.cart[key]?.qty || 0;
      return `
        <div class="product" data-key="${key}">
          <div><div class="p-name">${item.n}</div></div>
          <div class="p-actions">
            <div class="price">${fmt(item.p)}</div>
            <div class="p-controls">
              ${qty ? qtyControl(qty) : `<button class="btn btn-primary add">+</button>`}
            </div>
          </div>
        </div>`;
    }).join('');

  const backBtn = document.getElementById('backBarCats');
  if(backBtn){
    backBtn.addEventListener('click', backToBarCategories);
    backBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); backToBarCategories(); }});
  }
}

function openBarCategory(catId){
  state.activeBarCategory = catId;
  state.barView = 'products';
  document.querySelector('#barCategoryGrid').classList.add('hidden');
  document.querySelector('#barProductList').classList.remove('hidden');
  const si = document.querySelector('#barSearchInput'); if(si) si.value='';
  renderBarProducts();
}

function backToBarCategories(){
  state.barView = 'categories';
  const list = document.querySelector('#barProductList');
  const grid = document.querySelector('#barCategoryGrid');
  if(list) list.classList.add('hidden');
  if(grid) grid.classList.remove('hidden');
}

function qtyControl(qty){
  return `<div class="qty">
    <button class="dec" aria-label="Уменьшить">–</button>
    <span class="q">${qty}</span>
    <button class="inc" aria-label="Увеличить">+</button>
  </div>`
}

function keyOf(catId, name){ return `${catId}__${name}` }

/* ===== Search ===== */
function filterSearch(q){
  q = (q||'').trim().toLowerCase();
  if(!q) return () => true;
  return (item) => (item.n + ' ' + (item.d||'')).toLowerCase().includes(q);
}

/* ===== Cart ===== */
function addToCart(key){
  const [catId, name] = key.split('__');
  const cat = (MENU.find(c=>c.id===catId) || (typeof BAR!=='undefined' ? BAR.find(c=>c.id===catId) : null));
  if(!cat){ console.warn('Unknown category for key', key); return; }
  const item = (cat.items || []).find(i=>i.n===name);
  if(!item){ console.warn('Unknown item for key', key); return; }
  state.cart[key] = state.cart[key] || { name:item.n, price:item.p, cat:cat.name, qty:0 };
  state.cart[key].qty += 1;
  persistCart();
  updateCartBadge();
  refreshVisibleList();
}

function changeQty(key, delta){
  if(!state.cart[key]) return;
  state.cart[key].qty += delta;
  if(state.cart[key].qty <= 0) delete state.cart[key];
  persistCart();
  updateCartBadge();
  refreshVisibleList();
}

function persistCart(){
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

function updateCartBadge(){
  const count = Object.values(state.cart).reduce((s,i)=>s+i.qty,0);
  const badge = $('#cartBadge');
  if(count>0){ badge.hidden=false; badge.textContent=count } else { badge.hidden=true }
  if(state.view==='products') renderProducts();
  renderCart();
  $('#btnCheckout').disabled = count===0;
}

function renderCart(){
  const list = $('#cartList');
  const items = Object.entries(state.cart);
  const empty = $('#emptyCart');
  if(items.length===0){ empty.hidden=false; list.innerHTML=''; $('#cartTotal').textContent = fmt(0); return; }
  empty.hidden=true;
  list.innerHTML = items.map(([key, it]) => `
    <div class="cart-item" data-key="${key}">
      <div>
        <div class="p-name">${it.name}</div>
        <div class="meta">${it.cat}</div>
      </div>
      <div class="price">${fmt(it.price)}</div>
      <div class="qty">${qtyControl(it.qty)}</div>
      <button class="remove">× Удалить</button>
    </div>
  `).join('');

  $('#cartTotal').textContent = fmt(sumTotal());
}

function sumTotal(){
  return Object.values(state.cart).reduce((s,i)=>s+i.price*i.qty,0);
}

/* ===== View & Tabs ===== */
function openCategory(catId){
  state.activeCategory = catId;
  state.view = 'products';
  $('#categoryGrid').classList.add('hidden');
  $('#productList').classList.remove('hidden');
  const si = $('#searchInput'); if(si) si.value='';
  renderProducts();
}

function backToCategories(){
  state.view = 'categories';
  $('#productList').classList.add('hidden');
  $('#categoryGrid').classList.remove('hidden');
}

function switchTab(tab){
  state.tab = tab;
  if(tab==='explore'){ backToCategories(); }
  if(tab==='bar'){ if(state.activeBarCategory===null && typeof BAR!=='undefined' && BAR.length){ state.activeBarCategory = BAR[0].id; } backToBarCategories(); }
  $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  $$('.screen').forEach(s=>s.classList.remove('screen-active'));
  $('#screen-'+tab).classList.add('screen-active');
}

/* ===== Toast ===== */
let toastTimer = null;
function showToast(text){
  const t = $('#toast'); t.textContent = text;
  t.classList.add('toast-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('toast-show'), 1400);
}

/* ===== Success screen ===== */
function showSuccess(){ $('#success').hidden = false; }
function hideSuccess(){ $('#success').hidden = true; switchTab('explore'); }

/* ===== Order & Telegram helpers ===== */
// ==== Новый, красивый текст заказа для Telegram (HTML) ====
function buildOrderMessage(fields){
  const items = Object.values(state.cart);
  const total = sumTotal();
  const dt = new Date();
  const when = dt.toLocaleString('ru-RU');

  const safe = (s)=> (s||'').toString().replace(/[<>]/g,'');

  const itemsText = items.length
    ? items.map(i => `• ${safe(i.name)} × ${i.qty} — ${fmt(i.price * i.qty)}`).join(' • ')
    : '• —';

  return [
    `🧾 <b>Новый заказ</b>`,
    `• 🕒 ${when}`,
    `• 👤 Имя: <b>${safe(fields.cname)}</b>`,
    `• 🏨 Комната: <b>${safe(fields.room)}</b>`,
    fields.comment ? `• 💬 Комментарии: ${safe(fields.comment)}` : '• 💬 Комментарии: —',
    '',
    '• <b>Состав:</b>',
    itemsText,
    '',
    `• <b>Итого:</b> ${fmt(total)}`
  ].join(' • ');
}

async function sendOrderToTelegram(text){
  if(TELEGRAM_PROXY_URL){
    const res = await fetch(TELEGRAM_PROXY_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' })
    });
    if(!res.ok) throw new Error('Proxy error '+res.status);
    return true;
  }
  if(typeof TG_DIRECT_TOKEN === 'string' && TG_DIRECT_TOKEN.length>0){
    return new Promise((resolve)=>{
      const iframeName = 'tgframe_'+Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName; iframe.width=0; iframe.height=0; iframe.style.display='none';
      document.body.appendChild(iframe);
      const form = document.createElement('form');
      form.action = `https://api.telegram.org/bot${TG_DIRECT_TOKEN}/sendMessage`;
      form.method = 'GET';
      form.target = iframeName;
      const f1 = Object.assign(document.createElement('input'), {name:'chat_id', value:TG_CHAT_ID});
      const f2 = Object.assign(document.createElement('input'), {name:'text', value:text});
      const f3 = Object.assign(document.createElement('input'), {name:'parse_mode', value:'HTML'});
      form.append(f1,f2,f3);
      document.body.appendChild(form);
      form.submit();
      setTimeout(()=>{ form.remove(); iframe.remove(); resolve(true); }, 1500);
    });
  }
  throw new Error('TELEGRAM_PROXY_URL не задан и прямой способ отключен.');
}

/* ===== Event bindings ===== */

function refreshVisibleList(){
  // re-render current products list (explore or bar)
  try{
    if(state.tab==='explore' && state.view==='products'){ renderProducts(); }
    if(state.tab==='bar' && state.barView==='products'){ renderBarProducts(); }
    // Always refresh cart pane if it's visible
    if(document.querySelector('#cartList') && !document.querySelector('#screen-cart')?.classList?.contains('hidden')){
      renderCart();
    }
  }catch(e){ /* no-op */ }
}
document.addEventListener('click', (e)=>{
  const tab = e.target.closest('.tab');
  if(tab){ switchTab(tab.dataset.tab); return; }

  if(e.target.closest('#backBarCats')){ backToBarCategories(); return; }

  const add = e.target.closest('.add');
  if(add){
    const key = e.target.closest('.product').dataset.key;
    addToCart(key); showToast('Добавлено в корзину');
    return;
  }

  const inc = e.target.closest('.inc');
  const dec = e.target.closest('.dec');
  if(inc || dec){
    const root = e.target.closest('[data-key]');
    const key = root.dataset.key;
    changeQty(key, inc? +1 : -1);
    return;
  }

  const remove = e.target.closest('.remove');
  if(remove){
    const key = e.target.closest('[data-key]').dataset.key;
    delete state.cart[key]; persistCart(); updateCartBadge(); refreshVisibleList(); return;
  }

  if(e.target.closest('#backCats')){ backToCategories(); return; }

  if(e.target.id === 'success'){ hideSuccess(); return; }
  if(e.target.id === 'orderForm'){ $('#orderForm').hidden = true; return; }
});

$('#btnCheckout').addEventListener('click', ()=>{ updateOrderSummary(); $('#orderForm').hidden = false; });
$('#btnBackHome').addEventListener('click', ()=>{ hideSuccess(); });

$('#searchInput').addEventListener('input', ()=> { if(state.view==='products') renderProducts(); });

// Checkout form handlers
function updateOrderSummary(){
  const box = $('#orderSummary');
  const items = Object.values(state.cart);
  box.innerHTML = items.map(i=>`<div class="line"><span>${i.name} × ${i.qty}</span><strong>${fmt(i.price*i.qty)}</strong></div>`).join('')
    + `<div class="line total"><span>Итого</span><strong>${fmt(sumTotal())}</strong></div>`;
}
function closeOrderForm(){ $('#orderForm').hidden = true; }
$('#btnCancelOrder').addEventListener('click', closeOrderForm);
$('#checkoutForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const room = ($('#room').value||'').trim();
  const cname = ($('#cname').value||'').trim();
  const comment = ($('#comment').value||'').trim();
  if(!room || !cname){ showToast('Заполните обязательные поля'); return; }
  const text = buildOrderMessage({room, cname, comment});
  const btn = $('#btnSendOrder'); btn.disabled = true; btn.textContent = 'Отправка…';
  try{
    await sendOrderToTelegram(text);
    state.cart = {}; persistCart(); updateCartBadge();
    closeOrderForm(); showSuccess();
  }catch(err){
    console.error(err); showToast('Не удалось отправить. Настройте прокси.');
  }finally{
    btn.disabled = false; btn.textContent = 'Отправить';
  }
});

/* ===== Init ===== */
renderCategories();
renderProducts();
renderBarCategories();
if(state.activeBarCategory===null && typeof BAR!=='undefined' && BAR.length){ state.activeBarCategory = BAR[0].id; }
renderBarProducts();
updateCartBadge();
switchTab('explore');
backToCategories();

// Defensive: make sure modals are hidden on load
document.addEventListener('DOMContentLoaded', ()=>{
  const s = document.getElementById('success'); if(s) s.hidden = true;
  const o = document.getElementById('orderForm'); if(o) o.hidden = true;
});

// Bar search input
const _barSI = document.querySelector('#barSearchInput');
if(_barSI){ _barSI.addEventListener('input', ()=>{ if(state.barView==='products') renderBarProducts(); }); }
