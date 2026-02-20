import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
    try {
        const { key } = await params;
        if (!key) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const { env } = await getCloudflareContext();

        const object = await env.R2.get(key);
        if (!object) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers as never);
        headers.set("etag", object.httpEtag);

        // Set Cache-Control to cache images efficiently
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(object.body as ReadableStream, {
            headers,
        });

    } catch (error) {
        console.error("Image retrieval error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
