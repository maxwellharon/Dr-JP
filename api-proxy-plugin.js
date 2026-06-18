// api-proxy-plugin.js
import { loadEnv } from 'vite'

export default function apiProxyPlugin() {
    return {
        name: 'api-proxy',
        configureServer(server) {
            const env = loadEnv('development', process.cwd(), '')
            console.log('🔧 API Proxy Ready - Site ID only')

            server.middlewares.use(async (req, res, next) => {
                if (!req.url.startsWith('/api/wix-data')) return next()

                const url = new URL(req.url, `http://${req.headers.host}`)
                const collection = url.searchParams.get('collection')
                const action = url.searchParams.get('action')

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': env.WIX_API_KEY,
                    'wix-site-id': env.WIX_SITE_ID
                }

                try {
                    let wixUrl, options = { headers }

                    if (action === 'list') {
                        wixUrl = 'https://www.wixapis.com/wix-data/v2/collections'
                        options.method = 'GET'
                    } else if (collection) {
                        wixUrl = 'https://www.wixapis.com/wix-data/v1/items/query'
                        options.method = 'POST'
                        options.body = JSON.stringify({ dataCollectionId: collection })
                    }

                    const response = await fetch(wixUrl, options)
                    const bodyText = await response.text()

                    console.log(`← Wix ${collection || 'list'}: ${response.status}`)

                    res.statusCode = response.status
                    res.setHeader('Content-Type', 'application/json')
                    res.end(bodyText)
                } catch (err) {
                    console.error('Proxy Error:', err.message)
                    res.statusCode = 500
                    res.end(JSON.stringify({ error: err.message }))
                }
            })
        }
    }
}