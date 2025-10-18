import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  keywords?: string;
  noindex?: boolean;
}

export const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = 'https://femisse-front.vercel.app/og-default.jpg',
  ogType = 'website',
  keywords,
  noindex = false,
}: SEOHeadProps) => {
  const siteUrl = 'https://femisse-front.vercel.app';
  const fullTitle = `${title} | Feminisse - Moda Feminina`;
  const canonicalUrl = canonical || `${siteUrl}${window.location.pathname}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Feminisse" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO */}
      <meta name="author" content="Feminisse" />
      <meta name="language" content="pt-BR" />
    </Helmet>
  );
};
