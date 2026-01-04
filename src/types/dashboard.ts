export type DashboardContent = {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    loading: string;
    error: string;
    success: string;
  };
  productForm: {
    titleNew: string;
    titleEdit: string;
    subtitleNew: string;
    subtitleEdit: string;
    sections: {
      general: string;
      attributes: string;
      images: string;
      pricing: string;
      status: string;
      shipping: string;
    };
    fields: {
      name: string;
      description: string;
      category: string;
      brand: string;
      status: string;
      condition: string;
      sku: string;
      regularPrice: string;
      salePrice: string;
      purchasePrice: string;
      shipping: string;
      dimensions: string;
    };
    placeholders: {
      name: string;
      description: string;
      category: string;
      brand: string;
      sku: string;
      dimensions: string;
    };
    hints: {
      markdown: string;
      salePrice: string;
      purchasePrice: string;
      images: string;
    };
    labels: {
      cover: string;
      upload: string;
    };
    attributes: {
      title: string;
      description: string;
      addCustom: string;
      noAttributes: string;
      manualAdd: string;
      customName: string;
      customValue: string;
    };
  };
};
