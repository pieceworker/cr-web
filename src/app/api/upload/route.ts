import { auth } from "@/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { env } = await getCloudflareContext();

        // Use a clean UUID
        const id = crypto.randomUUID();
        const extension = file.name.split('.').pop() || 'tmp';
        const key = `${id}.${extension}`;

        await env.R2.put(key, buffer, {
            httpMetadata: {
                contentType: file.type || 'application/octet-stream',
            },
        });

        const url = `/api/image/${key}`;

        return NextResponse.json({ url, key });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
