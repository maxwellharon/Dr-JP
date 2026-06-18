// api/wix-data.js
export default async function handler(req, res) {
    // Common headers for all Wix requests
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': process.env.WIX_API_KEY,
        'wix-account-id': process.env.WIX_ACCOUNT_ID,
        'wix-site-id': process.env.WIX_SITE_ID
    };

    const { method } = req;
    const { collection, id } = req.query;

    if (!collection) {
        return res.status(400).json({ error: 'Missing collection parameter' });
    }

    try {
        if (method === 'GET') {
            // Query collection
            const response = await fetch('https://www.wixapis.com/wix-data/v1/items/query', {
                method: 'POST',
                headers,
                body: JSON.stringify({ dataCollectionId: collection })
            });
            const data = await response.json();
            return res.status(response.ok ? 200 : 400).json(data);
        }

        else if (method === 'POST') {
            // Single insert – body: { item: { ...fields } }
            const body = req.body;
            if (!body.item) {
                return res.status(400).json({ error: 'Missing item in body' });
            }
            const response = await fetch('https://www.wixapis.com/wix-data/v1/items', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dataCollectionId: collection,
                    dataItem: body.item
                })
            });
            const data = await response.json();
            return res.status(response.ok ? 200 : 400).json(data);
        }

        else if (method === 'DELETE') {
            // Delete by item id
            if (!id) {
                return res.status(400).json({ error: 'Missing id parameter' });
            }
            const response = await fetch(`https://www.wixapis.com/wix-data/v1/items/${id}`, {
                method: 'DELETE',
                headers: {
                    ...headers,
                    // Wix requires the wix-site-id in the path? Actually the id is enough.
                },
                body: JSON.stringify({})   // Empty body, but some APIs require it
            });
            if (response.ok) {
                return res.status(200).json({ success: true });
            }
            const err = await response.json();
            return res.status(response.status).json(err);
        }

        else if (method === 'PATCH') {
            // Bulk insert – body: { items: [ ... ] }
            const body = req.body;
            if (!body.items || !Array.isArray(body.items)) {
                return res.status(400).json({ error: 'Missing items array' });
            }
            const response = await fetch('https://www.wixapis.com/wix-data/v1/bulk/items/insert', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dataCollectionId: collection,
                    dataItems: body.items
                })
            });
            const data = await response.json();
            return res.status(response.ok ? 200 : 400).json(data);
        }

        else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Wix proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}