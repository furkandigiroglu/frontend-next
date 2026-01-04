import type { Dictionary } from "@/types/dictionary";

const dictionary: Dictionary = {
  navigation: {
    brandTagline: "Kalusteet",
    menus: [
      {
        label: "Marketplace",
        href: "/marketplace",
        children: [
          {
            label: "Uudet valinnat",
            description: "Suomalaiset valmistajat ja kapselikokoelmat satuasuun.",
            href: "/marketplace/new",
          },
          {
            label: "Käytetyt aarteet",
            description: "Kunnostetut vintage-sohvat ja ruokailuryhmät sertifikaateilla.",
            href: "/marketplace/second-hand",
          },
          {
            label: "Moduulisuunnittelija",
            description: "Suunnittele kulmasohva tai säilytysjärjestelmä mittatilauksena.",
            href: "/marketplace/modular",
          },
        ],
      },
      {
        label: "Tilat",
        href: "/spaces",
        children: [
          {
            label: "Olohuone",
            description: "Pohjoisen puu, huovutetut matot ja ikoniset nojatuolit.",
            href: "/spaces/living",
          },
          {
            label: "Makuuhuone",
            description: "Laatu-sängyt, vuodevaatteet ja vintage-säilytys.",
            href: "/spaces/bedroom",
          },
          {
            label: "Lastenhuone",
            description: "EN71-merkityt pinnasängyt, Montessori-hyllyt ja leikkiratkaisut.",
            href: "/spaces/kids",
          },
        ],
      },
      {
        label: "Studio",
        href: "/studio",
        children: [
          {
            label: "Arviointi",
            description: "Asiantuntijamme arvioivat kalusteesi ripeästi ja läpinäkyvästi.",
            href: "/studio/appraisal",
          },
          {
            label: "Logistiikka",
            description: "Varastointi, kuljetus ja asennus yhdestä portaalista.",
            href: "/studio/logistics",
          },
          {
            label: "Kuvaus",
            description: "Studiokuvaukset ja 3D-skannaukset ilmoituksille.",
            href: "/studio/imagery",
          },
        ],
      },
      {
        label: "Kestävyys",
        href: "/sustainability",
        children: [
          {
            label: "Hiililaskuri",
            description: "Näytä jokaisen tilauksen vähentämä päästö jalanjäljellä.",
            href: "/sustainability/carbon",
          },
          {
            label: "Kierrätysohjelma",
            description: "Noudamme ylimääräiset kalusteet ja palautamme kiertoon.",
            href: "/sustainability/recycle",
          },
          {
            label: "Yhteisö",
            description: "Korjaustyöpajat ja design-tapahtumat Helsingissä.",
            href: "/sustainability/community",
          },
        ],
      },
      {
        label: "Tarinoita",
        href: "/stories",
        children: [
          {
            label: "Elämäntyyli",
            description: "Pohjoiset kodit ja kuvausprojektit Ehankki-tiimiltä.",
            href: "/stories/lifestyle",
          },
          {
            label: "Huolto-oppaat",
            description: "Puu, nahka ja pellava -hoito-ohjeet.",
            href: "/stories/care",
          },
          {
            label: "Projektit",
            description: "Studio toteuttamat remontit ja staging-case't.",
            href: "/stories/projects",
          },
        ],
      },
    ],
    quickLinks: [
      { label: "Uutuudet", href: "/collections/latest" },
      { label: "Iconic Vintage", href: "/collections/vintage" },
      { label: "Luonnon puu", href: "/collections/natural-wood" },
      { label: "Nopea toimitus", href: "/collections/express" },
    ],
    discoveryTags: [
      "Premium second hand",
      "Nordic modern",
      "Lastenhuone",
      "Moduuli-sohva",
      "Pieni tila",
      "Työtila",
    ],
    discoveryLabel: "Tutustu",
    supportLabel: "Tuki",
    userLinks: [
      { label: "Suosikit", href: "/favorites" },
      { label: "Tilaukset", href: "/orders" },
      { label: "Asiakaspalvelu", href: "/support" },
    ],
    cta: { label: "Listaa huonekalusi", href: "/sell" },
  },
  home: {
    hero: {
      eyebrow: "",
      title: "",
      description: "",
      stats: [
        { value: "4.8/5", label: "Myyjäluottamus" },
        { value: "12 300+", label: "Pelastettua kalustetta" },
        { value: "-38%", label: "Hiilijalanjälki" },
      ],
      ctas: [
        { label: "Tutustu valikoimaan", href: "/collections" },
        { label: "Myy Ehankkissa", href: "/sell" },
      ],
    },
    heroPanels: {
      primary: {
        tag: "",
        title: "",
        description: "",
        image: "static/media/käytetty_sohva.png",
        href: "/products?filter=Sohvat",
        ctaLabel: "Näytä sohvat",
        accent: "Premium second hand",
        spotlight: "",
      },
      secondary: [
        {
          tag: "",
          title: "",
          description: "",
          image: "static/media/4d.png",
          href: "/collections/latest",
          ctaLabel: "Tutustu uutuuksiin",
          accent: "",
        },
        {
          tag: "",
          title: "",
          description: "",
          image: "static/media/1d.jpg",
          href: "/studio/logistics",
          ctaLabel: "Varaa kuljetus",
          accent: "",
        },
      ],
    },
    featureStrip: [
      {
        icon: "delivery",
        title: "Nopea ja ilmainen toimitus",
        description: "Nopea ja ilmainen toimitus pääkaupunkiseudun alueella.",
      },
      {
        icon: "payment",
        title: "Helppo maksaminen",
        description: "Klarna, MobilePay, pankkisiirto, korttimaksu toimituksen yhteydessä.",
      },
      {
        icon: "quality",
        title: "Laadukas ja luotettava palvelu",
        description: "Tarjoamme korkealaatuista ja luotettavaa palvelua.",
      },
      {
        icon: "support",
        title: "Asiakastuki",
        description: "Ota yhteyttä, olemme täällä sinua varten ympäri vuorokauden.",
      },
    ],
    featuresIntro: {
      eyebrow: "Palvelut",
      title: "Hallinnoi käytettyä ja uutta kalustoa samasta hallintapaneelista.",
      description:
        "Arviointi, logistiikka ja maksut yhdistyvät saumattomaksi prosessiksi. SSR-arkkitehtuuri takaa hakukoneystävällisyyden.",
      ctaLabel: "Katso palvelupolku",
    },
    features: [
      {
        title: "Kuntotodistus",
        description:
          "Asiantuntijamme dokumentoivat jokaisen kohteen kuvin ja raportilla, jotta ostaja voi luottaa.",
        highlight: "100 % läpinäkyvyys",
      },
      {
        title: "Pohjoismainen logistiikka",
        description:
          "Nopea kuljetus, varastointi ja asennus kaikille toimituksille, myös second hand -lähetyksille.",
        highlight: "7 kaupunkia",
      },
      {
        title: "Kestävä maksaminen",
        description:
          "Klarna-erät, talletussuojattu maksu ja hiilitasauksen lahjoitukset samassa kassassa.",
        highlight: "Offset yhdellä klikkauksella",
      },
    ],
    categoryShowcase: [
      {
        title: "Sohvat ja nojatuolit",
        description: "Kunnostetut kulmasohvat, daybedit ja klassikot.",
        tag: "Sohvat",
        href: "/products",
        image: "https://images.unsplash.com/photo-1484100356142-db6ab6244067?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Sängyt ja patjat",
        description: "Vuoteet, jenkkisängyt ja patjat hygieniatakuulla.",
        tag: "Sängyt",
        href: "/products",
        image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Uudet huonekalut",
        description: "Paikalliset valmistajat ja mittatilaukset.",
        tag: "Uudet Huonekalut",
        href: "/products",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Matot ja tekstiilit",
        description: "Huovutetut matot ja pellavasetit kotiin.",
        tag: "Matot",
        href: "/products",
        image: "https://images.unsplash.com/photo-1455778977538-0436a066bb96?auto=format&fit=crop&w=600&q=80",
      },
    ],
    productSections: [
      {
        key: "latest",
        title: "Uusimmat tuotteet",
        description: "Tuoreimmat listaukset käytetyistä ja uusista mallistoista.",
        ctaLabel: "Kaikki tuotteet",
        href: "/products",
        fallbackTag: "Uusimmat",
      },
      {
        key: "favorites",
        title: "Suosikki valinnat",
        description: "Eniten toivottuja tuotteita yhteisöltä.",
        ctaLabel: "Näytä suosikit",
        href: "/products?filter=favorites",
        fallbackTag: "Suosikit",
      },
      {
        key: "discounted",
        title: "Alennetut tuotteet",
        description: "Rajoitetun ajan tarjoukset ja kampanjat.",
        ctaLabel: "Katso tarjoukset",
        href: "/products?filter=sale",
        fallbackTag: "Alennus",
      },
    ],
    showcaseIntro: {
      eyebrow: "Vitriniratkaisut",
      title: "Valmiit kokonaisuudet eri elämäntilanteisiin.",
      cardLabel: "Kokoelma",
    },
    showcaseCollections: [
      {
        title: "Nordic vintage -olohuone",
        description: "1950-80-lukujen klassikot restauroituna ja dokumentoituna.",
        metric: "92 % varastosta uudistettu",
      },
      {
        title: "Modulaarinen oleskelu",
        metric: "Toimitus 3 viikossa",
      },
      {
        title: "Vauva ja lapsi",
        description: "Vesipohjaiset pinnasängyt, kierrätyskankaat ja turvapaketti.",
        metric: "EN71-sertifioitu",
      },
    ],
    reviewsIntro: {
      eyebrow: "Arvostelut",
      description: "Google-arvosana 4.9/5 ja satoja toimitettuja projekteja ympäri Suomea.",
    },
    testimonials: [
      {
        quote:
          "Ehankki-kanavan kautta käytetyt mallistomme löysivät uudet kodit kahdessa viikossa ja kiertotalousmyynnin osuus kasvoi 45 %.",
        author: "Iida Korhonen",
        role: "Perustaja, Slow Loft",
      },
      {
        quote:
          "Logistiikkaverkosto mahdollisti asennuspalvelun myös Jyväskylään ja palautusaste laski kolmeen prosenttiin.",
        author: "Kaan Yıldız",
        role: "Operatiivinen johtaja, Oda Ateljee",
      },
    ],
    cta: {
      label: "Suunnittelu",
      title:
        "Laaditaan kestävä myyntisuunnitelma second hand- ja uusille mallistoillesi neljässä viikossa.",
      description:
        "Tarjoamme logistiikan, kuvausstudion ja hinnoittelutuen, jotta vitriinisi on valmis julkaistavaksi.",
      primary: { label: "Varaa työpaja", href: "/workshop" },
      secondary: { label: "Lue asiakastarina", href: "/cases" },
    },
  },
  auth: {
    login: {
      title: "Kirjaudu Ehankkiin",
      description:
        "Hallinnoi tilauksiasi, seuraa toimituksia ja listaa uudet kalusteet yhdestä paneelista.",
      emailLabel: "Sähköposti",
      passwordLabel: "Salasana",
      rememberLabel: "Muista minut",
      forgotLabel: "Unohditko salasanasi?",
      forgotHref: "/support/reset",
      submitLabel: "Kirjaudu",
      switchLabel: "Haluatko liittyä myyjäksi?",
      switchActionLabel: "Aloita",
      switchHref: "/sell",
      supportLabel: "Tarvitsetko tukea?",
      highlights: [
        "Tilauksien ja toimitusten tila päivittyy reaaliajassa.",
        "Listaa second hand -ilmoitukset ammattilaisen arviolla.",
        "Klarna ja talletussuojattu maksu hallitaan samasta näkymästä.",
      ],
    },
  },
  dashboard: {
    common: {
      save: "Tallenna",
      cancel: "Peruuta",
      delete: "Poista",
      edit: "Muokkaa",
      create: "Luo",
      loading: "Ladataan...",
      error: "Virhe",
      success: "Onnistui",
    },
    productForm: {
      titleNew: "Lisää Uusi Tuote",
      titleEdit: "Muokkaa Tuotetta",
      subtitleNew: "Täytä tiedot lisätäksesi uuden tuotteen varastoon.",
      subtitleEdit: "Päivitä tuotteen tiedot ja varastotilanne.",
      sections: {
        general: "Yleiset Tiedot",
        attributes: "Ominaisuudet",
        images: "Kuvat",
        pricing: "Hinnoittelu",
        status: "Durum & Stok",
        shipping: "Toimitus",
      },
      fields: {
        name: "Tuotteen Nimi",
        description: "Kuvaus",
        category: "Kategoria",
        brand: "Merkki",
        status: "Tila",
        condition: "Kunto",
        sku: "SKU (Varastokoodi)",
        regularPrice: "Normaalihinta (€)",
        salePrice: "Tarjoushinta (€)",
        purchasePrice: "Ostohinta (€)",
        shipping: "Toimitustapa",
        dimensions: "Mitat",
      },
      placeholders: {
        name: "Esim: iPhone 15 Pro Max",
        description: "Kerro tuotteesta tarkemmin...",
        category: "Valitse kategoria...",
        brand: "Esim: IKEA, Artek",
        sku: "Automaattinen tai oma koodi",
        dimensions: "Esim: 200x90x85 cm",
      },
      hints: {
        markdown: "Markdown-muotoilu tuettu.",
        salePrice: "Jos täytetty, tämä hinta on voimassa.",
        purchasePrice: "Vain ylläpitäjät näkevät tämän.",
        images: "PNG, JPG, WEBP",
      },
      labels: {
        cover: "Kansikuva",
        upload: "Lataa Kuva",
      },
      attributes: {
        title: "Tuotteen Ominaisuudet",
        description: "Valitun kategorian mukaiset ominaisuudet.",
        addCustom: "Lisää Oma Kenttä",
        noAttributes: "Tälle kategorialle ei ole määritelty ominaisuuksia.",
        manualAdd: "Lisää manuaalisesti",
        customName: "Ominaisuuden Nimi",
        customValue: "Arvo",
      },
    },
  },
  product: {
    price: {
      regular: "Normaalihinta",
      sale: "Alennushinta",
      discount: "Alennus",
    },
    status: {
      sold: "MYYTY",
      reserved: "VARATTU",
      available: "SAATAVILLA",
    },
    actions: {
      addToCart: "Lisää ostoskoriin",
      soldOut: "Tuote on myyty",
      save: "Tallenna",
      share: "Jaa",
    },
    details: {
      brand: "Merkki",
      category: "Kategoria",
      condition: "Kunto",
      sku: "SKU",
      dimensions: "Mitat",
    },
    condition: {
      new: "Uusi",
      used: "Käytetty",
    },
    tabs: {
      description: "Kuvaus",
      specs: "Tekniset tiedot",
      shipping: "Toimitus",
    },
    valueProps: {
      delivery: "Nopea toimitus koko Suomeen",
      checked: "Tarkistettu ja puhdistettu",
      returns: "14 päivän palautusoikeus",
    },
    messages: {
      noDescription: "Ei kuvausta saatavilla.",
    },
  },
};

export default dictionary;
