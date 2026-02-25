
// Expanded LanguageCode to support multi-language data
export type LanguageCode = 'np' | 'es' | 'zh';

export interface LanguageTheme {
  headerBg: string;
  headerBorder: string;
  headerText: string;
  accentColor: string;
  gradient: string;
}

export interface MenuTranslations {
  alphabet: string;
  alphabetEn: string;
  words: string;
  wordsEn: string;
  vocabulary: string;
  vocabularyEn: string;
  numbers: string;
  numbersEn: string;
  phrases: string;
  phrasesEn: string;
  tracing: string;
  tracingEn: string;
  discovery: string;
  discoveryEn: string;
  home: string;
  homeEn: string;
  practice: string;
  practiceEn: string;
}

export interface TravelDiscovery {
  id: string;
  titleEn: string;
  titleNative: string;
  descriptionEn: string;
  descriptionNative: string;
  detailsEn: string;
  detailsNative: string;
  icon: string;
  coords: { x: number, y: number }; 
  lat: number;
  lng: number;
}

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  country: string;
  flag: string;
  greeting: string;
  theme: LanguageTheme;
  menu: MenuTranslations;
  facts: string[];
  gameItems: string[]; 
  travelDiscoveries: TravelDiscovery[];
}

export const LANGUAGES: LanguageConfig[] = [
  { 
    code: 'np', 
    name: 'Nepali', 
    country: 'Nepal', 
    flag: '🇳🇵', 
    greeting: 'Namaste',
    theme: {
      headerBg: 'bg-white',
      headerBorder: 'border-red-100',
      headerText: 'text-gray-800',
      accentColor: 'red',
      gradient: 'from-red-500 to-blue-600'
    },
    menu: {
      alphabet: 'वर्णमाला',
      alphabetEn: 'Letter Land',
      words: 'शब्दहरू',
      wordsEn: 'Word Factory',
      vocabulary: 'शब्द कोष',
      vocabularyEn: 'Vocabulary',
      numbers: 'संख्या',
      numbersEn: 'Number Town',
      phrases: 'वाक्यांशहरू',
      phrasesEn: 'Chatty Club',
      tracing: 'लेखन अभ्यास',
      tracingEn: 'Tracing Practice',
      discovery: 'नेपाल भ्रमण',
      discoveryEn: 'Land Discovery',
      home: 'घर',
      homeEn: 'Home',
      practice: 'बोल्ने अभ्यास',
      practiceEn: 'Voice Lab'
    },
    facts: [
      "Nepal has the only non-rectangular flag in the whole world!",
      "The highest mountain on Earth, Mt. Everest, is in Nepal.",
      "Lumbini, Nepal is where Lord Buddha was born."
    ],
    gameItems: ['🇳🇵', '🏔️', '🐘', '🥟', '🪁'],
    travelDiscoveries: [
      // Mountain/Himalayan Region
      { 
        id: 'everest', 
        titleEn: 'Mt. Everest', 
        titleNative: 'सगरमाथा', 
        icon: '🏔️', 
        descriptionEn: 'The highest peak in the world!', 
        descriptionNative: 'संसारको सर्वोच्च शिखर!',
        detailsEn: 'Standing at 8,848 meters above sea level, Mount Everest is the ultimate symbol of human ambition and the majesty of nature. Located in the Mahalangur Himal sub-range of the Himalayas, this iconic peak attracts climbers from around the world. The mountain is home to the legendary Sherpa people, who have lived in harmony with these extreme conditions for generations. The Everest region offers breathtaking views of other eight-thousanders and pristine glaciers that feed major rivers of Asia. Despite the dangers, the mountain continues to inspire adventurers and scientists alike.',
        detailsNative: 'समुद्र सतहबाट ८,८४८ मिटर अग्लो सगरमाथा मानव महत्वाकांक्षा र प्रकृतिको महिमाको अन्तिम प्रतीक हो। हिमालयको महालंगुर हिमाल उप-श्रृंखलामा अवस्थित यो प्रतिष्ठित शिखर विश्वभरका आरोहीहरूलाई आकर्षित गर्दछ। यो पर्वत प्रसिद्ध शेर्पा जनजातिका लागि घर हो, जसले पुस्तौंदेखि यी अत्यधिक अवस्थाहरूसँग सामंजस्यपूर्ण रूपमा बसेका छन्। सगरमाथा क्षेत्रले अन्य आठ हजार मिटरका पर्वतहरू र एशियाका प्रमुख नदीहरूको स्रोत बन्ने स्वच्छ हिमनदीहरूको लोभलाग्दो दृश्य प्रदान गर्दछ। खतरा हुँदा पनि यो पर्वतले साहसीहरू र वैज्ञानिकहरूलाई प्रेरणा दिन्छ।',
        coords: { x: 80, y: 20 },
        lat: 27.9881,
        lng: 86.9250
      },
      { 
        id: 'annapurna', 
        titleEn: 'Annapurna Circuit', 
        titleNative: 'अन्नपूर्ण सर्किट', 
        icon: '🥾', 
        descriptionEn: 'The ultimate trekking paradise.', 
        descriptionNative: 'अन्तिम ट्रेकिङ स्वर्ग।',
        detailsEn: 'The Annapurna Circuit is one of the most famous trekking routes in the world, offering a complete journey through diverse landscapes from subtropical forests to arid high-altitude deserts. This 300-kilometer route circles the Annapurna massif, passing through traditional Gurung and Thakali villages, ancient monasteries, and hot springs. Trekkers witness dramatic changes in climate, culture, and scenery, from rice terraces and rhododendron forests to stark mountain passes and panoramic views of some of the highest peaks on Earth. The circuit not only showcases Nepal\'s natural beauty but also provides insight into the rich cultural tapestry of mountain communities.',
        detailsNative: 'अन्नपूर्ण सर्किट विश्वका सबैभन्दा प्रसिद्ध ट्रेकिङ मार्गहरू मध्ये एक हो, जसले उपोष्णकटिबंधीय वनहरूबाट शुष्क उच्च-उचाइ मरुभूमिसम्म विविध भौगोलिक क्षेत्रहरूमा पूरा यात्रा प्रदान गर्दछ। यो ३०० किलोमिटरको मार्गले अन्नपूर्ण पर्वतश्रृंखलालाई घुमाउँछ, परम्परागत गुरुङ र थकाली गाउँहरू, प्राचीन गुम्बाहरू र गर्मीका पानीहरू भएर जान्छ। ट्रेकरहरूले धानका खेतहरू र लालीगुराँसका वनहरूबाट खारिएको पर्वतीय पासहरू र पृथ्वीका केही सबैभन्दा अग्ला शिखरहरूका मनोरम दृश्यहरूमा नाटकीय परिवर्तनहरू देख्छन्। सर्किटले मात्र नेपालको प्राकृतिक सुन्दरतालाई देखाउँदैन तर पर्वतीय समुदायहरूको धनी सांस्कृतिक बुनाईको पनि अन्तर्दृष्टि प्रदान गर्दछ।',
        coords: { x: 30, y: 35 },
        lat: 28.5966,
        lng: 83.8203
      },
      { 
        id: 'langtang', 
        titleEn: 'Langtang Valley', 
        titleNative: 'लाङटाङ उपत्यका', 
        icon: '🏔️', 
        descriptionEn: 'A hidden Himalayan gem.', 
        descriptionNative: 'लुकेको हिमालयी रत्न।',
        detailsEn: 'Langtang Valley is a pristine Himalayan valley located north of Kathmandu, offering a perfect blend of natural beauty and Tibetan Buddhist culture. The valley is home to the Tamang people and features terraced fields, traditional Tibetan-style monasteries, and stunning views of Langtang Lirung and other peaks. The region is part of Langtang National Park, which protects diverse flora and fauna including the red panda and Himalayan black bear. Visitors can experience authentic Tibetan culture through traditional architecture, prayer flags, and festivals. The valley provides excellent opportunities for trekking, cultural immersion, and wildlife viewing in a relatively less crowded area compared to other popular destinations.',
        detailsNative: 'लाङटाङ उपत्यका काठमाडौँको उत्तरमा अवस्थित एक स्वच्छ हिमालयी उपत्यका हो, जसले प्राकृतिक सुन्दरता र तिब्बती बौद्ध संस्कृतिको उत्तम मिश्रण प्रदान गर्दछ। उपत्यका तामाङ जनजातिका लागि घर हो र टेरेस भएका खेतहरू, परम्परागत तिब्बती-शैलीका गुम्बाहरू र लाङटाङ लिरुङ र अन्य शिखरहरूका मनोरम दृश्यहरू समावेश गर्दछ। क्षेत्र लाङटाङ राष्ट्रिय निकुञ्जको भाग हो, जसले रातो पांडा र हिमालयी कालो भालु सहित विविध वनस्पति र जीवजन्तुहरूको रक्षा गर्दछ। आगन्तुकहरूले परम्परागत वास्तुकला, प्रार्थना झन्डा र चाडपर्वहरू मार्फत मौलिक तिब्बती संस्कृति अनुभव गर्न सक्छन्। उपत्यकाले अन्य लोकप्रिय गन्तव्यहरूको तुलनामा कम भीड भएको क्षेत्रमा ट्रेकिङ, सांस्कृतिक विलय र वन्यजन्तु अवलोकनका लागि उत्कृष्ट अवसरहरू प्रदान गर्दछ।',
        coords: { x: 55, y: 30 },
        lat: 28.2117,
        lng: 85.6200
      },

      // Central Nepal - Kathmandu Valley
      { 
        id: 'kathmandu', 
        titleEn: 'Kathmandu', 
        titleNative: 'काठमाडौं', 
        icon: '🏛️', 
        descriptionEn: 'The city of a thousand temples.', 
        descriptionNative: 'मन्दिरै मन्दिरको शहर।',
        detailsEn: 'Kathmandu, the vibrant capital of Nepal, is a fascinating blend of ancient traditions and modern urban life. The city is renowned for its rich architectural heritage, featuring intricate wood carvings, pagoda-style temples, and historic palaces. Durbar Square, a UNESCO World Heritage Site, showcases the artistic excellence of Newari craftsmen with its palaces, courtyards, and temples. The city is also a cultural hub with numerous festivals, museums, and art galleries. Despite rapid urbanization, Kathmandu maintains its spiritual essence with over 2,700 temples and monasteries. The surrounding hills offer panoramic views, while the bustling streets reflect Nepal\'s diverse cultural influences from India, Tibet, and beyond.',
        detailsNative: 'काठमाडौं, नेपालको जीवन्त राजधानी, प्राचीन परम्पराहरू र आधुनिक शहरी जीवनको आकर्षक मिश्रण हो। शहर आफ्नो धनी वास्तुशास्त्रीय सम्पदाका लागि प्रसिद्ध छ, जसमा जटिल काठका कुँदाइहरू, पागोडा-शैलीका मन्दिरहरू र ऐतिहासिक महलहरू समावेश छन्। दरबार स्क्वायर, एक युनेस्को विश्व सम्पदा स्थल, नेवारी कारीगरहरूको कलात्मक उत्कृष्टताका साथ महलहरू, आँगनहरू र मन्दिरहरू देखाउँछ। शहर पनि धेरै चाडपर्वहरू, संग्रहालयहरू र कला ग्यालरीहरू सहितको सांस्कृतिक केन्द्र हो। द्रुत शहरीकरणका बाबजुद, काठमाडौंले २,७०० भन्दा बढी मन्दिर र गुम्बाहरूसँग आफ्नो आध्यात्मिक सार कायम राखेको छ। वरपरका पहाडहरूले मनोरम दृश्यहरू प्रदान गर्दछन्, जबकि व्यस्त सडकहरूले भारत, तिब्बत र त्यो भन्दा परबाट नेपालका विविध सांस्कृतिक प्रभावहरू प्रतिबिम्बित गर्दछन्।',
        coords: { x: 50, y: 50 },
        lat: 27.7172,
        lng: 85.3240
      },
      { 
        id: 'lalitpur', 
        titleEn: 'Lalitpur (Patan)', 
        titleNative: 'ललितपुर (पाटन)', 
        icon: '🏛️', 
        descriptionEn: 'The city of fine arts.', 
        descriptionNative: 'कला र वास्तुकलाको शहर।',
        detailsEn: 'Lalitpur, also known as Patan, is a UNESCO World Heritage Site renowned for its exquisite craftsmanship and architectural beauty. The city is famous for its skilled metalworkers, woodcarvers, and stone sculptors who create intricate statues, ritual objects, and architectural elements. Patan Durbar Square features the majestic Krishna Temple with its 21 golden pinnacles and the stunning Taleju Temple. The city\'s narrow streets are lined with traditional brick houses adorned with beautiful windows and doors. Lalitpur is also home to the famous Patan Museum, which houses an impressive collection of religious art and artifacts. The city hosts various cultural festivals and is considered the birthplace of many traditional arts and crafts of Nepal.',
        detailsNative: 'ललितपुर, जसलाई पाटन पनि भनिन्छ, एक युनेस्को विश्व सम्पदा स्थल हो जुन आफ्नो उत्कृष्ट कारीगरी र वास्तुशास्त्रीय सुन्दरताका लागि प्रसिद्ध छ। शहर आफ्ना कुशल धातुकारहरू, काठका कारीगरहरू र ढुंगा कुँद्नेहरूका लागि प्रसिद्ध छ जसले जटिल मूर्तिहरू, धार्मिक वस्तुहरू र वास्तुशास्त्रीय तत्वहरू सिर्जना गर्दछन्। पाटन दरबार स्क्वायरमा २१ सुनौला पिनाकलहरू भएका प्रतापशाली कृष्ण मन्दिर र आश्चर्यजनक तलेजु मन्दिर छन्। शहरका साँघुरा सडकहरूले सुन्दर झ्याल र ढोकाहरूले सजाइएका परम्परागत ईंटाका घरहरूले भरिएका छन्। ललितपुर पनि प्रसिद्ध पाटन संग्रहालयको घर हो, जसमा धार्मिक कला र कलाकृतिहरूको प्रभावशाली संग्रह छ। शहरले विभिन्न सांस्कृतिक चाडपर्वहरू आयोजना गर्दछ र नेपालका धेरै परम्परागत कला र हस्तकला जन्मेको स्थान मानिन्छ।',
        coords: { x: 48, y: 52 },
        lat: 27.6786,
        lng: 85.3188
      },
      { 
        id: 'bhaktapur', 
        titleEn: 'Bhaktapur', 
        titleNative: 'भक्तपुर', 
        icon: '🏰', 
        descriptionEn: 'The medieval city.', 
        descriptionNative: 'मध्यकालीन शहर।',
        detailsEn: 'Bhaktapur, also known as Bhadgaon, is a remarkably well-preserved medieval city that offers a glimpse into Nepal\'s glorious past. The city is famous for its pottery industry, with skilled artisans creating beautiful clay pots and traditional water vessels. Bhaktapur Durbar Square, another UNESCO site, features the stunning 55-window Palace and the majestic Nyatapola Temple, the tallest pagoda in Nepal. The city\'s architecture reflects a perfect blend of Hindu and Buddhist influences, with intricately carved windows, gilded roofs, and stone sculptures. Bhaktapur is also known for its traditional festivals, especially the Bisket Jatra, which showcases the city\'s rich cultural heritage. The peaceful atmosphere and well-maintained structures make it a favorite destination for those seeking authentic cultural experiences.',
        detailsNative: 'भक्तपुर, जसलाई भादगाउँ पनि भनिन्छ, नेपालको गौरवमय अतीतको झलक प्रदान गर्ने उल्लेखनीय रूपमा राम्रोसँग संरक्षित मध्यकालीन शहर हो। शहर आफ्नो माटाका भाँडा उद्योगका लागि प्रसिद्ध छ, जहाँ कुशल कारीगरहरूले सुन्दर माटाका भाँडा र परम्परागत पानीका भाँडाहरू सिर्जना गर्दछन्। भक्तपुर दरबार स्क्वायर, अर्को युनेस्को स्थल, आश्चर्यजनक ५५-झ्याल महल र नेपालको अग्लो पागोडा प्रतापशाली न्यायापोल मन्दिर समावेश गर्दछ। शहरको वास्तुकला हिन्दू र बौद्ध प्रभावहरूको उत्तम मिश्रण प्रतिबिम्बित गर्दछ, जटिल रूपमा कुँदिएका झ्यालहरू, सुनौला छानाहरू र ढुंगा मूर्तिहरू सहित। भक्तपुर पनि आफ्ना परम्परागत चाडपर्वहरूका लागि प्रसिद्ध छ, विशेष गरी बिस्केट जात्रा, जसले शहरको धनी सांस्कृतिक सम्पदालाई देखाउँछ। शान्त वातावरण र राम्रोसँग कायम राखिएका संरचनाहरूले यसलाई मौलिक सांस्कृतिक अनुभवहरू खोज्नेहरूका लागि मनपर्ने गन्तव्य बनाउँछ।',
        coords: { x: 52, y: 52 },
        lat: 27.6722,
        lng: 85.4278
      },

      // Western Nepal
      { 
        id: 'pokhara', 
        titleEn: 'Pokhara', 
        titleNative: 'पोखरा', 
        icon: '🛶', 
        descriptionEn: 'The jewel of the mountains.', 
        descriptionNative: 'ताल र पहाडको सुन्दर शहर।',
        detailsEn: 'Pokhara is a stunning lakeside city nestled in the foothills of the Annapurna range, offering breathtaking views of some of the world\'s highest peaks. The city is famous for Phewa Lake, Nepal\'s second-largest lake, where visitors can enjoy boating and witness the reflection of Machhapuchhre (Fishtail) mountain in its crystal-clear waters. Pokhara serves as the gateway to many popular trekking routes and adventure activities including paragliding, zip-lining, and mountain biking. The city is also rich in cultural heritage with numerous temples, monasteries, and traditional Newari architecture. The peaceful atmosphere, combined with easy access to both natural beauty and adventure sports, makes Pokhara a perfect base for exploring western Nepal.',
        detailsNative: 'पोखरा अन्नपूर्ण पर्वतश्रृंखलाका पाखाहरूमा अवस्थित एक आश्चर्यजनक ताल किनारको शहर हो, जसले विश्वका केही सबैभन्दा अग्ला शिखरहरूका लोभलाग्दा दृश्यहरू प्रदान गर्दछ। शहर फेवा तालका लागि प्रसिद्ध छ, नेपालको दोस्रो ठूलो ताल, जहाँ आगन्तुकहरूले डुंगा सवारीको मजा लिन सक्छन् र यसका स्वच्छ पानीहरूमा माछापुच्छ्रे पर्वतको प्रतिबिम्ब देख्न सक्छन्। पोखरा धेरै लोकप्रिय ट्रेकिङ मार्गहरू र प्याराग्लाइडिङ, जिप-लाइनिङ र पर्वत साइक्लिङ सहितका साहसिक क्रियाकलापहरूको प्रवेशद्वारको रूपमा काम गर्दछ। शहर पनि धेरै मन्दिरहरू, गुम्बाहरू र परम्परागत नेवारी वास्तुकलासहितको सांस्कृतिक सम्पदामा धनी छ। शान्त वातावरण, प्राकृतिक सुन्दरता र साहसिक खेलहरूमा सजिलो पहुँचको संयोजनले पोखरालाई पश्चिम नेपाल अन्वेषण गर्नका लागि उत्तम आधार बनाउँछ।',
        coords: { x: 35, y: 45 },
        lat: 28.2096,
        lng: 83.9856
      },
      { 
        id: 'mustang', 
        titleEn: 'Upper Mustang', 
        titleNative: 'मुस्ताङ', 
        icon: '🏜️', 
        descriptionEn: 'The forbidden kingdom.', 
        descriptionNative: 'निषिद्ध राज्य।',
        detailsEn: 'Upper Mustang, once a restricted kingdom, is a remote and mystical region that offers a glimpse into ancient Tibetan Buddhist culture. The stark desert-like landscape, with its eroded canyons, cave dwellings, and ancient monasteries perched on cliffs, creates an otherworldly atmosphere. The region was opened to tourists only in 1992 and maintains strict regulations to preserve its unique culture and environment. Visitors can explore the walled city of Lo Manthang, the capital of the former Kingdom of Mustang, and experience authentic Tibetan traditions. The area is also known for its ancient cave systems, fossil sites, and the challenging trekking routes that lead through this dramatic terrain. Upper Mustang represents one of the last remaining examples of traditional Tibetan culture outside of Tibet.',
        detailsNative: 'अप्पर मुस्ताङ, एक पटक प्रतिबन्धित राज्य, एक टाढा र रहस्यमय क्षेत्र हो जसले प्राचीन तिब्बती बौद्ध संस्कृतिको झलक प्रदान गर्दछ। यसको उजाड मरुभूमि जस्तो भौगोलिक क्षेत्र, भत्किएका क्यानयनहरू, गुफा आवासहरू र चट्टानहरूमा टाँगिएका प्राचीन गुम्बाहरूसहितले एक अलौकिक वातावरण सिर्जना गर्दछ। क्षेत्रलाई १९९२ मा मात्र पर्यटकहरूका लागि खोलिएको थियो र यसको अद्वितीय संस्कृति र वातावरण संरक्षण गर्न कडा नियमहरू कायम राखेको छ। आगन्तुकहरूले मुस्ताङका पूर्व राज्यको राजधानी लो मन्थाङको शहर अन्वेषण गर्न र मौलिक तिब्बती परम्पराहरू अनुभव गर्न सक्छन्। क्षेत्र पनि आफ्ना प्राचीन गुफा प्रणालीहरू, जीवाश्म स्थलहरू र यस नाटकीय भौगोलिक क्षेत्रबाट जाने चुनौतीपूर्ण ट्रेकिङ मार्गहरूका लागि प्रसिद्ध छ। अप्पर मुस्ताङ तिब्बत बाहिर रहेका परम्परागत तिब्बती संस्कृतिका अन्तिम बाँकी उदाहरणहरू मध्ये एक प्रतिनिधित्व गर्दछ।',
        coords: { x: 25, y: 25 },
        lat: 29.1667,
        lng: 83.8833
      },

      // Eastern Nepal
      { 
        id: 'biratnagar', 
        titleEn: 'Biratnagar', 
        titleNative: 'विराटनगर', 
        icon: '🏭', 
        descriptionEn: 'The industrial city.', 
        descriptionNative: 'औद्योगिक शहर।',
        detailsEn: 'Biratnagar, Nepal\'s second-largest city, serves as the industrial and commercial hub of eastern Nepal. Located in the Terai region near the Indian border, the city is a major center for manufacturing, trade, and transportation. It hosts numerous industries including jute mills, sugar factories, and cigarette manufacturing plants. The city is also an important gateway for trade with India and other neighboring countries. Biratnagar is home to the country\'s only international airport outside Kathmandu and has a growing educational sector with several universities and colleges. The city blends urban development with traditional Terai culture, offering visitors a mix of modern amenities and authentic regional experiences.',
        detailsNative: 'विराटनगर, नेपालको दोस्रो ठूलो शहर, पूर्वी नेपालको औद्योगिक र वाणिज्यिक केन्द्रको रूपमा काम गर्दछ। भारतीय सीमाको नजिक तेराई क्षेत्रमा अवस्थित, शहर उत्पादन, व्यापार र यातायातका लागि प्रमुख केन्द्र हो। यसमा झोलाका मिलहरू, चिनी कारखानाहरू र सिगरेट उत्पादन गर्ने कारखानाहरू सहित धेरै उद्योगहरू छन्। शहर भारत र अन्य छिमेकी देशहरूसँगको व्यापारका लागि पनि महत्वपूर्ण प्रवेशद्वार हो। विराटनगरमा काठमाडौँ बाहिर देशको एकमात्र अन्तर्राष्ट्रिय विमानस्थल छ र यसमा बढ्दो शैक्षिक क्षेत्र छ जसमा धेरै विश्वविद्यालय र कलेजहरू छन्। शहरले शहरी विकासलाई परम्परागत तेराई संस्कृतिसँग मिसाउँछ, आगन्तुकहरूलाई आधुनिक सुविधाहरू र मौलिक क्षेत्रीय अनुभवहरूको मिश्रण प्रदान गर्दछ।',
        coords: { x: 90, y: 70 },
        lat: 26.4542,
        lng: 87.2797
      },
      { 
        id: 'dharan', 
        titleEn: 'Dharan', 
        titleNative: 'धरान', 
        icon: '🌳', 
        descriptionEn: 'The green city.', 
        descriptionNative: 'हरियो शहर।',
        detailsEn: 'Dharan is a peaceful hill town located in eastern Nepal, known for its lush greenery, educational institutions, and proximity to natural attractions. The city is surrounded by dense forests and tea gardens, offering a refreshing contrast to the hot Terai plains below. Dharan is home to B.P. Koirala Institute of Health Sciences, Nepal\'s premier medical college, and several other educational institutions. The city serves as a gateway to popular destinations like Bhedetar, Chauki, and the Koshi River for rafting adventures. Dharan\'s moderate climate and scenic beauty make it a popular retirement destination and weekend getaway for people from nearby cities. The city also hosts various cultural festivals and has a growing tourism industry.',
        detailsNative: 'धरान पूर्वी नेपालमा अवस्थित एक शान्त पहाडी शहर हो, जुन आफ्नो घना हरियाली, शैक्षिक संस्थाहरू र प्राकृतिक आकर्षणहरूको निकटताका लागि प्रसिद्ध छ। शहर घना वन र चिया बगैंचाहरूले घेरिएको छ, तलका तातो तेराई मैदानहरूको तुलनामा ताजा विरोध प्रदान गर्दछ। धरान नेपालको प्रमुख चिकित्सा कलेज बी.पी. कोइराला स्वास्थ्य विज्ञान संस्थान र अन्य धेरै शैक्षिक संस्थानहरूको घर हो। शहर भेडेटार, चौकी र राफ्टिङ साहसका लागि कोशी नदी जस्ता लोकप्रिय गन्तव्यहरूको प्रवेशद्वारको रूपमा काम गर्दछ। धरानको मध्यम जलवायु र मनोरम सुन्दरताले यसलाई नजिकका शहरहरूका मानिसहरूका लागि लोकप्रिय अवकाश गन्तव्य र सप्ताहन्तको यात्रा बनाउँछ। शहरले पनि विभिन्न सांस्कृतिक चाडपर्वहरू आयोजना गर्दछ र बढ्दो पर्यटन उद्योग छ।',
        coords: { x: 85, y: 65 },
        lat: 26.8125,
        lng: 87.2833
      },
      { 
        id: 'ilam', 
        titleEn: 'Ilam', 
        titleNative: 'ईलाम', 
        icon: '☕', 
        descriptionEn: 'The tea capital of Nepal.', 
        descriptionNative: 'नेपालको चिया राजधानी।',
        detailsEn: 'Ilam, located in the far eastern hills of Nepal, is renowned as the country\'s premier tea-growing region and a major producer of high-quality Nepali tea. The region\'s cool climate and fertile soil create perfect conditions for tea cultivation, with vast tea estates covering the rolling hills. Ilam is also famous for its natural beauty, including the stunning Mai Pokhari lake and the peaceful atmosphere of the eastern Himalayas. The city has a rich cultural heritage influenced by both Nepali and Tibetan traditions. Visitors can tour tea factories, enjoy the scenic beauty, and experience the unique Limbu and Rai cultures. Ilam\'s tea industry has become a model for sustainable agriculture and community-based tourism in Nepal.',
        detailsNative: 'ईलाम, नेपालका टाढाका पूर्वी पहाडहरूमा अवस्थित, देशको प्रमुख चिया खेती गर्ने क्षेत्र र उच्च गुणस्तरको नेपाली चियाको प्रमुख उत्पादकको रूपमा प्रसिद्ध छ। क्षेत्रको शीतल जलवायु र उर्वर माटोले चिया खेतीका लागि उत्तम अवस्था सिर्जना गर्दछ, लहरालाहरू पहाडहरूमा फैलिएका विशाल चिया बगैंचाहरूसहित। ईलाम पनि आफ्नो प्राकृतिक सुन्दरताका लागि प्रसिद्ध छ, जसमा आश्चर्यजनक माई पोखरी ताल र पूर्वी हिमालयहरूको शान्त वातावरण समावेश छ। शहरमा नेपाली र तिब्बती परम्पराहरूबाट प्रभावित धनी सांस्कृतिक सम्पदा छ। आगन्तुकहरूले चिया कारखानाहरूको भ्रमण गर्न, मनोरम सुन्दरताको मजा लिन र अद्वितीय लिम्बु र राई संस्कृतिहरू अनुभव गर्न सक्छन्। ईलामको चिया उद्योग नेपालमा दिगो कृषि र समुदायमा आधारित पर्यटनका लागि एक नमूना बनेको छ।',
        coords: { x: 95, y: 55 },
        lat: 26.9117,
        lng: 87.9236
      },

      // Mid-Western Nepal
      { 
        id: 'nepalgunj', 
        titleEn: 'Nepalgunj', 
        titleNative: 'नेपालगञ्ज', 
        icon: '🌆', 
        descriptionEn: 'Gateway to western Nepal.', 
        descriptionNative: 'पश्चिम नेपालको प्रवेशद्वार।',
        detailsEn: 'Nepalgunj is a bustling city in western Nepal that serves as an important gateway to the mid-western region and beyond. Located in the Terai plains near the Indian border, the city is a major transportation and trade hub connecting Nepal with India. It has the country\'s second-largest airport and is a key entry point for pilgrims visiting the holy sites of Mugu and Humla. Nepalgunj is known for its diverse population, including Tharu, Muslim, and other communities, creating a rich cultural tapestry. The city offers access to Bardia National Park for wildlife viewing and serves as a base for exploring the Karnali River region. Despite its urban character, Nepalgunj maintains strong connections to traditional Tharu culture and hosts various festivals throughout the year.',
        detailsNative: 'नेपालगञ्ज पश्चिम नेपालमा अवस्थित एक व्यस्त शहर हो जसले मध्य-पश्चिम क्षेत्र र त्यो भन्दा परका लागि महत्वपूर्ण प्रवेशद्वारको रूपमा काम गर्दछ। भारतीय सीमाको नजिक तेराई मैदानहरूमा अवस्थित, शहर नेपाललाई भारतसँग जोड्ने प्रमुख यातायात र व्यापार केन्द्र हो। यसमा देशको दोस्रो ठूलो विमानस्थल छ र मुगु र हुम्लाका पवित्र स्थलहरू भ्रमण गर्ने तीर्थयात्रीहरूका लागि प्रमुख प्रवेश बिन्दु हो। नेपालगञ्ज आफ्नो विविध जनसंख्याका लागि प्रसिद्ध छ, जसमा थारु, मुस्लिम र अन्य समुदायहरू समावेश छन्, जसले धनी सांस्कृतिक बुनाई सिर्जना गर्दछ। शहरले वन्यजन्तु अवलोकनका लागि बार्डिया राष्ट्रिय निकुञ्जमा पहुँच प्रदान गर्दछ र कर्णाली नदी क्षेत्र अन्वेषण गर्नका लागि आधारको रूपमा काम गर्दछ। आफ्नो शहरी चरित्रका बाबजुद, नेपालगञ्जले परम्परागत थारु संस्कृतिसँग बलियो सम्बन्ध कायम राखेको छ र वर्षभरि विभिन्न चाडपर्वहरू आयोजना गर्दछ।',
        coords: { x: 15, y: 75 },
        lat: 28.0500,
        lng: 81.6167
      },
      { 
        id: 'jumla', 
        titleEn: 'Jumla', 
        titleNative: 'जुम्ला', 
        icon: '🌾', 
        descriptionEn: 'The apple capital of Nepal.', 
        descriptionNative: 'नेपालको स्याउ राजधानी।',
        detailsEn: 'Jumla, located in the remote Karnali region, is Nepal\'s highest altitude district headquarters and a center for apple cultivation. The region\'s cool climate and fertile soil make it ideal for growing delicious apples, which are exported throughout Nepal. Jumla is also known for its ancient Chandannath Temple and the traditional flat-roofed houses that reflect Tibetan architectural influences. The area offers stunning views of the surrounding mountains and is a starting point for treks to Rara Lake, Nepal\'s largest lake. Jumla preserves unique cultural traditions and is home to various ethnic groups including the Chhetri, Thakuri, and Tibetan communities. The city\'s isolation has helped maintain traditional practices and festivals that are slowly disappearing elsewhere in Nepal.',
        detailsNative: 'जुम्ला, टाढाको कर्णाली क्षेत्रमा अवस्थित, नेपालको सबैभन्दा अग्लो उचाइको जिल्ला मुख्यालय र स्याउ खेतीको केन्द्र हो। क्षेत्रको शीतल जलवायु र उर्वर माटोले स्वादिष्ट स्याउहरू उब्जाउन उत्तम बनाउँछ, जुन नेपालभरि निर्यात गरिन्छ। जुम्ला पनि आफ्नो प्राचीन चन्दननाथ मन्दिर र तिब्बती वास्तुशास्त्रीय प्रभावहरू प्रतिबिम्बित गर्ने परम्परागत फ्ल्याट-छाना घरहरूका लागि प्रसिद्ध छ। क्षेत्रले वरपरका पर्वतहरूका मनोरम दृश्यहरू प्रदान गर्दछ र नेपालको सबैभन्दा ठूलो ताल रारा तालसम्मका ट्रेकहरूका लागि सुरु बिन्दु हो। जुम्लाले अद्वितीय सांस्कृतिक परम्पराहरू संरक्षण गर्दछ र चेपाङ, ठकुरी र तिब्बती समुदायहरू सहित विभिन्न जातीय समूहहरूको घर हो। शहरको अलगावले नेपालका अन्य स्थानहरूमा धेरैजसो लोप हुँदै गएका परम्परागत अभ्यास र चाडपर्वहरू कायम राख्न मद्दत गरेको छ।',
        coords: { x: 20, y: 40 },
        lat: 29.2742,
        lng: 82.1833
      },

      // Far-Western Nepal
      { 
        id: 'dhangadhi', 
        titleEn: 'Dhangadhi', 
        titleNative: 'धनगढी', 
        icon: '🌴', 
        descriptionEn: 'Gateway to far-western Nepal.', 
        descriptionNative: 'सुदूर-पश्चिम नेपालको प्रवेशद्वार।',
        detailsEn: 'Dhangadhi is the largest city in far-western Nepal and serves as an important economic and transportation hub for the region. Located in the Terai plains near the Indian border, the city is a major center for trade, commerce, and cross-border activities. It has become a popular destination for medical tourism due to its modern hospitals and healthcare facilities. Dhangadhi provides access to the stunning Seti River gorge and serves as a gateway to the Himalayan regions of Bajhang, Bajura, and Humla. The city is known for its diverse population and cultural influences from both Nepal and India. Despite its urban growth, Dhangadhi maintains connections to traditional Tharu culture and offers visitors a blend of modern amenities and authentic regional experiences.',
        detailsNative: 'धनगढी सुदूर-पश्चिम नेपालको सबैभन्दा ठूलो शहर हो र क्षेत्रका लागि महत्वपूर्ण आर्थिक र यातायात केन्द्रको रूपमा काम गर्दछ। भारतीय सीमाको नजिक तेराई मैदानहरूमा अवस्थित, शहर व्यापार, वाणिज्य र सीमा-पार गतिविधिहरूका लागि प्रमुख केन्द्र हो। यसले आफ्ना आधुनिक अस्पतालहरू र स्वास्थ्य सेवा सुविधाहरूका कारण चिकित्सा पर्यटनका लागि लोकप्रिय गन्तव्य बनेको छ। धनगढीले आश्चर्यजनक सेती नदीको खोच र बाजुरा र हुम्लाका हिमालयी क्षेत्रहरूमा प्रवेशका लागि प्रवेशद्वारको रूपमा काम गर्दछ। शहर आफ्नो विविध जनसंख्या र नेपाल र भारत दुवैबाट सांस्कृतिक प्रभावहरूका लागि प्रसिद्ध छ। आफ्नो शहरी वृद्धिका बाबजुद, धनगढीले परम्परागत थारु संस्कृतिसँग सम्बन्धहरू कायम राखेको छ र आगन्तुकहरूलाई आधुनिक सुविधाहरू र मौलिक क्षेत्रीय अनुभवहरूको मिश्रण प्रदान गर्दछ।',
        coords: { x: 5, y: 70 },
        lat: 28.6833,
        lng: 80.6000
      },

      // Terai Region
      { 
        id: 'lumbini', 
        titleEn: 'Lumbini', 
        titleNative: 'लुम्बिनी', 
        icon: '☸️', 
        descriptionEn: 'A place of eternal peace.', 
        descriptionNative: 'भगवान बुद्धको जन्मस्थल।',
        detailsEn: 'Lumbini, the birthplace of Lord Buddha, is one of the most sacred sites in Buddhism and a UNESCO World Heritage Site. Located in the peaceful Terai region of southern Nepal, this archaeological site contains the sacred garden where Queen Maya Devi gave birth to Siddhartha Gautama in the 5th century BCE. The site features the Mayadevi Temple, ancient stupas, monasteries, and beautiful gardens. Lumbini has become a major pilgrimage destination with monasteries built by Buddhist communities from around the world, including Thailand, Myanmar, Sri Lanka, and Japan. The peaceful atmosphere, combined with the historical significance, makes Lumbini a place of spiritual reflection and cultural exchange. The surrounding areas offer opportunities for meditation, cultural exploration, and experiencing the rich Buddhist heritage of Nepal.',
        detailsNative: 'लुम्बिनी, भगवान बुद्धको जन्मस्थल, बौद्ध धर्मका सबैभन्दा पवित्र स्थलहरू मध्ये एक र युनेस्को विश्व सम्पदा स्थल हो। नेपालको दक्षिणी तेराई क्षेत्रको शान्त स्थानमा अवस्थित, यो पुरातात्विक स्थलमा रानी माया देवीले ईसा पूर्व ५ औं शताब्दीमा सिद्धार्थ गौतमलाई जन्म दिनुभएको पवित्र बगैंचा समावेश छ। स्थलमा मायादेवी मन्दिर, प्राचीन स्तुपाहरू, गुम्बाहरू र सुन्दर बगैंचाहरू छन्। लुम्बिनी विश्वभरका बौद्ध समुदायहरूले निर्माण गरेका गुम्बाहरूसहित प्रमुख तीर्थस्थल बनेको छ, जसमा थाइल्यान्ड, म्यानमार, श्रीलंका र जापान समावेश छन्। शान्त वातावरण, ऐतिहासिक महत्वको संयोजनले लुम्बिनीलाई आध्यात्मिक प्रतिबिम्ब र सांस्कृतिक आदान-प्रदानको स्थान बनाउँछ। वरपरका क्षेत्रहरूले ध्यान, सांस्कृतिक अन्वेषण र नेपालको धनी बौद्ध सम्पदाको अनुभवका लागि अवसरहरू प्रदान गर्दछन्।',
        coords: { x: 25, y: 75 },
        lat: 27.6792,
        lng: 83.5070
      },
      { 
        id: 'chitwan', 
        titleEn: 'Chitwan National Park', 
        titleNative: 'चितवन राष्ट्रिय निकुञ्ज', 
        icon: '🦏', 
        descriptionEn: 'Deep in the jungle.', 
        descriptionNative: 'एकसिंगे गैंडाको घर।',
        detailsEn: 'Chitwan National Park, a UNESCO World Heritage Site, is Nepal\'s first national park and one of the best places in the world to see wildlife in its natural habitat. The park is home to over 700 species of birds, 68 mammal species including the endangered one-horned rhinoceros and Bengal tiger, and various reptiles and amphibians. Visitors can enjoy elephant safaris, canoe rides on the Rapti River, and jungle walks to observe wildlife. The park also preserves the traditional Tharu culture and offers cultural performances showcasing local dances and music. Chitwan provides an excellent opportunity to experience Nepal\'s biodiversity and learn about conservation efforts. The surrounding areas offer additional activities like visiting Tharu villages and exploring the Rapti River for fishing and boating.',
        detailsNative: 'चितवन राष्ट्रिय निकुञ्ज, एक युनेस्को विश्व सम्पदा स्थल, नेपालको पहिलो राष्ट्रिय निकुञ्ज र विश्वका सबैभन्दा राम्रा स्थानहरू मध्ये एक हो जहाँ वन्यजन्तुहरू आफ्नो प्राकृतिक आवासमा देख्न सकिन्छ। निकुञ्जमा ७०० भन्दा बढी चरा प्रजातिहरू, एकसिंगे गैंडा र बंगाल बाघ सहित ६८ स्तनधारी प्रजातिहरू र विभिन्न सरीसृप र उभयचरहरू छन्। आगन्तुकहरूले हात्ती सफारीहरू, राप्ती नदीमा क्यानो सवारीहरू र वन्यजन्तु अवलोकनका लागि जंगल हिँडाइहरूको मजा लिन सक्छन्। निकुञ्जले पनि परम्परागत थारु संस्कृति संरक्षण गर्दछ र स्थानीय नृत्य र संगीत देखाउने सांस्कृतिक प्रस्तुतिहरू प्रदान गर्दछ। चितवनले नेपालको जैविक विविधता अनुभव गर्ने र संरक्षण प्रयासहरूका बारेमा सिक्ने उत्कृष्ट अवसर प्रदान गर्दछ। वरपरका क्षेत्रहरूले थारु गाउँहरू भ्रमण गर्ने र माछा मार्ने र डुंगा चलाउनका लागि राप्ती नदी अन्वेषण गर्ने जस्ता अतिरिक्त क्रियाकलापहरू प्रदान गर्दछन्।',
        coords: { x: 40, y: 80 },
        lat: 27.5291,
        lng: 84.3542
      },
      { 
        id: 'janakpur', 
        titleEn: 'Janakpur', 
        titleNative: 'जनकपुर', 
        icon: '🕍', 
        descriptionEn: 'The historic city of Janaki.', 
        descriptionNative: 'पोखरी र मन्दिरहरूको शहर।',
        detailsEn: 'Janakpur, also known as Janakpurdham, is a sacred city in southeastern Nepal famous for its religious and cultural significance. The city is home to the magnificent Janaki Temple, a seven-storied structure dedicated to Goddess Sita, wife of Lord Rama. The temple complex includes beautiful courtyards, ponds, and architectural marvels showcasing intricate Mithila art and architecture. Janakpur is also known for its living goddess tradition (Kumari) and hosts the famous Vivaha Panchami festival celebrating the marriage of Rama and Sita. The city\'s narrow streets are lined with traditional houses adorned with beautiful wall paintings and sculptures. Janakpur serves as an important center for Mithila culture, preserving ancient traditions, folk music, and the distinctive Mithila painting style that has gained international recognition.',
        detailsNative: 'जनकपुर, जसलाई जनकपुरधाम पनि भनिन्छ, दक्षिणपूर्वी नेपालमा अवस्थित एक पवित्र शहर हो जुन आफ्नो धार्मिक र सांस्कृतिक महत्वका लागि प्रसिद्ध छ। शहर भव्य जानकी मन्दिरको घर हो, भगवान रामका पत्नी देवी सीताका लागि समर्पित सात तले संरचना। मन्दिर परिसरमा सुन्दर आँगनहरू, पोखरीहरू र जटिल मिथिला कला र वास्तुकला देखाउने वास्तुशास्त्रीय आश्चर्यहरू समावेश छन्। जनकपुर पनि आफ्नो जीवित देवी परम्परा (कुमारी) का लागि प्रसिद्ध छ र राम र सीताको विवाह मनाउने प्रसिद्ध विवाह पञ्चमी चाड आयोजना गर्दछ। शहरका साँघुरा सडकहरूले सुन्दर भित्ता चित्रहरू र मूर्तिहरूले सजाइएका परम्परागत घरहरूले भरिएका छन्। जनकपुर मिथिला संस्कृतिका लागि महत्वपूर्ण केन्द्रको रूपमा काम गर्दछ, प्राचीन परम्पराहरू, लोक संगीत र विशिष्ट मिथिला चित्र शैली संरक्षण गर्दछ जसले अन्तर्राष्ट्रिय मान्यता प्राप्त गरेको छ।',
        coords: { x: 75, y: 85 },
        lat: 26.7288,
        lng: 85.9263
      },

      // Hill Region
      { 
        id: 'palpa', 
        titleEn: 'Palpa (Tansen)', 
        titleNative: 'पाल्पा (तानसेन)', 
        icon: '🏔️', 
        descriptionEn: 'The Switzerland of Nepal.', 
        descriptionNative: 'नेपालको स्विट्जरल्याण्ड।',
        detailsEn: 'Palpa, also known as Tansen, is a picturesque hill town often called the "Switzerland of Nepal" due to its stunning natural beauty and temperate climate. The town is surrounded by terraced fields, lush forests, and offers panoramic views of the surrounding mountains. Tansen is famous for its traditional Newari architecture, including beautifully carved windows and doors, and well-preserved historic buildings. The city has a rich musical heritage and is known for producing some of Nepal\'s finest musicians and composers. Visitors can explore the Srinagar Hill for breathtaking views, visit the ancient Rani Mahal palace, and experience the local Magar and Newari cultures. The town\'s strategic location makes it a popular stop for travelers heading to Pokhara or the Annapurna region.',
        detailsNative: 'पाल्पा, जसलाई तानसेन पनि भनिन्छ, एक मनोरम पहाडी शहर हो जसलाई प्रायः "नेपालको स्विट्जरल्याण्ड" भनिन्छ किनकि यसको आश्चर्यजनक प्राकृतिक सुन्दरता र मध्यम जलवायुका कारण। शहर टेरेस भएका खेतहरू, घना वनहरूले घेरिएको छ र वरपरका पर्वतहरूका मनोरम दृश्यहरू प्रदान गर्दछ। तानसेन आफ्नो परम्परागत नेवारी वास्तुकलाका लागि प्रसिद्ध छ, जसमा सुन्दर रूपमा कुँदिएका झ्याल र ढोकाहरू र राम्रोसँग संरक्षित ऐतिहासिक भवनहरू समावेश छन्। शहरको धनी संगीत सम्पदा छ र नेपालका केही उत्कृष्ट संगीतकार र रचनाकारहरू उत्पादन गर्नेका लागि प्रसिद्ध छ। आगन्तुकहरूले लोभलाग्दा दृश्यहरूका लागि श्रीनगर हिल अन्वेषण गर्न, प्राचीन रानी महल दरबार भ्रमण गर्न र स्थानीय मगर र नेवारी संस्कृतिहरू अनुभव गर्न सक्छन्। शहरको रणनीतिक स्थानले यसलाई पोखरा वा अन्नपूर्ण क्षेत्रतर्फ जाने यात्रुहरूका लागि लोकप्रिय बन्द बनाउँछ।',
        coords: { x: 45, y: 60 },
        lat: 27.8667,
        lng: 83.5500
      },
      { 
        id: 'bandipur', 
        titleEn: 'Bandipur', 
        titleNative: 'बन्दीपुर', 
        icon: '🏛️', 
        descriptionEn: 'A preserved Newari town.', 
        descriptionNative: 'संरक्षित नेवारी शहर।',
        detailsEn: 'Bandipur is a beautifully preserved medieval Newari town that offers a glimpse into traditional Nepali hill culture. The town\'s cobblestone streets, traditional Newari houses with intricately carved windows, and well-maintained architecture create an atmosphere of stepping back in time. Bandipur is known for its silk production and traditional handicrafts. The town offers stunning views of the Marsyangdi River valley and the surrounding mountains. Visitors can explore the Bindabasini Temple, Thani Mai Temple, and experience authentic Newari culture through local festivals and traditional cuisine. The peaceful atmosphere and well-preserved heritage make Bandipur a perfect destination for cultural tourism and those seeking a break from the hustle of modern life.',
        detailsNative: 'बन्दीपुर एक सुन्दर रूपमा संरक्षित मध्यकालीन नेवारी शहर हो जसले परम्परागत नेपाली पहाडी संस्कृतिको झलक प्रदान गर्दछ। शहरका ढुंगा बिछ्याइएका सडकहरू, जटिल रूपमा कुँदिएका झ्यालहरू भएका परम्परागत नेवारी घरहरू र राम्रोसँग कायम राखिएको वास्तुकला समयमा पछाडि फर्कने वातावरण सिर्जना गर्दछ। बन्दीपुर आफ्नो रेशम उत्पादन र परम्परागत हस्तकला उत्पादनका लागि प्रसिद्ध छ। शहरले मार्स्याङ्दी नदी उपत्यका र वरपरका पर्वतहरूका मनोरम दृश्यहरू प्रदान गर्दछ। आगन्तुकहरूले बिन्दवासिनी मन्दिर, थानी माई मन्दिर अन्वेषण गर्न र स्थानीय चाडपर्व र परम्परागत भोजन मार्फत मौलिक नेवारी संस्कृति अनुभव गर्न सक्छन्। शान्त वातावरण र राम्रोसँग संरक्षित सम्पदा बन्दीपुरलाई सांस्कृतिक पर्यटन र आधुनिक जीवनको हलचलबाट विश्राम खोज्नेहरूका लागि उत्तम गन्तव्य बनाउँछ।',
        coords: { x: 42, y: 50 },
        lat: 27.9333,
        lng: 84.4167
      }
    ]
  }
];

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  voice: string;
  gender: 'male' | 'female';
  autoPlaySound: boolean;
  assistantPersist?: boolean;
  xp: number;
  completedWords: string[]; 
}

export interface AccountData {
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  picture?: string;
  profiles: UserProfile[];
}

export const AVATARS = ['👦', '👧', '🦁', '🐼', '🤖', '👽', '🦄', '👩‍🚀'];

export interface VoiceOption {
    id: string;
    label: string;
    gender: 'male' | 'female';
    icon: string;
}

export const VOICES: VoiceOption[] = [
  { id: 'Puck', label: 'Playful Boy', gender: 'male', icon: '👦' },
  { id: 'Kore', label: 'Playful Girl', gender: 'female', icon: '👧' }
];

export interface VowelCombo {
    char: string;
    sound: string;
}

export interface ExampleWord {
  word: string;
  transliteration: string;
  english: string;
  imageUrl: string;
  nepaliAudio?: string;
  englishAudio?: string;
}

export interface LetterData {
  char: string;
  type: 'Vowel' | 'Consonant';
  transliteration: string;
  examples: ExampleWord[];
  combos?: { char: string; sound: string }[];  // For consonants (barahkhari)

  // NEW: Local audio for the letter itself
  letterNepaliAudio?: string;   // e.g., '/voice/sound/letter_a_nepali.mp3' (pronunciation of the letter in Nepali)
  letterEnglishAudio?: string;  // e.g., '/voice/sound/letter_a_english.mp3' (transliteration guide like "a" or "ka")
}

export interface WordChallenge {
  word: string;
  english: string;
  scrambled: string[];
  imageUrl?: string;
}

export interface PhraseData {
  native: string;
  transliteration: string;
  english: string;
  category: 'Greeting' | 'Food' | 'Daily';
}

export interface WordOfTheDayData {
    word: string;
    transliteration: string;
    english: string;
    sentence: string;
    date: string;
}

export interface SongData {
    title: string;
    titleNative: string;
    category: string;
    description: string;
    descriptionNative: string;
    lyricsOriginal?: string;
    youtubeId?: string;
}

export interface VocabularyItem {
  english: string;
  nepali: string;
  pronunciation: string;
}

export interface VocabularyCategory {
  id: string;
  labelEn: string;
  labelNp: string;
  items: VocabularyItem[];
}

export interface NumberData {
  value: number;
  numeral: string;
  word: string;
  pronunciation: string;
  roman: string;
}

export enum AppState {
  LOGIN,
  PROFILE_SELECT,
  PROFILE_CREATE,
  PROFILE_MANAGE,
  LANGUAGE_SELECT,
  HOME,
  ALPHABET,
  TRACING,
  NUMBERS,
  VOCABULARY,
  WORDS,
  PHRASES,
  DISCOVERY,
  PRACTICE
}
