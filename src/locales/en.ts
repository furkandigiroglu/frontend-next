import type { Dictionary } from "@/types/dictionary";

const dictionary: Dictionary = {
  navigation: {
    brandTagline: "Furnishings",
    menus: [
      {
        label: "Marketplace",
        href: "/marketplace",
        children: [
          {
            label: "New Arrivals",
            description: "Zero-waste capsule collections from Finnish makers and limited drops.",
            href: "/marketplace/new",
          },
          {
            label: "Second-Hand Treasures",
            description: "Restored vintage icons arrive with condition reports and certificates.",
            href: "/marketplace/second-hand",
          },
          {
            label: "Modular Planner",
            description: "Compose sofas, shelves, and storage systems tailored to your plan.",
            href: "/marketplace/modular",
          },
        ],
      },
      {
        label: "Living Spaces",
        href: "/spaces",
        children: [
          {
            label: "Living Room",
            description: "Natural wood sofas, felted rugs, and signature lounge chairs.",
            href: "/spaces/living",
          },
          {
            label: "Bedroom",
            description: "Reupholstered headboards, bedside classics, and organic mattresses.",
            href: "/spaces/bedroom",
          },
          {
            label: "Kids",
            description: "EN71 certified cribs, Montessori shelves, and playful storage.",
            href: "/spaces/kids",
          },
        ],
      },
      {
        label: "Studio Services",
        href: "/studio",
        children: [
          {
            label: "Appraisal",
            description: "Our specialists grade your furniture with transparent reports and pricing.",
            href: "/studio/appraisal",
          },
          {
            label: "Logistics",
            description: "Manage storage, packing, delivery, and installation in one portal.",
            href: "/studio/logistics",
          },
          {
            label: "Imagery",
            description: "Professional shoots and 3D scans elevate every listing.",
            href: "/studio/imagery",
          },
        ],
      },
      {
        label: "Sustainability",
        href: "/sustainability",
        children: [
          {
            label: "Carbon Report",
            description: "Show the emissions saved with each order and offset instantly.",
            href: "/sustainability/carbon",
          },
          {
            label: "Circular Program",
            description: "We collect unused pieces and return them to the loop.",
            href: "/sustainability/recycle",
          },
          {
            label: "Community",
            description: "Repair days, workshops, and design gatherings in Helsinki.",
            href: "/sustainability/community",
          },
        ],
      },
      {
        label: "Stories",
        href: "/stories",
        children: [
          {
            label: "Lifestyle",
            description: "Editorial home features from the Ehankki studio team.",
            href: "/stories/lifestyle",
          },
          {
            label: "Care Guides",
            description: "Keep wood, leather, and linen pieces timeless with expert tips.",
            href: "/stories/care",
          },
          {
            label: "Projects",
            description: "Renovation and staging cases delivered by our studio.",
            href: "/stories/projects",
          },
        ],
      },
    ],
    quickLinks: [
      { label: "New Arrivals", href: "/collections/latest" },
      { label: "Iconic Vintage", href: "/collections/vintage" },
      { label: "Natural Wood", href: "/collections/natural-wood" },
      { label: "Express Delivery", href: "/collections/express" },
    ],
    discoveryTags: [
      "Premium second hand",
      "Nordic modern",
      "Nursery",
      "Modular sofa",
      "Small space",
      "Workspace",
    ],
    discoveryLabel: "Discover",
    supportLabel: "Support",
    userLinks: [
      { label: "Favorites", href: "/favorites" },
      { label: "Orders", href: "/orders" },
      { label: "Help", href: "/support" },
    ],
    cta: { label: "List your furniture", href: "/sell" },
  },
  home: {
    hero: {
      eyebrow: "",
      title: "",
      description: "",
      stats: [
        { value: "4.8/5", label: "Seller trust" },
        { value: "12,300+", label: "Pieces saved" },
        { value: "-38%", label: "Carbon footprint" },
      ],
      ctas: [
        { label: "Explore collections", href: "/collections" },
        { label: "List your furniture", href: "/sell" },
      ],
    },
    heroPanels: {
      primary: {
        tag: "",
        title: "",
        description: "",
        image: "static/media/käytetty_sohva.png",
        href: "/products?filter=Sofas",
        ctaLabel: "Browse sofas",
        accent: "Premium second hand",
        spotlight: "",
      },
      secondary: [
        {
          tag: "",
          title: "",
          description: "",
          image: "static/media/1d.jpg",
          href: "/collections/latest",
          ctaLabel: "Shop new arrivals",
          accent: "",
        },
        {
          tag: "",
          title: "",
          description: "",
          image: "static/media/4d.png",
          href: "/studio/logistics",
          ctaLabel: "Schedule logistics",
          accent: "",
        },
      ],
    },
    featureStrip: [
      {
        icon: "delivery",
        title: "Fast and free delivery",
        description: "Fast and free delivery in the capital region.",
      },
      {
        icon: "payment",
        title: "Easy payment",
        description: "Klarna, MobilePay, bank transfer, card payment upon delivery.",
      },
      {
        icon: "quality",
        title: "High quality and reliable service",
        description: "We offer high quality and reliable service.",
      },
      {
        icon: "support",
        title: "Customer support",
        description: "Contact us, we are here for you around the clock.",
      },
    ],
    featuresIntro: {
      eyebrow: "Services",
      title: "Manage second-hand and new sales from a single control room.",
      description:
        "Appraisal, logistics, and payment flows operate inside the same core. The SSR stack keeps SEO health while you scale collections.",
      ctaLabel: "Map the service journey",
    },
    features: [
      {
        title: "Condition certificate",
        description:
          "High-resolution documentation and expert notes build instant trust for every listing.",
        highlight: "100% transparent",
      },
      {
        title: "Nordic logistics",
        description:
          "Express setup, storage, and delivery work the same for new or pre-loved inventory.",
        highlight: "7 cities",
      },
      {
        title: "Sustainable checkout",
        description:
          "Offer Klarna installments, escrow-protected sales, and carbon offset donations in one flow.",
        highlight: "Offset in one tap",
      },
    ],
    categoryShowcase: [
      {
        title: "Sofas & lounge",
        description: "Sectionals, daybeds, and collector lounge chairs.",
        tag: "Sofas",
        href: "/products",
        image: "https://images.unsplash.com/photo-1484100356142-db6ab6244067?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Beds & mattresses",
        description: "Hygiene-certified frames, headboards, and mattresses.",
        tag: "Beds",
        href: "/products",
        image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "New collections",
        description: "Made-to-measure releases from local studios.",
        tag: "New Furniture",
        href: "/products",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Rugs & textiles",
        description: "Felted wool rugs and linen bundles for every room.",
        tag: "Rugs",
        href: "/products",
        image: "https://images.unsplash.com/photo-1455778977538-0436a066bb96?auto=format&fit=crop&w=600&q=80",
      },
    ],
    productSections: [
      {
        key: "latest",
        title: "Latest pieces",
        description: "Fresh arrivals from both the second-hand vault and new makers.",
        ctaLabel: "View all products",
        href: "/products",
        fallbackTag: "Latest",
      },
      {
        key: "favorites",
        title: "Community favorites",
        description: "Most saved listings based on in-platform demand.",
        ctaLabel: "See favorites",
        href: "/products?filter=favorites",
        fallbackTag: "Favorites",
      },
      {
        key: "discounted",
        title: "Limited-time pricing",
        description: "One-off price drops and campaign bundles.",
        ctaLabel: "Shop deals",
        href: "/products?filter=sale",
        fallbackTag: "Sale",
      },
    ],
    showcaseIntro: {
      eyebrow: "Showcase design",
      title: "Pre-built compositions for every living scenario.",
      cardLabel: "Collection",
    },
    showcaseCollections: [
      {
        title: "Nordic vintage living",
        description: "1950-80 classics arrive restored with provenance stories included.",
        metric: "92% of stock renewed",
      },
      {
        title: "Modular lounging",
        description: "Plan new producer modules, then track fulfillment live.",
        metric: "Delivered in 3 weeks",
      },
      {
        title: "Nursery & kids",
        description: "Water-based painted cribs, recycled textiles, and safety bundles.",
        metric: "EN71 certified",
      },
    ],
    reviewsIntro: {
      eyebrow: "Reviews",
      title: "Customers share their Ehankki experience",
      description: "4.9/5 Google rating backed by nationwide deliveries and studio services.",
    },
    testimonials: [
      {
        quote:
          "Our second-hand capsules sold out within two weeks via Ehankki, and 45% of revenue now comes from circular sales.",
        author: "Iida Korhonen",
        role: "Founder, Slow Loft",
      },
      {
        quote:
          "The logistics network let us deliver and assemble outside Helsinki; returns dropped to three percent.",
        author: "Kaan Yıldız",
        role: "Operations Lead, Oda Atelier",
      },
    ],
    cta: {
      label: "Planning",
      title: "Let’s craft a sustainable launch plan for both second-hand and new collections.",
      description:
        "With logistics, studio photography, and pricing support, your showcase goes live in four weeks.",
      primary: { label: "Book a workshop", href: "/workshop" },
      secondary: { label: "Read case study", href: "/cases" },
    },
  },
  auth: {
    login: {
      title: "Sign in to Ehankki",
      description:
        "Track orders, save favorites, and publish new listings inside one workspace.",
      emailLabel: "Email",
      passwordLabel: "Password",
      rememberLabel: "Remember me",
      forgotLabel: "Forgot password?",
      forgotHref: "/support/reset",
      submitLabel: "Sign in",
      switchLabel: "Want to become a seller?",
      switchActionLabel: "Apply",
      switchHref: "/sell",
      supportLabel: "Need support?",
      highlights: [
        "Order and delivery statuses update in real time.",
        "Request expert appraisal for every pre-loved piece.",
        "Manage Klarna and escrow-protected payments in one view.",
      ],
    },
  },
  dashboard: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      loading: "Loading...",
      error: "Error",
      success: "Success",
    },
    productForm: {
      titleNew: "Add New Product",
      titleEdit: "Edit Product",
      subtitleNew: "Fill in the details to add a new product to inventory.",
      subtitleEdit: "Update product details and inventory status.",
      sections: {
        general: "General Information",
        attributes: "Attributes",
        images: "Images",
        pricing: "Pricing",
        status: "Status & Stock",
        shipping: "Shipping",
      },
      fields: {
        name: "Product Name",
        description: "Description",
        category: "Category",
        brand: "Brand",
        status: "Status",
        condition: "Condition",
        sku: "SKU (Stock Code)",
        regularPrice: "Regular Price (€)",
        salePrice: "Sale Price (€)",
        purchasePrice: "Purchase Price (€)",
        shipping: "Shipping Method",
        dimensions: "Dimensions",
      },
      placeholders: {
        name: "Ex: iPhone 15 Pro Max",
        description: "Describe the product in detail...",
        category: "Select Category...",
        brand: "Ex: IKEA, Artek",
        sku: "Automatic or custom code",
        dimensions: "Ex: 200x90x85 cm",
      },
      hints: {
        markdown: "Markdown formatting supported.",
        salePrice: "If filled, this price applies.",
        purchasePrice: "Only visible to admins.",
        images: "PNG, JPG, WEBP",
      },
      labels: {
        cover: "Cover",
        upload: "Upload",
      },
      attributes: {
        title: "Product Attributes",
        description: "Attributes based on selected category.",
        addCustom: "Add Custom Field",
        noAttributes: "No attributes defined for this category.",
        manualAdd: "Add manually",
        customName: "Attribute Name",
        customValue: "Value",
      },
    },
  },
  product: {
    price: {
      regular: "Regular Price",
      sale: "Sale Price",
      discount: "Discount",
    },
    status: {
      sold: "SOLD",
      reserved: "RESERVED",
      available: "AVAILABLE",
    },
    actions: {
      addToCart: "Add to cart",
      soldOut: "Product Sold",
      save: "Save",
      share: "Share",
    },
    details: {
      brand: "Brand",
      category: "Category",
      condition: "Condition",
      sku: "SKU",
      dimensions: "Dimensions",
    },
    condition: {
      new: "New",
      used: "Used",
    },
    tabs: {
      description: "Description",
      specs: "Technical Specifications",
      shipping: "Shipping",
    },
    valueProps: {
      delivery: "Fast delivery across Finland",
      checked: "Checked and cleaned",
      returns: "14-day return policy",
    },
    messages: {
      noDescription: "No description available.",
    },
  },
};

export default dictionary;
