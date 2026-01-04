export type ProductContent = {
  price: {
    regular: string;
    sale: string;
    discount: string;
  };
  status: {
    sold: string;
    reserved: string;
    available: string;
  };
  actions: {
    addToCart: string;
    soldOut: string;
    save: string;
    share: string;
  };
  details: {
    brand: string;
    category: string;
    condition: string;
    sku: string;
    dimensions: string;
  };
  condition: {
    new: string;
    used: string;
  };
  tabs: {
    description: string;
    specs: string;
    shipping: string;
  };
  valueProps: {
    delivery: string;
    checked: string;
    returns: string;
  };
  messages: {
    noDescription: string;
  };
};
