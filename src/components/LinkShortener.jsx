import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function LinkShortener() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');

  const handleShorten = async () => {
    setError('');
    setShortenedUrl('');
    if (!originalUrl) {
      setError('Please enter a URL to shorten.');
      return;
    }

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShortenedUrl(data.shortenedUrl);
    } catch (err) {
      setError(err.message || 'Failed to shorten URL. Please try again.');
      console.error('Shorten URL error:', err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Link Shortener</CardTitle>
        <CardDescription>Enter a long URL to get a shortened version.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="url"
          placeholder="Enter your long URL here"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <Button onClick={handleShorten} className="w-full">
          Shorten URL
        </Button>
        {shortenedUrl && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium">Shortened URL:</p>
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 break-all hover:underline"
            >
              {shortenedUrl}
            </a>
            <Button
              onClick={() => navigator.clipboard.writeText(shortenedUrl)}
              className="mt-2 w-full"
              variant="outline"
            >
              Copy to Clipboard
            </Button>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}



export default LinkShortener;

