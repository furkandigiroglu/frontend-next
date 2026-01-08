import type { AuthContent } from "./auth";
import type { HomeContent } from "./home";
import type { NavigationContent } from "./navigation";
import type { DashboardContent } from "./dashboard";
import type { ProductContent } from "./product-content";
import type { AboutContent } from "./about";

export type Dictionary = {
  navigation: NavigationContent;
  home: HomeContent;
  auth: AuthContent;
  dashboard: DashboardContent;
  product: ProductContent;
  about: AboutContent;
};
