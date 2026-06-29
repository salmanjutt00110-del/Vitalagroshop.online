import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME    = 'Vital Agro Chemical Industries';
const SITE_URL     = 'https://vital-agro.vercel.app';
const DEFAULT_DESC = 'Premium Crop Protection, Plant Nutrition & Modern Agricultural Solutions. Insecticides, Herbicides, Fungicides, Growth Promoters for Pakistani farmers.';
const DEFAULT_IMG  = `${SITE_URL}/og-image.jpg`;
const PHONE        = '+92-63-2253137';
const WHATSAPP     = '+92-301-1837160';

/**
 * SEOHead component to dynamically manage HTML header tags and JSON-LD schemas.
 * 
 * @param {object} props
 * @param {string} [props.title] - Page title prefix.
 * @param {string} [props.description] - SEO Meta description.
 * @param {string} [props.keywords] - Comma-separated keyword string.
 * @param {string} [props.image] - Open Graph sharing image URL.
 * @param {string} [props.url] - Page canonical URL link.
 * @param {'website'|'product'|'article'} [props.type] - Open Graph type identifier.
 * @param {object} [props.product] - Product details schema parameters.
 */
export default function SEOHead({
  title       = SITE_NAME,
  description = DEFAULT_DESC,
  keywords    = 'agricultural chemicals Pakistan, crop protection Pakistan, insecticide online Pakistan COD, herbicide Pakistan price, fungicide Pakistan, Conference Gold insecticide, Vital Agro Haroonabad, agro chemicals Punjab Pakistan, buy insecticide online cash on delivery Pakistan, best fungicide for cotton Pakistan, plant nutrition products Pakistan, crop protection, growth promoter, Vital Agro',
  image       = DEFAULT_IMG,
  url         = SITE_URL,
  type        = 'website',
  product,
}) {
  const fullTitle = title === SITE_NAME
    ? title
    : `${title} | ${SITE_NAME}`;

  // Organization Schema JSON-LD
  const organizationSchema = {
    '@context':  'https://schema.org',
    '@type':     'Organization',
    name:        SITE_NAME,
    url:         SITE_URL,
    logo:        `${SITE_URL}/vital agro logo.png`,
    description: DEFAULT_DESC,
    telephone:   PHONE,
    contactPoint: {
      '@type':            'ContactPoint',
      telephone:          WHATSAPP,
      contactType:        'customer service',
      availableLanguage: ['Urdu', 'English'],
    },
    address: {
      '@type':           'PostalAddress',
      addressLocality:   'Haroonabad',
      addressRegion:     'Punjab',
      addressCountry:    'PK',
    },
    sameAs: [
      'https://wa.me/923011837160',
    ],
  };

  // Local Business Schema JSON-LD
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type':    'LocalBusiness',
    name:       SITE_NAME,
    image:      DEFAULT_IMG,
    telephone:  PHONE,
    address: {
      '@type':         'PostalAddress',
      streetAddress:   'Haroonabad',
      addressLocality: 'Haroonabad',
      addressRegion:   'Punjab',
      postalCode:      '63100',
      addressCountry:  'PK',
    },
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   29.6157,
      longitude:  73.1614,
    },
    openingHours: 'Mo-Sa 09:00-18:00',
    priceRange:   'PKR',
  };

  // Product Rich Results Schema JSON-LD
  const productSchema = product ? {
    '@context':   'https://schema.org',
    '@type':      'Product',
    name:         product.name,
    image:        image,
    description:  description,
    sku:          product.sku,
    brand: {
      '@type': 'Brand',
      name:    'Vital Agro',
    },
    category:    product.category,
    offers: {
      '@type':        'Offer',
      priceCurrency:  product.currency,
      price:          product.price,
      availability:   `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name:    SITE_NAME,
      },
    },
  } : null;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description"         content={description} />
      <meta name="keywords"            content={keywords} />
      <meta name="robots"              content="index, follow" />
      <meta name="author"              content={SITE_NAME} />
      <link rel="canonical"            href={url} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type"         content={type} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:image"        content={image} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url"          content={url} />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:locale"       content="en_PK" />

      {/* Twitter Cards */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* Geographic metadata */}
      <meta name="geo.region"          content="PK-PB" />
      <meta name="geo.placename"       content="Haroonabad, Punjab, Pakistan" />
      <meta name="language"            content="en, ur" />

      {/* Mobile addressbar styling */}
      <meta name="theme-color"         content="#02140c" />
      <meta name="apple-mobile-web-app-capable"          content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Structured JSON-LD Data Injection */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
}
