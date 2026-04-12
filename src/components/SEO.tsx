import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  username?: string;
}

const DEFAULT_TITLE = "Maview — Link na bio + Loja digital gratis para criadores";
const DEFAULT_DESC = "Crie sua vitrine digital profissional com loja, link na bio, booking e analytics. 0% de taxa, 40+ efeitos animados. Gratis para sempre.";
const DEFAULT_IMAGE = "https://maview.lovable.app/og-image.svg";
const BASE_URL = "https://maview.lovable.app";

export default function SEO({ title, description, image, url, type = "website", username }: SEOProps) {
  const pageTitle = title ? `${title} | Maview` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESC;
  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url || (username ? `${BASE_URL}/${username}` : BASE_URL);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Maview" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@maview" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />
    </Helmet>
  );
}
