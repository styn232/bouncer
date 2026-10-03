export interface LocationHierarchy {
  province: string;
  city: string;
  type?: 'City' | 'Municipality' | 'Town Council' | 'Local Board' | 'Growth Point' | 'Settlement';
  subLocations: string[];
}

export const ZIMBABWE_PROVINCE_NAMES = [
  'Harare Metropolitan',
  'Bulawayo Metropolitan',
  'Midlands',
  'Manicaland',
  'Masvingo',
  'Mashonaland West',
  'Mashonaland East',
  'Mashonaland Central',
  'Matabeleland North',
  'Matabeleland South'
] as const;

export type ZimbabweProvince = (typeof ZIMBABWE_PROVINCE_NAMES)[number];

export interface ZimbabweProvinceMeta {
  name: ZimbabweProvince;
  citiesCount: number;
}

export const ZIMBABWE_PROVINCES: ZimbabweProvinceMeta[] = [
  { name: 'Harare Metropolitan', citiesCount: 3 },
  { name: 'Bulawayo Metropolitan', citiesCount: 1 },
  { name: 'Midlands', citiesCount: 7 },
  { name: 'Manicaland', citiesCount: 7 },
  { name: 'Masvingo', citiesCount: 6 },
  { name: 'Mashonaland West', citiesCount: 9 },
  { name: 'Mashonaland East', citiesCount: 8 },
  { name: 'Mashonaland Central', citiesCount: 6 },
  { name: 'Matabeleland North', citiesCount: 6 },
  { name: 'Matabeleland South', citiesCount: 7 }
];

export const ZIMBABWE_LOCATIONS: LocationHierarchy[] = [
  // ==========================================
  // 1. HARARE METROPOLITAN
  // ==========================================
  {
    province: 'Harare Metropolitan',
    city: 'Harare',
    type: 'City',
    subLocations: [
      // Harare Central
      'CBD',
      'Avenues',
      'Kopje',
      'Rotten Row',
      'Central Area',
      'Causeway',
      'Newlands',
      'Belgravia',
      'Avondale',
      'Milton Park',
      'Eastlea',
      'Belvedere',
      'Arcadia',
      'Kensington',
      'Southerton',
      'Workington',
      'Graniteside',
      // Northern Harare
      'Borrowdale',
      'Borrowdale Brooke',
      'Borrowdale West',
      'Borrowdale North',
      'Helensvale',
      'Vainona',
      'Pomona',
      'Chisipite',
      'Chisipite West',
      'Highlands',
      'Mount Pleasant',
      'Mount Pleasant Heights',
      'Shawasha Hills',
      'Hogerty Hill',
      'Glen Lorne',
      'Mandara',
      'Greendale',
      'Greendale North',
      'Gletwyn',
      'Crowhill',
      'Quinnington',
      'Rolf Valley',
      'Gunhill',
      'Alexandra Park',
      'Hatcliffe',
      'Hatcliffe Extension',
      // Western Harare
      'Mabelreign',
      'Marlborough',
      'Westlea',
      'Warren Park',
      'Warren Park D',
      'Kuwadzana',
      'Kuwadzana Extension',
      'Dzivarasekwa',
      'Dzivarasekwa Extension',
      'Kambuzuma',
      'Mufakose',
      'Highfield',
      'Glen Norah',
      'Glen View',
      'Glen View 1',
      'Glen View 2',
      'Glen View 3',
      'Glen View 7',
      'Budiriro',
      'Budiriro 2',
      'Budiriro 3',
      'Budiriro 4',
      'Budiriro 5',
      'Budiriro 7',
      'Budiriro 8',
      // Southern / Eastern Harare
      'Waterfalls',
      'Hatfield',
      'Prospect',
      'Houghton Park',
      'Mainway Meadows',
      'St Martins',
      'Zimre Park',
      'Sunway City',
      'Msasa',
      'Msasa Park',
      'Mabvuku',
      'Tafara',
      'Sunningdale',
      'Mbare',
      'Rugare'
    ]
  },
  {
    province: 'Harare Metropolitan',
    city: 'Chitungwiza',
    type: 'Municipality',
    subLocations: [
      'Zengeza 1',
      'Zengeza 2',
      'Zengeza 3',
      'Zengeza 4',
      'Zengeza 5',
      'Zengeza 6',
      'Zengeza 7',
      'Zengeza 8',
      'Unit A',
      'Unit B',
      'Unit C',
      'Unit D',
      'Unit E',
      'Unit F',
      'Unit G',
      'Unit H',
      'Unit J',
      'Unit K',
      'Unit L',
      'Unit M',
      'Unit N',
      'Unit O',
      'Unit P',
      'Unit Q',
      'Unit R',
      "St Mary's",
      'Seke',
      'Makoni',
      'Chaminuka',
      'Manyame',
      'Chikwanha',
      'Chigovanyika',
      'Chitungwiza Town Centre'
    ]
  },
  {
    province: 'Harare Metropolitan',
    city: 'Epworth',
    type: 'Local Board',
    subLocations: [
      'Overspill',
      'Domboramwari',
      'Zengeza',
      'Chiedza',
      'Jacha',
      'Epworth Central',
      'Stopover',
      'Muguta',
      'Kambuzuma',
      'Mabvazuva',
      'Southlea Park',
      'Retreat',
      'Borrowdale Brooke Extension',
      'Manyame Park'
    ]
  },
  {
    province: 'Harare Metropolitan',
    city: 'Ruwa',
    type: 'Local Board',
    subLocations: [
      'Ruwa Town Centre',
      'Damofalls',
      'Zimre Park',
      'Windsor Park',
      'Fairview',
      'Clifton Park',
      'Ruwa East',
      'Ruwa West',
      'Norah',
      'Mabvazuva'
    ]
  },

  // ==========================================
  // 2. BULAWAYO METROPOLITAN
  // ==========================================
  {
    province: 'Bulawayo Metropolitan',
    city: 'Bulawayo',
    type: 'City',
    subLocations: [
      // Central
      'CBD',
      'City Centre',
      'Main Street',
      'Barbourfields',
      'Makokoba',
      'Mzilikazi',
      // Northern / Western
      'Suburbs',
      'Hillside',
      'Burnside',
      'Matsheumhlope',
      'Famona',
      'Malindela',
      'Ilanda',
      'Kumalo',
      'Woodville',
      'Bellevue',
      'North End',
      'Parklands',
      // High Density
      'Mpopoma',
      'Pelandaba',
      'Njube',
      'Entumbane',
      'Lobengula',
      'Magwegwe',
      'Luveve',
      'Emganwini',
      'Pumula',
      'Pumula South',
      'Nkulumane',
      'Nketa',
      'Cowdray Park',
      'Mahatshula',
      'Old Pumula',
      'New Luveve',
      'Tshabalala',
      'Emakhandeni'
    ]
  },

  // ==========================================
  // 3. MIDLANDS
  // ==========================================
  {
    province: 'Midlands',
    city: 'Gweru',
    type: 'City',
    subLocations: [
      'CBD',
      'Town Centre',
      'Mkoba 1',
      'Mkoba 2',
      'Mkoba 3',
      'Mkoba 4',
      'Mkoba 5',
      'Mkoba 6',
      'Mkoba 7',
      'Mkoba 8',
      'Mkoba 9',
      'Mkoba 10',
      'Mtapa',
      'Mambo',
      'Senga',
      'Nehosho',
      'Ascot',
      'Ascot Infill',
      'Amaveni',
      'Shamrock Park',
      'Athlone',
      'Kopje',
      'Northlea',
      'Riverside',
      'Southview',
      'Lundi Park',
      'Ridgemont',
      'Woodlands',
      'Hertlands'
    ]
  },
  {
    province: 'Midlands',
    city: 'Kwekwe',
    type: 'City',
    subLocations: [
      'CBD',
      'Town Centre',
      'Mbizo',
      'Mbizo 1',
      'Mbizo 2',
      'Mbizo 3',
      'Mbizo 4',
      'Mbizo 5',
      'Mbizo 6',
      'Mbizo 7',
      'Mbizo 8',
      'Amaveni',
      'Newtown',
      'Golden Acres',
      'Fitchlea',
      'Chicago',
      'Gaika',
      'Riverside',
      'Torwood',
      'Redcliff',
      'Sherwood',
      'Zhombe',
      'Silobela'
    ]
  },
  {
    province: 'Midlands',
    city: 'Redcliff',
    type: 'Municipality',
    subLocations: [
      'Redcliff CBD',
      'Torwood',
      'Rutendo',
      'Simbi Park',
      'Redcliff Extension',
      'Steelworks',
      'Zisco',
      'Riverside'
    ]
  },
  {
    province: 'Midlands',
    city: 'Zvishavane',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Mandava',
      'Makusha',
      'Maglas',
      'Whitewaters',
      'Birthday',
      'Mambo',
      'Shabani',
      'Zvishavane Extension'
    ]
  },
  {
    province: 'Midlands',
    city: 'Shurugwi',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Iregi',
      'Hanke',
      'Tongogara',
      'Shurugwi Town',
      'Impala',
      'Unki',
      'Selukwe',
      'Peak'
    ]
  },
  {
    province: 'Midlands',
    city: 'Gokwe',
    type: 'Town Council',
    subLocations: [
      'Gokwe Centre',
      'Gokwe Town',
      'Njelele',
      'Gokwe South',
      'Gokwe North',
      'Sengwa',
      'Kana',
      'Kwekwe Road',
      'Nembudziya'
    ]
  },
  {
    province: 'Midlands',
    city: 'Mvuma',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Mvuma Centre',
      'Somabhula',
      'Mvuma Extension',
      'Iron Mask',
      'Lalapanzi'
    ]
  },
  {
    province: 'Midlands',
    city: 'Mberengwa',
    type: 'Growth Point',
    subLocations: [
      'Mberengwa Centre',
      'West Nicholson',
      'Mataga',
      'Mberengwa Growth Point',
      'Buchwa',
      'Zvishavane Road'
    ]
  },

  // ==========================================
  // 4. MANICALAND
  // ==========================================
  {
    province: 'Manicaland',
    city: 'Mutare',
    type: 'City',
    subLocations: [
      'CBD',
      'Avenues',
      'Sakubva',
      'Dangamvura',
      'Chikanga',
      'Chikanga Extension',
      'Hobhouse',
      'Murambi',
      'Palmerston',
      'Yeovil',
      'Greenside',
      'Fairbridge Park',
      'Fern Valley',
      'Christmas Pass',
      'Darlington',
      'Zimunya',
      'Hobhouse Extension',
      'Aerodrome',
      'Morningside',
      'Florida'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Rusape',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Vengere',
      'Tsanzaguru',
      'Mabvazuva',
      'Rosedale',
      'Greenside',
      'Eastview',
      'Vengere Extension',
      'Rusape Town Centre'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Chipinge',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Gaza',
      'Checheche',
      'Southdowns',
      'Chipinge Urban',
      'Chipinge Rural',
      'Mount Selinda',
      'Birchenough Bridge',
      'Middle Sabi',
      'Musikavanhu'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Chimanimani',
    type: 'Settlement',
    subLocations: [
      'Chimanimani CBD',
      'Skyline',
      'Cashel',
      'Wattle Company',
      'Melsetter',
      'Chimanimani Village',
      'Bridal Veil',
      'Nyanyadzi'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Nyanga',
    type: 'Settlement',
    subLocations: [
      'Nyanga Village',
      'Troutbeck',
      'Juliasdale',
      'Rochdale',
      'Nyamhuka',
      'Nyamaropa'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Headlands',
    type: 'Settlement',
    subLocations: [
      'Headlands Centre',
      'Headlands Township',
      'Rusape Road',
      'Nyazura',
      'Tsanzaguru'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Nyazura',
    type: 'Settlement',
    subLocations: [
      'Nyazura Centre',
      'Nyazura Township',
      'Rusape Road',
      'Headlands Road'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Murambinda',
    type: 'Growth Point',
    subLocations: [
      'Murambinda Centre',
      'Murambinda Growth Point',
      'Buhera',
      'Birchenough Bridge Road',
      'Nyashanu'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Buhera',
    type: 'Growth Point',
    subLocations: [
      'Buhera Centre',
      'Murambinda',
      'Birchenough Bridge',
      'Nyashanu',
      'Hauna',
      'Dorowa'
    ]
  },
  {
    province: 'Manicaland',
    city: 'Penhalonga',
    type: 'Settlement',
    subLocations: [
      'Penhalonga Centre',
      'Imbeza',
      'Premier Estate',
      'Old Mutare'
    ]
  },

  // ==========================================
  // 5. MASVINGO
  // ==========================================
  {
    province: 'Masvingo',
    city: 'Masvingo',
    type: 'City',
    subLocations: [
      'CBD',
      'Mucheke',
      'Rujeko',
      'Runyararo',
      'Rhodene',
      'Eastvale',
      'Hillside',
      'Target Kopje',
      'Clipsham',
      'Clipsham View',
      'Zimre Park',
      'Westview',
      'Victoria Range',
      'Masvingo South',
      'Masvingo East'
    ]
  },
  {
    province: 'Masvingo',
    city: 'Chiredzi',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Chiredzi Town',
      'Triangle',
      'Hippo Valley',
      'Chilonga',
      'Tshovani',
      'Malipati',
      'Rutenga',
      'Nandi',
      'Sengwe'
    ]
  },
  {
    province: 'Masvingo',
    city: 'Gutu',
    type: 'Growth Point',
    subLocations: [
      'Gutu Centre',
      'Mpandawana',
      'Chatsworth',
      'Serima',
      'Mupandawana',
      'Gutu Rural'
    ]
  },
  {
    province: 'Masvingo',
    city: 'Mwenezi',
    type: 'Growth Point',
    subLocations: [
      'Neshuro',
      'Rutenga',
      'Mwenezi Centre',
      'Chikombedzi',
      'Chiredzi Road'
    ]
  },
  {
    province: 'Masvingo',
    city: 'Chivi',
    type: 'Growth Point',
    subLocations: [
      'Chivi Centre',
      'Chivi Growth Point',
      'Mashava',
      'Ngundu',
      'Rutenga Road'
    ]
  },
  {
    province: 'Masvingo',
    city: 'Mashava',
    type: 'Settlement',
    subLocations: [
      'Mashava Centre',
      'Gaths Mine',
      'Gaths',
      'Temeraire',
      'Mashava Township'
    ]
  },

  // ==========================================
  // 6. MASHONALAND WEST
  // ==========================================
  {
    province: 'Mashonaland West',
    city: 'Kadoma',
    type: 'City',
    subLocations: [
      'CBD',
      'Rimuka',
      'Eiffel Flats',
      'Cam & Motor',
      'Ngezi',
      'Waverley',
      'Westerly',
      'Hillside',
      'Alaska',
      'Patchway',
      'Chakari',
      'Golden Valley',
      'Kadoma Extension'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Chegutu',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Pfupajena',
      'Rimuka',
      'Hintonville',
      'Highview',
      'Chegutu West',
      'Chegutu East',
      'Mupfungautsi',
      'Mhondoro',
      'Selous',
      'Hartley'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Chinhoyi',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Cold Stream',
      'Alaska',
      'Orange Grove',
      'Hunyani',
      'Chinhoyi University',
      'Mzari',
      'Hunyani Estate',
      'Chikonohono',
      'Brundish',
      'Chinhoyi Extension'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Norton',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Katanga',
      'Ngoni',
      'Knowe',
      'Maridale',
      'Marimba Park',
      'Norton West',
      'Norton East',
      'Maridale Extension',
      'Ngoni Extension'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Karoi',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Chikangwe',
      'Tomlinson',
      'Chiedza',
      'Karoi Centre',
      'Karoi Extension',
      'Magunje',
      'Hurungwe'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Kariba',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Nyamhunga',
      'Mahombekombe',
      'Mica Point',
      'Batoka',
      'Heights',
      'Baobab Ridge',
      'Kariba Heights',
      'Marineland',
      'Andora Harbour'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Banket',
    type: 'Town Council',
    subLocations: [
      'Banket Centre',
      'Kuwadzana',
      'Chitepo',
      'Mazowe Road'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Mhangura',
    type: 'Settlement',
    subLocations: [
      'Mhangura Centre',
      'D-Troop',
      'Chebanga',
      'Alaska Road'
    ]
  },
  {
    province: 'Mashonaland West',
    city: 'Mutorashanga',
    type: 'Settlement',
    subLocations: [
      'Mutorashanga Centre',
      'Chrome Mines',
      'High Density',
      'Extension'
    ]
  },

  // ==========================================
  // 7. MASHONALAND EAST
  // ==========================================
  {
    province: 'Mashonaland East',
    city: 'Marondera',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Dombotombo',
      'Rujeko',
      'Nyameni',
      'Paradise',
      'Rusununguko',
      'Cherutombo',
      'Rujeko Extension',
      'Marondera Heights',
      'Fairview',
      'Damofalls'
    ]
  },
  {
    province: 'Mashonaland East',
    city: 'Chivhu',
    type: 'Town Council',
    subLocations: [
      'Chivhu CBD',
      'Chivhu Urban',
      'Chivhu Growth Point',
      'Featherstone',
      'Wedza Road',
      'Chikomba'
    ]
  },
  {
    province: 'Mashonaland East',
    city: 'Mutoko',
    type: 'Growth Point',
    subLocations: [
      'Mutoko Centre',
      'Nyadire',
      'Kotwa',
      'Juru',
      'Mutoko Growth Point',
      'Murehwa Road'
    ]
  },
  {
    province: 'Mashonaland East',
    city: 'Murewa',
    type: 'Growth Point',
    subLocations: [
      'Murewa Centre',
      'Murewa Growth Point',
      'Murehwa Road',
      'Macheke',
      'Musami',
      'Mutoko Road'
    ]
  },
  {
    province: 'Mashonaland East',
    city: 'Wedza',
    type: 'Growth Point',
    subLocations: [
      'Wedza Centre',
      'Goto',
      'Dowa',
      'Mukamba',
      'Sadza',
      'Chigondo'
    ]
  },

  // ==========================================
  // 8. MASHONALAND CENTRAL
  // ==========================================
  {
    province: 'Mashonaland Central',
    city: 'Bindura',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Chipadze',
      'Chiwaridzo',
      'Aerodrome',
      'Shamva Road',
      'Bindura University',
      'Trojan Mine',
      'Bindura Extension',
      'Chipadze Extension'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Mvurwi',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Mvurwi Centre',
      'Mvurwi Extension',
      'Mvurwi Township',
      'Mvurwi Farm Areas',
      'Mazowe Road'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Mazowe',
    type: 'Settlement',
    subLocations: [
      'Mazowe Centre',
      'Glendale',
      'Jumbo',
      'Concession',
      'Mvurwi Road',
      'Mazowe Mine',
      'Christon Bank'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Mt Darwin',
    type: 'Growth Point',
    subLocations: [
      'Mt Darwin Centre',
      'Mt Darwin Urban',
      'Dotito',
      'Mukumbura',
      'Centenary Road',
      'Dande'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Guruve',
    type: 'Growth Point',
    subLocations: [
      'Guruve Centre',
      'Guruve Growth Point',
      'Siyabu',
      'Mvurwi Road',
      'Mushumbi',
      'Chiswiti'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Shamva',
    type: 'Settlement',
    subLocations: [
      'Shamva Centre',
      'Shamva Mine',
      'Madziva',
      'Mazowe Road',
      'Bindura Road'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Centenary',
    type: 'Settlement',
    subLocations: [
      'Centenary Centre',
      'Muzarabani Road',
      'Mukumbura',
      'Dotito'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Glendale',
    type: 'Settlement',
    subLocations: [
      'Glendale Centre',
      'Tsungubvi',
      'Mazowe Road',
      'Bindura Road'
    ]
  },
  {
    province: 'Mashonaland Central',
    city: 'Concession',
    type: 'Settlement',
    subLocations: [
      'Concession Centre',
      'Dendera',
      'Meikles',
      'Mazowe Road'
    ]
  },

  // ==========================================
  // 9. MATABELELAND NORTH
  // ==========================================
  {
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    type: 'City',
    subLocations: [
      'CBD',
      'Chinotimba',
      'Mkhosana',
      'Aerodrome',
      'Victoria Falls Town',
      'Sidobe',
      'Chisuma',
      'Falls Estate',
      'Livingstone Way',
      'Lookout Point'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Hwange',
    type: 'Local Board',
    subLocations: [
      'CBD',
      'Empumalanga',
      'Lwendulu',
      'Hwange Colliery',
      'Dete',
      'Lukosi',
      'Number 1',
      'Number 2',
      'Number 3',
      'Number 4',
      'Number 5',
      'Number 6',
      'Number 7',
      'Number 8',
      'Number 9'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Lupane',
    type: 'Growth Point',
    subLocations: [
      'Lupane Centre',
      'Lupane Township',
      'Lupane Growth Point',
      'Jotsholo',
      'Dhlamini',
      'Binga Road',
      'Dabani'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Binga',
    type: 'Growth Point',
    subLocations: [
      'Binga Centre',
      'Siabuwa',
      'Kariangwe',
      'Pashu',
      'Lusulu',
      'Manjolo',
      'Binga Rural'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Tsholotsho',
    type: 'Growth Point',
    subLocations: [
      'Tsholotsho Centre',
      'Sipepa',
      'Jotsholo',
      'Mbanyana',
      'Pumula',
      'Tsholotsho Rural'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Nkayi',
    type: 'Growth Point',
    subLocations: [
      'Nkayi Centre',
      'Nkayi Growth Point',
      'Tsholotsho Road',
      'Dandanda',
      'Nkayi Rural'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Umguza',
    type: 'Settlement',
    subLocations: [
      'Umguza Centre',
      'Nyamandlovu',
      'Richmond',
      'Inyathi',
      'Figtree Road'
    ]
  },
  {
    province: 'Matabeleland North',
    city: 'Inyathi',
    type: 'Settlement',
    subLocations: [
      'Inyathi Centre',
      'Inyathi Mission',
      'Umguza',
      'Dete Road'
    ]
  },

  // ==========================================
  // 10. MATABELELAND SOUTH
  // ==========================================
  {
    province: 'Matabeleland South',
    city: 'Gwanda',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Spitzkop',
      'Phakama',
      'Jahunda',
      'Mtshabezi',
      'Senondo',
      'Gwanda Town',
      'West Nicholson',
      'Guyu'
    ]
  },
  {
    province: 'Matabeleland South',
    city: 'Beitbridge',
    type: 'Municipality',
    subLocations: [
      'CBD',
      'Dulivhadzimu',
      'Nuli',
      'Medium Density',
      'Low Density',
      'Newtown',
      'Beitbridge Border',
      'Shashe',
      'Lutumba'
    ]
  },
  {
    province: 'Matabeleland South',
    city: 'Plumtree',
    type: 'Town Council',
    subLocations: [
      'CBD',
      'Dingumuzi',
      'Madabe',
      'Plumtree Centre',
      'Marula',
      'Mangwe',
      'Sanzukwe',
      'Plumtree Border'
    ]
  },
  {
    province: 'Matabeleland South',
    city: 'Esigodini',
    type: 'Settlement',
    subLocations: [
      'CBD',
      'Esigodini Centre',
      'Fort Rixon',
      'Matobo',
      'Mbalabala',
      'Figtree'
    ]
  },
  {
    province: 'Matabeleland South',
    city: 'Filabusi',
    type: 'Settlement',
    subLocations: [
      'Filabusi Centre',
      'Shangani',
      'Fort Rixon',
      'Insiza',
      'Filabusi Growth Point'
    ]
  },
  {
    province: 'Matabeleland South',
    city: 'Insiza',
    type: 'Settlement',
    subLocations: [
      'Filabusi',
      'West Nicholson',
      'Fort Rixon',
      'Shangani',
      'Insiza Centre'
    ]
  },
  {
    province: 'Matabeleland South',
    city: 'Mangwe',
    type: 'Settlement',
    subLocations: [
      'Mangwe Centre',
      'Plumtree',
      'Nopemano',
      'Mphoengs',
      'Madabe',
      'Kezi'
    ]
  }
];

/**
 * Helper to retrieve all locations belonging to a specific province
 */
export function getCitiesByProvince(province?: string): LocationHierarchy[] {
  if (!province || province === 'all') return ZIMBABWE_LOCATIONS;
  return ZIMBABWE_LOCATIONS.filter(
    (l) => l.province.toLowerCase() === province.toLowerCase()
  );
}

/**
 * Helper to get the sub-locations / suburbs for a given city
 */
export function getSubLocationsForCity(city?: string): string[] {
  if (!city || city === 'all') return [];
  const found = ZIMBABWE_LOCATIONS.find(
    (l) => l.city.toLowerCase() === city.toLowerCase()
  );
  return found?.subLocations || ['CBD'];
}

/**
 * Helper to find the province for a given city name
 */
export function getProvinceForCity(city?: string): string {
  if (!city) return 'Harare Metropolitan';
  const found = ZIMBABWE_LOCATIONS.find(
    (l) => l.city.toLowerCase() === city.toLowerCase()
  );
  return found?.province || 'Harare Metropolitan';
}

/**
 * Formatted CSV string containing 500+ locations in the exact:
 * province,city,location
 * structure requested for database imports and CRMs.
 */
export const ZIMBABWE_LOCATIONS_CSV: string = (() => {
  const rows: string[] = ['province,city,location'];
  for (const loc of ZIMBABWE_LOCATIONS) {
    for (const sub of loc.subLocations) {
      rows.push(`"${loc.province}","${loc.city}","${sub}"`);
    }
  }
  return rows.join('\n');
})();
