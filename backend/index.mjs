export const handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json"
    };

    if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
    }

    try {
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};
        let targetUrl = body.url;

        if (!targetUrl) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "Please provide a valid URL." }) };
        }

        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        const startTime = Date.now();
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ChronoGhost/1.0"
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Target server responded with HTTP status ${response.status}` }) };
        }

        const rawHtml = await response.text();
        const modernLatencyMs = Date.now() - startTime;
        const rawSizeBytes = Buffer.byteLength(rawHtml, "utf8");

        const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1].trim() : "Recovered Web Artifact";

        let bodyContent = "";
        const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;

        const sanitizedHtml = bodyContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
            .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
            .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
            .replace(/style="[^"]*"/gi, "")
            .replace(/class="[^"]*"/gi, "")
            .replace(/id="[^"]*"/gi, "")
            .trim();

        const cleanSizeBytes = Buffer.byteLength(sanitizedHtml, "utf8");
        const weightReductionPercent = Math.max(0, Math.round(((rawSizeBytes - cleanSizeBytes) / rawSizeBytes) * 100));

        const dialup56kSec = (rawSizeBytes / (7 * 1024)).toFixed(2);
        const clean56kSec = (cleanSizeBytes / (7 * 1024)).toFixed(2);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                url: targetUrl,
                title: pageTitle,
                sanitizedHtml,
                telemetry: {
                    rawSizeKb: (rawSizeBytes / 1024).toFixed(1),
                    cleanSizeKb: (cleanSizeBytes / 1024).toFixed(1),
                    weightReductionPercent,
                    modernLatencyMs,
                    dialup56kSec,
                    clean56kSec
                }
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || "Failed to process artifact." })
        };
    }
};