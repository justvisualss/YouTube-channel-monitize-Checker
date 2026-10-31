# SEO Setup & Google Search Console Guide

This document details the search engine optimization (SEO) architecture, metadata rules, and Search Console verification workflows for ChannelScope Analytics.

---

## 1. Sitemap & robots.txt Locations

ChannelScope provides both dynamically generated and static fallback SEO files:

* **Sitemap URL**: `https://channelscope.app/sitemap.xml` (or `${APP_URL}/sitemap.xml`)
  * Includes all 7 core public pages: Home (`/`), About (`/about`), Contact (`/contact`), Privacy (`/privacy`), Terms (`/terms`), Disclaimer (`/disclaimer`), and Blog Hub (`/blog`).
  * Dynamically indexes all 10 in-depth blog articles with individual canonical links and `lastmod` dates.
  * Explicitly excludes private endpoints and internal callback routes (`/api/oauth/*`).
* **Robots.txt URL**: `https://channelscope.app/robots.txt` (or `${APP_URL}/robots.txt`)
  * Permits crawling of all indexable public paths and explicitly blocks private OAuth callbacks.

---

## 2. Canonical URL & Metadata Configuration

* **Canonical Domain**:
  * Configured via `APP_URL` environment variable.
  * In production, set `APP_URL="https://your-custom-domain.com"`.
* **Metadata Structure**:
  * Every page provides a unique, targeted `<title>` (30–60 characters) and `<meta name="description">` (120–160 characters).
  * Social sharing cards are implemented via standard OpenGraph (`og:title`, `og:description`, `og:type`, `og:site_name`) and Twitter Card (`twitter:card="summary_large_image"`).
* **Structured Data (Schema.org)**:
  * Homepage includes `WebSite` and `Organization` structured data with search actions.
  * Blog articles contain `Article` JSON-LD schemas with headline, dates, author, and `FAQPage` schemas for search engine snippet enhancement.

---

## 3. Google Search Console Verification Steps

When deploying ChannelScope Analytics to production:

### Step 1: Add Property in Search Console
1. Visit [Google Search Console](https://search.google.com/search-console).
2. Choose **URL prefix** and enter your production URL (e.g. `https://your-domain.com`).

### Step 2: Verification Methods
You can verify ownership via either of these methods:
* **HTML Tag (Recommended)**:
  1. In Search Console, select **HTML tag** under Other verification methods.
  2. Copy the `<meta name="google-site-verification" content="..." />` tag.
  3. Add the tag directly inside the `<head>` of `/index.html`.
* **DNS Verification**:
  1. Add the TXT verification record provided by Google to your DNS provider.

### Step 3: Submit the Sitemap
1. Once verified, navigate to **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter: `sitemap.xml`.
3. Click **Submit**.
4. Confirm the status turns green (**Success**).

---

## 4. Indexability & Performance Audit

* **Mobile-Friendly**: Fully responsive 12-column grid compliant with Google Mobile-First indexing.
* **Semantic HTML**: Proper hierarchy with exactly one `<h1>` per page, followed by logical `<h2>` and `<h3>` tags.
* **Image Accessibility**: Descriptive `alt` attributes on all video thumbnails and branding elements.
* **Core Web Vitals**: Google Fonts loaded with `preconnect` links, restrained lightweight animations, and zero layout shift on chart canvases.
