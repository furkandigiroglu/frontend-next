import { blogPosts } from "@/lib/blog-content";
import { Locale } from "@/i18n/config";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

// Generate static params for all blogs to optimization
export async function generateStaticParams() {
  const paths = [];
  
  // Finnish paths
  for (const post of blogPosts.fi) {
    paths.push({ locale: "fi", slug: post.slug });
  }
  
  // English paths
  for (const post of blogPosts.en) {
    paths.push({ locale: "en", slug: post.slug });
  }
  
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const posts = locale === "fi" ? blogPosts.fi : blogPosts.en;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${post.title} - Ehankki`,
    description: post.excerpt,
    openGraph: {
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const posts = locale === "fi" ? blogPosts.fi : blogPosts.en;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Format content to paragraphs
  const contentParagraphs = post.content.split('\n\n');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Back Link */}
      <div className="mb-8">
        <Link 
          href={`/${locale}/services`}
          className="inline-flex items-center text-sm font-medium text-[#4a3d31] transition-colors hover:text-amber-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {locale === 'fi' ? 'Takaisin palveluihin' : 'Back to Services'}
        </Link>
      </div>

      {/* Article Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-6 text-3xl font-bold leading-tight text-[#1f1b16] sm:text-4xl md:text-5xl">
          {post.title}
        </h1>
        {/* Simple meta info placeholder since we don't have dates/authors in json */}
        <div className="flex items-center justify-center gap-6 text-sm text-[#4a3d31]/70">
           <span className="flex items-center gap-2">
             <Calendar className="h-4 w-4" />
             Ehankki
           </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-3xl shadow-xl">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <article className="prose prose-lg prose-amber mx-auto max-w-none text-[#4a3d31]">
        {contentParagraphs.map((paragraph, index) => {
            // Check for potential headers (lines that are short and end with ?)
            // or just simple heuristics for display
            if (paragraph.length < 100 && !paragraph.includes('.')) {
                 return <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-[#1f1b16]">{paragraph}</h2>
            }
            return <p key={index} className="mb-6 leading-relaxed bg-white/50 p-6 rounded-2xl md:p-0 md:bg-transparent">{paragraph}</p>
        })}
      </article>

      {/* Footer / CTA */}
      <div className="mt-16 border-t border-[#eadfcd] pt-12">
        <div className="rounded-3xl bg-[#f5ecdf] p-8 text-center md:p-12">
            <h3 className="mb-4 text-2xl font-semibold text-[#1f1b16]">
            {locale === 'fi' ? 'Kiinnostuitko?' : 'Interested?'}
            </h3>
            <p className="mb-8 text-[#4a3d31]">
            {locale === 'fi' 
                ? 'Tutustu palveluihimme tai ota yhteyttä.' 
                : 'Check out our services or contact us.'}
            </p>
            <Link 
                href={`/${locale}/services`}
                className="inline-flex items-center rounded-full bg-[#1f1b16] px-8 py-3 font-semibold text-white transition hover:bg-[#3b3126]"
            >
                {locale === 'fi' ? 'Tutustu Palveluihin' : 'View Services'}
            </Link>
        </div>
      </div>
    </div>
  );
}
