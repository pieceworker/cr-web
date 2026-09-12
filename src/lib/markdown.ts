const NAKED_URL_REGEX = /(```[\s\S]*?```|!?\[[^\]]*\]\([^)]+\)|<https?:\/\/[^\s>]+>|`[^`\n]+`|(https?:\/\/[^\s<>"'`]+|www\.[^\s<>"'`]+))/g;

/**
 * Converts naked URLs in markdown text into markdown hyperlinks [url](url),
 * preserving existing markdown links, images, autolinks, and code blocks.
 */
export function convertNakedUrlsToMarkdown(content: string): string {
    if (!content) return content;

    return content.replace(NAKED_URL_REGEX, (match, p1, p2) => {
        // If match was a markdown element or code block, keep as is
        if (!p2) return match;

        let url = p2;
        let trailing = "";

        // Strip trailing punctuation typically attached at sentence endings
        while (/[.,;:!?)]$/.test(url)) {
            if (url.endsWith(")")) {
                const openCount = (url.match(/\(/g) || []).length;
                const closeCount = (url.match(/\)/g) || []).length;
                if (openCount >= closeCount) break;
            }
            trailing = url.slice(-1) + trailing;
            url = url.slice(0, -1);
        }

        const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
        return `[${url}](${href})${trailing}`;
    });
}
