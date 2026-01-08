// src/lib/services-content.ts

export type PricingItem = {
  service: string;
  price: string;
};

export type ServiceCategory = {
  title: string;
  items: PricingItem[];
};

export const washingServicesFi: ServiceCategory[] = [
  {
    title: "Sohvan pesu (myös nahkakalusteet)",
    items: [
      { service: "Nojatuoli", price: "45 €" },
      { service: "2-Istuttava sohva", price: "99 €" },
      { service: "3-Istuttava sohva", price: "129 €" },
      { service: "4-Istuttava sohva", price: "149 €" },
      { service: "5-Istuttava sohva", price: "169 €" },
      { service: "6-Istuttava sohva", price: "199 €" },
      { service: "Isommille sohville Pyydä tarjous", price: "-" },
    ],
  },
  {
    title: "Rahi pieni/iso",
    items: [
      { service: "Rahi pieni", price: "20 €" },
      { service: "Rahi iso", price: "35 €" },
    ],
  },
  {
    title: "Pesuhinnasto tuoleille (Keittiön tuolit)",
    items: [
      { service: "Ruokapöydän tuolit (istuin)", price: "10 €/kpl" },
      { service: "Ruokapöydän tuolit (selkänoja ve istuin)", price: "15 €/kpl" },
      { service: "Työtuolit", price: "20-40 €/kpl" },
      { service: "Suojakäsittely", price: "7 €/kpl" },
    ],
  },
  {
    title: "Sängyn syväpuhdistus ja pesu",
    items: [
      { service: "Yhden hengen sänky", price: "50 €/kpl" },
      { service: "Parisänky", price: "100 €" },
      { service: "Suojakäsittely", price: "20 / 30 €" },
    ],
  },
];

export const washingServicesEn: ServiceCategory[] = [
  {
    title: "Sofa Cleaning (incl. leather)",
    items: [
      { service: "Armchair", price: "45 €" },
      { service: "2-Seater Sofa", price: "99 €" },
      { service: "3-Seater Sofa", price: "129 €" },
      { service: "4-Seater Sofa", price: "149 €" },
      { service: "5-Seater Sofa", price: "169 €" },
      { service: "6-Seater Sofa", price: "199 €" },
      { service: "Larger sofas - Ask for offer", price: "-" },
    ],
  },
  {
    title: "Ottomans Small/Large",
    items: [
      { service: "Small Ottoman", price: "20 €" },
      { service: "Large Ottoman", price: "35 €" },
    ],
  },
  {
    title: "Chairs Cleaning (Dining Chairs)",
    items: [
      { service: "Dining Chair (seat only)", price: "10 €/pc" },
      { service: "Dining Chair (seat & back)", price: "15 €/pc" },
      { service: "Office Chairs", price: "20-40 €/pc" },
      { service: "Protective Treatment", price: "7 €/pc" },
    ],
  },
  {
    title: "Bed Deep Cleaning",
    items: [
      { service: "Single Bed", price: "50 €/pc" },
      { service: "Double Bed", price: "100 €" },
      { service: "Protective Treatment", price: "20 / 30 €" },
    ],
  },
];
