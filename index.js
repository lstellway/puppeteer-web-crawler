/**
 * Puppeteer Web Scraper
 */

// Dependencies
const puppeteer = require('puppeteer');
const config = require('./lib/config');
const sitemap = require('sitemap-stream-parser');
const URL = require('url');

// Scope
const scope = {
    log: {},
    scraped: [],
    images: [],
    queue: [],
    baseurl: null,
    hostname: null,
    bool: val => {
        return val == 'false' ? false : !!val;
    },
    sleep: ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    normalize: (url) => {
        url = URL.parse(url);
        if (!config.follow.hash) url['hash'] = null;
        if (scope.baseurl) return URL.resolve(scope.baseurl, URL.format(url));
        return URL.format(url);
    },
    valid: url => {
        // Validate string
        if (url && url.constructor == String) {
            url = URL.parse(url);
            // Look for invalid protocol
            if (config.main.protocol.invalid.indexOf((url.protocol || '').split(':')[0].toLowerCase()) < 0) {
                // Validate host
                return (url.hostname && scope.hostname) ? scope.hostname == url.hostname : true;
            }
        }
        return false;
    },
    push: arr => {
        arr = arr && arr.constructor == Array ? arr : [arr];
        arr.forEach(url => {
            url = scope.normalize(url);
            if (scope.valid(url) && scope.scraped.indexOf(url) < 0 && scope.queue.indexOf(url) < 0) {
                scope.queue.push(url);
            }
        });
    },
    seed: callback => {
        scope.push(config.main.seed);
        sitemap.parseSitemaps(config.main.sitemap, scope.push, (url) => {
            // Set base URL based on first URL containing protocol and host
            if (scope.queue.length) {
                for (let i = 0; i < scope.queue.length; i++) {
                    url = URL.parse(scope.queue[i]);
                    if (url.protocol && url.hostname) {
                        scope.baseurl = url['protocol'] + '//' + url['hostname'] + '/';
                        scope.hostname = url.hostname;
                        break;
                    }
                }
            }
            callback();
        });
    },
    scroll: page => {
        return new Promise(async resolve => {
            await page.evaluate(async (config, total, doc) => {
                total = 0;
                doc = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

                while (total <= doc) {
                    window.scrollBy(0, window.innerHeight);
                    total += window.innerHeight;
                    await new Promise(resolve => setTimeout(resolve, config.main.gap));
                }

                return true;
            }, config);

            resolve();
        });
    },
    crawl: async (browser, page, url) => {
        page = await browser.newPage();

        while (scope.queue.length) {
            // Skip if already crawled
            url = scope.queue.shift();
            if (scope.scraped.indexOf(url) >= 0) return;
            scope.scraped.push(url);
            console.log(url);

            // Load page
            await page.goto(url, config.main.loadOptions.waitUntil);

            // Extract URLs
            scope.push(await page.evaluate(() => [...document.querySelectorAll('a')].map(a => a.href)));
            await scope.scroll(page);
        }

        await browser.close();
    },
    init: async() => {
        scope.seed(() => {
            if (scope.queue.length) {
                puppeteer.launch({headless: scope.bool(config.main.headless)}).then(scope.crawl);
            }
        });
    }
};

scope.init();
