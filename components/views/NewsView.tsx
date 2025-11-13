import React, { useState, useEffect } from 'react';
import type { NewsItem } from '../../types';

const RSS_FEED_URL = 'https://es.motorsport.com/rss/motogp/news/';
const PROXY_URL = '/api/proxy?targetUrl=';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
    </div>
);

export const NewsView: React.FC = () => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            
            const retries = 3;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    const response = await fetch(`${PROXY_URL}${encodeURIComponent(RSS_FEED_URL)}`);
                    if (!response.ok) {
                        throw new Error(`Error fetching RSS feed: ${response.statusText}`);
                    }
                    const xmlText = await response.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                    
                    const errorNode = xmlDoc.querySelector("parsererror");
                    if (errorNode) {
                        throw new Error("Error parsing XML feed.");
                    }

                    const items = xmlDoc.querySelectorAll('item');
                    const parsedItems: NewsItem[] = Array.from(items).map(item => {
                        const descriptionNode = item.querySelector('description');
                        let description = descriptionNode?.textContent || '';
                        description = description.replace(/<a.*>Sigue leyendo<\/a>/, '').trim();

                        return {
                            title: item.querySelector('title')?.textContent || 'Sin Título',
                            link: item.querySelector('link')?.textContent || '#',
                            description: description,
                            pubDate: item.querySelector('pubDate')?.textContent || '',
                            imageUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
                        };
                    }).filter(item => item.imageUrl) // Filter out items without an image for better UI
                    .slice(0, 7); // Limit to the first 7 news items

                    setNewsItems(parsedItems);
                    setLoading(false);
                    return; // Exit on success

                } catch (err) {
                    console.error(`Failed to fetch or parse news feed (Attempt ${attempt}/${retries}):`, err);
                    if (attempt < retries) {
                        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
                        await new Promise(res => setTimeout(res, delay));
                    } else {
                         setError("No se pudieron cargar las noticias. Por favor, inténtalo de nuevo más tarde.");
                         setLoading(false);
                    }
                }
            }
        };

        fetchNews();
    }, []);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Últimas Noticias de MotoGP</h2>
                <p className="text-gray-400 mt-1">Directo desde Motorsport.com</p>
            </div>

            {loading && <LoadingSpinner />}
            {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-lg text-center">{error}</div>}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsItems.map((item, index) => (
                        <a 
                            key={index} 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col group transition-transform hover:-translate-y-1"
                        >
                            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />
                            <div className="p-4 flex flex-col flex-grow">
                                <p className="text-xs text-gray-400 mb-2">{formatDate(item.pubDate)}</p>
                                <h3 className="text-md font-bold text-white group-hover:text-red-400 transition-colors flex-grow">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                                    {item.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};