import { siteConfig } from "@/lib/siteConfig";

export type Review = {
  id: string;
  author_name: string;
  review_text: string;
  rating: number;
  relative_time: string;
  source: string;
};

export async function fetchReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/api/v1/reviews?limit=10&visible_only=true`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.warn("Failed to fetch reviews");
      return [];
    }

    return res.json();
  } catch (error) {
    console.warn("Error fetching reviews:", error);
    return [];
  }
}
