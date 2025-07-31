import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Use built-in fetch for Node 18+, otherwise use node-fetch
let fetchFn: typeof fetch;
try {
    fetchFn = fetch;
} catch {
    // @ts-ignore
    fetchFn = require('node-fetch');
}

dotenv.config();
const app = express();
const PORT = 4000;
const API_KEY = process.env.SERPAPI_KEY;

if (!API_KEY) {
    console.error('Error: SERPAPI_KEY is not set in the environment variables.');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get('/api/jobs', async (req: Request, res: Response) => {
    const { q, gl = 'us', hl = 'en', start = '0' } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Missing required query parameter: q' });
    }

    const params = new URLSearchParams({
        engine: 'google_jobs',
        api_key: API_KEY,
        q: q as string,
        gl: gl as string,
        hl: hl as string,
        start: start as string,
    });

    try {
        const result = await fetchFn(`https://serpapi.com/search?${params.toString()}`);
        const data = await result.json();
        res.json(data);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
