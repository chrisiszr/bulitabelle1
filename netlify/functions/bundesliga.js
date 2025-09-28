exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const API_TOKEN = '160d68490fbb4f528465c7bd4a303b85';
        const API_BASE_URL = 'https://api.football-data.org/v4';
        const BUNDESLIGA_ID = 'BL1';
        
        const response = await fetch(`${API_BASE_URL}/competitions/${BUNDESLIGA_ID}/standings`, {
            headers: {
                'X-Auth-Token': API_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching Bundesliga data:', error);
        
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
