export type NavigationChild = {
  label: string;
  description?: string;
  href: string;
};

export type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationChild[];
};

export type SimpleLink = {
  label: string;
  href: string;
};

export type NavigationContent = {
  brandTagline: string;
  menus: NavigationItem[];
  quickLinks: SimpleLink[];
  discoveryTags: string[];
  discoveryLabel: string;
  supportLabel: string;
  userLinks: SimpleLink[];
  cta: SimpleLink;
};
