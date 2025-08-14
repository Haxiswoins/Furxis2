
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

type Media = {
    media_type: 'image' | 'video' | 'other';
    url: string; // This will now be a Base64 Data URI
    title: string;
    date: string; 
};

type CachedMedia = {
    media: Media;
    timestamp: number;
}

type ApodResponse = {
  media_type: 'image' | 'video' | string;
  url: string;
  hdurl?: string;
  title: string;
  date: string;
};


let cachedMedia: CachedMedia | null = null;

const FALLBACK_IMAGE_URL = 'https://www.nasa.gov/wp-content/uploads/2023/11/53342371726-1c86915121-o.jpg';
const FALLBACK_IMAGE_TITLE = 'The Pillars of Creation (NASA, ESA, CSA, STScI)';

// Function to fetch an image and convert it to a Base64 Data URI
async function getBase64Image(url: string, apiKey?: string): Promise<string | null> {
    try {
        // Append API key only if it's a nasa.gov URL and a key is provided
        const fetchUrl = url.includes('api.nasa.gov') && apiKey ? `${url}?api_key=${apiKey}` : url;
        
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            console.error(`Failed to fetch image with status ${response.status} from ${fetchUrl}`);
            return null;
        }
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.error(`Error in getBase64Image for url ${url}:`, error);
        return null;
    }
}


async function fetchAndCacheMedia(): Promise<Media> {
    console.log('Attempting to fetch new media from NASA API...');
    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

    if (!apiKey) {
        console.warn("NASA_API_KEY is not configured in environment variables. Using fallback.");
    }

    const getFallbackMedia = async (): Promise<Media> => {
        console.log("Fetching fallback image as primary source failed or media was not an image.");
        const fallbackDataUri = await getBase64Image(FALLBACK_IMAGE_URL);
        if (!fallbackDataUri) {
            throw new Error("Could not fetch and process even the fallback image.");
        }
        return {
            media_type: 'image',
            url: fallbackDataUri,
            title: FALLBACK_IMAGE_TITLE,
            date: new Date().toISOString().split('T')[0],
        };
    };

    try {
        // Only attempt to fetch from NASA if an API key is provided
        if (!apiKey) {
            return await getFallbackMedia();
        }

        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
        
        if (!response.ok) {
           throw new Error(`NASA API request failed with status ${response.status}`);
        }
		
		const data = (await response.json()) as ApodResponse;
        
        if (data.media_type !== 'image') {
            console.log(`Today's media is a ${data.media_type}, using fallback.`);
            return await getFallbackMedia();
        }

        const imageUrl = data.hdurl || data.url;
        const imageDataUri = await getBase64Image(imageUrl);

        if (!imageDataUri) {
            console.log(`Failed to convert today's image to Base64, using fallback.`);
            return await getFallbackMedia();
        }

        const media: Media = {
            media_type: 'image',
            url: imageDataUri, // CORRECTED: Use the Base64 URI
            title: data.title,
            date: data.date,
        };

        cachedMedia = {
            media: media,
            timestamp: Date.now(),
        };
        console.log(`Successfully fetched and cached image for date: ${data.date}`);
        return media;

    } catch (error) {
        console.error("An error occurred during fetchAndCacheMedia. Using fallback.", error);
        return await getFallbackMedia();
    }
}


export async function GET() {
    // Check if cache exists and is less than 24 hours old
    const now = Date.now();
    if (cachedMedia && (now - cachedMedia.timestamp < 24 * 60 * 60 * 1000)) {
         console.log(`Using cached media from: ${new Date(cachedMedia.timestamp).toISOString()}`);
         return NextResponse.json(cachedMedia.media);
    }
    
    try {
        const newMedia = await fetchAndCacheMedia();
        return NextResponse.json(newMedia);
    } catch (error) {
        console.error("CRITICAL: Failed to fetch both NASA and fallback media.", error);
        return NextResponse.json({ message: 'Media service is currently unavailable.' }, { status: 503 });
    }
}

// Force dynamic execution to ensure this runs on the server for every request.
export const dynamic = 'force-dynamic';
