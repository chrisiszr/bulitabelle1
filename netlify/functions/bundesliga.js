// Cache für API-Daten (5 Minuten)
let cache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 Minuten in Millisekunden
};

// Rate Limiting (einfach)
let requestCount = 0;
let lastReset = Date.now();
const MAX_REQUESTS_PER_MINUTE = 30; // Max 30 Requests pro Minute

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Rate Limiting Check
    const now = Date.now();
    if (now - lastReset > 60000) { // Reset jede Minute
        requestCount = 0;
        lastReset = now;
    }
    
    requestCount++;
    if (requestCount > MAX_REQUESTS_PER_MINUTE) {
        return {
            statusCode: 429,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Retry-After': '60'
            },
            body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
        };
    }

    // Prüfe Cache
    if (cache.data && cache.timestamp && (now - cache.timestamp) < cache.ttl) {
        console.log('Serving from cache');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300' // 5 Minuten Browser-Cache
            },
            body: JSON.stringify(cache.data)
        };
    }

    try {
        const API_TOKEN = '160d68490fbb4f528465c7bd4a303b85';
        const API_BASE_URL = 'https://api.football-data.org/v4';
        const BUNDESLIGA_ID = 'BL1';
        
        console.log('Fetching fresh data from API');
        const response = await fetch(`${API_BASE_URL}/competitions/${BUNDESLIGA_ID}/standings`, {
            headers: {
                'X-Auth-Token': API_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Aktualisiere Cache
        cache.data = data;
        cache.timestamp = now;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching Bundesliga data:', error);
        
        // Falls Cache vorhanden, verwende ihn auch bei Fehlern
        if (cache.data) {
            console.log('API error, serving stale cache');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=60' // Kürzerer Cache bei Fehlern
                },
                body: JSON.stringify(cache.data)
            };
        }
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Failed to fetch data' })
        };
    }
};
