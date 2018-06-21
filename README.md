# Puppeteer Web Crawler

Web crawler utilizing Headless Chrome via Puppeteer.

The current rendition was specifically built to be used as a simple cache warming utility. I plan to expand upon it to include more options and features such as reporting. 

## Usage

Install dependencies:
```
# NPM
npm i
# Yarn
yarn
```

Run crawler:
```
npm run crawl # -- <options>
```

Example passing two seed pages and two sitemaps:
```
npm run crawl -- --seed=https://example.com/seed1.html --seed=https://example.com/seed2.html --sitemap=https://example.com/sitemap.xml --sitemap=https://example.com/sitemap2.xml
```
