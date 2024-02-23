const PORT = process.env.BROWSER_PORT;

export const puppeteerConfig = {
    args: [`--remote-debugging-port=${PORT}`,
        '--start-maximized',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        "--no-zygote",],
        protocolTimeout: 240000,
    headless: false,
    slowMo: 50,
}
export const lighthouseConfig = {
    options: {
        port: PORT,
        disableStorageReset: true,
    },
    config: {
        extends: 'lighthouse:default',
        settings: {
            formFactor: 'desktop',
            screenEmulation: {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false
            },
            emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/ 84.0.4143.7 Safari / 537.36 Chrome - Lighthouse',
            onlyAudits: [
                'network-requests',
                'interactive',
            ],
        }
    }
}