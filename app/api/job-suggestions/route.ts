import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

export async function POST(req: NextRequest) {
    try {
        const { jobTitle, location, countryCode } = await req.json();
        if (!jobTitle) {
            return NextResponse.json({ error: 'Missing jobTitle' }, { status: 400 });
        }
        const loc = location || 'new york';
        // Use countryCode directly if provided
        const countryParam = countryCode && countryCode.length === 2 ? `&country=${countryCode}` : '';
        // Use the /search endpoint to get multiple jobs, with country param if found
        const url = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(loc)}${countryParam}&page=1&num_pages=1`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
            },
        });
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
        }
        const data = await response.json();
        // Return only the first 9 jobs if more are available
        const jobs = Array.isArray(data.data) ? data.data.slice(0, 9) : [];
        return NextResponse.json({ data: jobs });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
