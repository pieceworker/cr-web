"use server";

import { auth } from "@/auth";
import { isAdmin, User, Artist, RequestType, UnifiedRequest, Role } from "./db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

async function getDB() {
    const ctx = await getCloudflareContext();
    return ctx.env.DB;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getArtistCleanupStatements(db: any, userId: string) {
    const artists = await db.prepare("SELECT id, members FROM artists WHERE members LIKE ?").bind(`%${userId}%`).all();
    const cleanupStatements = [];
    for (const artist of (artists.results as unknown as Artist[])) {
        const members = JSON.parse(artist.members || "[]") as string[];
        if (members.includes(userId)) {
            const filteredMembers = members.filter(id => id !== userId);
            if (filteredMembers.length === 0) {
                cleanupStatements.push(db.prepare("DELETE FROM artists WHERE id = ?").bind(artist.id));
                cleanupStatements.push(db.prepare("DELETE FROM requests WHERE target_id = ?").bind(artist.id));
            } else {
                cleanupStatements.push(db.prepare("UPDATE artists SET members = ? WHERE id = ?").bind(JSON.stringify(filteredMembers), artist.id));
            }
        }
    }
    return cleanupStatements;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPendingArtistRequestCleanupStatements(db: any, userId: string) {
    // Find all pending ARTIST_ADD or ARTIST_EDIT requests
    const pendingRequests = await db.prepare(
        "SELECT id, data FROM requests WHERE (type = 'ARTIST_ADD' OR type = 'ARTIST_EDIT') AND status = 'PENDING'"
    ).all();

    const cleanupStatements = [];
    for (const req of (pendingRequests.results as { id: string, data: string }[])) {
        try {
            const data = JSON.parse(req.data || "{}");
            const members = data.members as string[] | undefined;
            if (Array.isArray(members) && members.includes(userId)) {
                // This request includes the user being removed/demoted. Reject it.
                cleanupStatements.push(db.prepare("UPDATE requests SET status = 'REJECTED' WHERE id = ?").bind(req.id));
            }
        } catch {
            // If skip malformed data
        }
    }
    return cleanupStatements;
}

// requestMusicianRole removed - consolidated into updateProfile

export async function createUnifiedRequest(type: RequestType, targetId: string | null, data: Record<string, unknown>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const db = await getDB();
    await db.prepare(
        "INSERT INTO requests (id, user_id, type, target_id, data) VALUES (?, ?, ?, ?, ?)"
    ).bind(
        crypto.randomUUID(),
        session.user.id,
        type,
        targetId,
        JSON.stringify(data)
    ).run();

    revalidatePath("/admin");
    revalidatePath("/account");
}

export async function approveUnifiedRequest(requestId: string) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();
    const request = await db.prepare("SELECT * FROM requests WHERE id = ?").bind(requestId).first() as UnifiedRequest | null;
    if (!request) throw new Error("Request not found");

    const data = request.data ? JSON.parse(request.data) : {};

    const statements = [];

    if (request.type === 'ROLE_CHANGE') {
        const role = data.role;
        statements.push(db.prepare("UPDATE users SET role = ?, director_chapters = ? WHERE id = ?").bind(
            role,
            data.director_chapters ? JSON.stringify(data.director_chapters) : null,
            request.user_id
        ));

        if (role === 'Musician' || role === 'Chapter Director') {
            // Check if solo artist already exists
            const existing = await db.prepare("SELECT id FROM artists WHERE owner_id = ?").bind(request.user_id).first();
            if (!existing) {
                const user = await db.prepare("SELECT name, image, chapters FROM users WHERE id = ?").bind(request.user_id).first() as User;
                statements.push(db.prepare(
                    "INSERT INTO artists (id, name, location, bio, image, owner_id, status, members, chapters) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)"
                ).bind(
                    crypto.randomUUID(),
                    user.name || "New Artist",
                    data.location || null,
                    data.bio || null,
                    user.image || null,
                    request.user_id,
                    JSON.stringify([request.user_id]),
                    user.chapters || "[]"
                ));
            }
        } else if (role === 'Audience') {
            const cleanup = await getArtistCleanupStatements(db, request.user_id);
            statements.push(...cleanup);
        }
    } else if (request.type === 'USER_EDIT') {
        const roleStr = data.role || 'Audience';
        statements.push(db.prepare(
            "UPDATE users SET name = ?, location = ?, bio = ?, chapters = ?, role = ?, director_chapters = ? WHERE id = ?"
        ).bind(
            data.name,
            data.location,
            data.bio,
            JSON.stringify(data.chapters),
            roleStr,
            data.director_chapters ? JSON.stringify(data.director_chapters) : null,
            request.target_id
        ));

        // If role changed to Musician/Chapter Director via edit, handle solo artist
        if (roleStr === 'Musician' || roleStr === 'Chapter Director') {
            const existing = await db.prepare("SELECT id FROM artists WHERE owner_id = ?").bind(request.target_id).first();
            if (!existing) {
                statements.push(db.prepare(
                    "INSERT INTO artists (id, name, location, bio, image, owner_id, status, members, chapters) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)"
                ).bind(
                    crypto.randomUUID(),
                    data.name || "New Artist",
                    data.location || null,
                    data.bio || null,
                    null, // we don't have user image here easily without another query, or it's unchanged
                    request.target_id,
                    JSON.stringify([request.target_id]),
                    JSON.stringify(data.chapters || [])
                ));
            }
        }
    }
    else if (request.type === 'ARTIST_EDIT') {
        statements.push(db.prepare(
            "UPDATE artists SET name = ?, location = ?, bio = ?, image = ?, chapters = ?, members = ?, status = 'APPROVED' WHERE id = ?"
        ).bind(data.name, data.location, data.bio, data.image, JSON.stringify(data.chapters), JSON.stringify(data.members), request.target_id));
    } else if (request.type === 'ARTIST_ADD') {
        statements.push(db.prepare("UPDATE artists SET status = 'APPROVED' WHERE id = ?").bind(request.target_id));
    } else if (request.type === 'BOOKING_EDIT') {
        statements.push(db.prepare("UPDATE bookings SET name = ?, email = ?, phone = ?, questions = ?, status = 'APPROVED' WHERE id = ?").bind(
            data.name, data.email, data.phone, data.questions, request.target_id
        ));
        statements.push(db.prepare("DELETE FROM booking_dates WHERE booking_id = ?").bind(request.target_id));

        const dates = data.dates || [];
        const times = data.times || [];
        const durations = data.durations || [];
        const eventTypes = data.eventTypes || [];
        const locations = data.locations || [];
        const descriptions = data.descriptions || [];
        const budgets = data.budgets || [];

        for (let i = 0; i < dates.length; i++) {
            statements.push(
                db.prepare(`
                    INSERT INTO booking_dates (id, booking_id, date, time, duration, event_type, location, description, budget, is_public)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                `).bind(
                    crypto.randomUUID(),
                    request.target_id,
                    dates[i],
                    times[i],
                    durations[i] || null,
                    eventTypes[i] || null,
                    locations[i],
                    descriptions[i] || null,
                    budgets[i] || null
                )
            );
        }
    } else if (request.type === 'BOOKING_INQUIRY') {
        statements.push(db.prepare("UPDATE bookings SET status = 'APPROVED' WHERE id = ?").bind(request.target_id));
    }

    statements.push(db.prepare("UPDATE requests SET status = 'APPROVED' WHERE id = ?").bind(requestId));

    await db.batch(statements);

    revalidatePath("/admin");
    revalidatePath("/account");
    revalidatePath("/directories");
    revalidatePath("/bookings");
}

export async function rejectUnifiedRequest(requestId: string) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();
    await db.prepare("UPDATE requests SET status = 'REJECTED' WHERE id = ?").bind(requestId).run();

    revalidatePath("/admin");
}

export async function approveRequest(requestId: string) {
    // Legacy support or redirect to unified
    return approveUnifiedRequest(requestId);
}

// Chapters CRUD (Admin only)
export async function createChapter(formData: FormData) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as string;

    const db = await getDB();
    await db.prepare(
        "INSERT INTO chapters (id, location, bio, image) VALUES (?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), location, bio, image).run();

    revalidatePath("/admin");
    revalidatePath("/directories");
}

export async function updateChapter(formData: FormData) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const id = formData.get("id") as string;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as string;

    const db = await getDB();
    await db.prepare(
        "UPDATE chapters SET location = ?, bio = ?, image = ? WHERE id = ?"
    ).bind(location, bio, image, id).run();

    revalidatePath("/admin");
    revalidatePath("/directories");
}

export async function deleteChapter(chapterId: string) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();
    await db.prepare("DELETE FROM chapters WHERE id = ?").bind(chapterId).run();

    revalidatePath("/admin");
    revalidatePath("/directories");
}

// Artists CRUD (Musicians, pending approval)
export async function createArtist(formData: FormData) {
    const session = await auth();
    const user = session?.user as User | undefined;
    if (!user?.id || (user.role !== 'Musician' && user.role !== 'Chapter Director')) throw new Error("Musicians only");

    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const chapters = formData.getAll("chapters") as string[];
    const selectedMembers = formData.getAll("members") as string[];

    const db = await getDB();
    const id = crypto.randomUUID();

    // Use user image for the artist if solo
    const userImage = user.image;

    // Ensure owner is always a member
    const allMembers = Array.from(new Set([user.id, ...selectedMembers]));

    await db.prepare(
        "INSERT INTO artists (id, name, location, bio, image, owner_id, status, members, chapters) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)"
    ).bind(id, name, location, bio, userImage, user.id, JSON.stringify(allMembers), JSON.stringify(chapters)).run();

    await createUnifiedRequest("ARTIST_ADD", id, {
        name,
        location,
        bio,
        chapters,
        members: allMembers
    });

    revalidatePath("/directories");
    revalidatePath("/admin");
}

export async function approveArtist(artistId: string) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();
    await db.prepare("UPDATE artists SET status = 'APPROVED' WHERE id = ?").bind(artistId).run();

    revalidatePath("/admin");
    revalidatePath("/directories");
}

export async function deleteArtist(artistId: string) {
    const session = await auth();
    const db = await getDB();

    const artist = await db.prepare("SELECT owner_id FROM artists WHERE id = ?").bind(artistId).first() as { owner_id: string } | null;
    if (!artist) throw new Error("Artist not found");

    if (!isAdmin(session?.user?.email) && session?.user?.id !== artist.owner_id) {
        throw new Error("Unauthorized");
    }

    await db.batch([
        db.prepare("DELETE FROM artists WHERE id = ?").bind(artistId),
        db.prepare("DELETE FROM requests WHERE target_id = ?").bind(artistId)
    ]);

    revalidatePath("/admin");
    revalidatePath("/directories");
}

export async function updateArtist(formData: FormData) {
    const session = await auth();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as string;
    const chapters = formData.getAll("chapters") as string[];
    const members = formData.getAll("members") as string[];

    const db = await getDB();
    const artist = await db.prepare("SELECT owner_id, members FROM artists WHERE id = ?").bind(id).first() as Artist | null;
    if (!artist) throw new Error("Artist not found");

    const isMember = artist.members ? JSON.parse(artist.members).includes(session?.user?.id) : false;
    if (!isAdmin(session?.user?.email) && !isMember) {
        throw new Error("Unauthorized");
    }

    const isAdminAction = formData.get("isAdminAction") === "true";
    const reviewRequestId = formData.get("reviewRequestId") as string | null;

    if (isAdmin(session?.user?.email) && isAdminAction) {
        const statements = [
            db.prepare(
                "UPDATE artists SET name = ?, location = ?, bio = ?, image = ?, chapters = ?, members = ?, status = 'APPROVED' WHERE id = ?"
            ).bind(name, location, bio, image, JSON.stringify(chapters), JSON.stringify(members), id)
        ];

        if (reviewRequestId) {
            statements.push(db.prepare("UPDATE requests SET status = 'APPROVED' WHERE id = ?").bind(reviewRequestId));
        }

        await db.batch(statements);
    } else {
        await createUnifiedRequest("ARTIST_EDIT", id, { name, location, bio, image, chapters, members });
    }

    revalidatePath("/admin");
    revalidatePath("/directories");
    revalidatePath("/account");
}

// Bookings CRUD (All users, pending approval)
export async function leaveArtist(artistId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const db = await getDB();
    const artist = await db.prepare("SELECT * FROM artists WHERE id = ?").bind(artistId).first() as Artist | null;

    if (!artist) throw new Error("Artist not found");
    // Remove checks for owner leaving - anyone can leave
    // if (artist.owner_id === session.user.id) throw new Error("Owner cannot leave");

    let members: string[] = [];
    try {
        members = artist.members ? JSON.parse(artist.members) : [];
    } catch {
        members = [];
    }

    const newMembers = members.filter(id => id !== session.user!.id);

    if (newMembers.length === 0) {
        // If no members left, delete the artist
        await db.prepare("DELETE FROM artists WHERE id = ?").bind(artistId).run();
    } else {
        await db.prepare("UPDATE artists SET members = ? WHERE id = ?")
            .bind(JSON.stringify(newMembers), artistId).run();
    }

    revalidatePath("/account");
    revalidatePath("/directories");
}

export async function createBooking(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const questions = formData.get("questions") as string;

    // Dates data is sent as arrays from the dynamic form
    const dates = formData.getAll("dates[]") as string[];
    const times = formData.getAll("times[]") as string[];
    const durations = formData.getAll("durations[]") as string[];
    const eventTypes = formData.getAll("eventTypes[]") as string[];
    const locations = formData.getAll("locations[]") as string[];
    const descriptions = formData.getAll("descriptions[]") as string[];
    const budgets = formData.getAll("budgets[]") as string[];

    const db = await getDB();
    const bookingId = crypto.randomUUID();

    const statements = [
        db.prepare(`
            INSERT INTO bookings (id, name, email, phone, questions, created_by, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        `).bind(bookingId, name, email, phone, questions, session.user.id)
    ];

    for (let i = 0; i < dates.length; i++) {
        statements.push(
            db.prepare(`
                INSERT INTO booking_dates (id, booking_id, date, time, duration, event_type, location, description, budget, is_public)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            `).bind(
                crypto.randomUUID(),
                bookingId,
                dates[i],
                times[i],
                durations[i] || null,
                eventTypes[i] || null,
                locations[i],
                descriptions[i] || null,
                budgets[i] || null
            )
        );
    }

    await db.batch(statements);

    await createUnifiedRequest("BOOKING_INQUIRY", bookingId, { name, email, phone });

    revalidatePath("/bookings");
    revalidatePath("/admin");
}

export async function approveBooking(bookingId: string) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();
    await db.prepare("UPDATE bookings SET status = 'APPROVED' WHERE id = ?").bind(bookingId).run();

    revalidatePath("/admin");
    revalidatePath("/bookings");
}

export async function toggleBookingDatePublic(dateId: string, isPublic: boolean) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();
    await db.prepare("UPDATE booking_dates SET is_public = ? WHERE id = ?")
        .bind(isPublic ? 1 : 0, dateId)
        .run();

    revalidatePath("/admin");
    revalidatePath("/events");
}

export async function deleteBooking(bookingId: string) {
    const session = await auth();
    const db = await getDB();

    // Check permissions: Admin or Creator
    const booking = await db.prepare("SELECT created_by FROM bookings WHERE id = ?").bind(bookingId).first() as { created_by: string } | null;
    if (!booking) throw new Error("Booking not found");

    if (!isAdmin(session?.user?.email) && session?.user?.id !== booking.created_by) {
        throw new Error("Unauthorized");
    }

    await db.batch([
        db.prepare("DELETE FROM bookings WHERE id = ?").bind(bookingId),
        db.prepare("DELETE FROM requests WHERE target_id = ?").bind(bookingId)
    ]);

    revalidatePath("/admin");
    revalidatePath("/bookings");
}


export async function updateUser(formData: FormData) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const id = formData.get("id") as string;
    const reviewRequestId = formData.get("reviewRequestId") as string | null;
    const name = formData.get("name") as string;
    const role = formData.get("role") as Role;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const chapters = formData.getAll("chapters") as string[];
    const director_chapters = formData.getAll("director_chapters") as string[];

    const db = await getDB();

    const statements = [
        db.prepare(
            "UPDATE users SET name = ?, role = ?, location = ?, bio = ?, chapters = ?, director_chapters = ? WHERE id = ?"
        ).bind(
            name,
            role,
            location,
            bio,
            JSON.stringify(chapters),
            director_chapters.length > 0 ? JSON.stringify(director_chapters) : null,
            id
        )
    ];

    if (reviewRequestId) {
        statements.push(db.prepare("UPDATE requests SET status = 'APPROVED' WHERE id = ?").bind(reviewRequestId));
    }

    if (role === 'Musician' || role === 'Chapter Director') {
        const existing = await db.prepare("SELECT id FROM artists WHERE owner_id = ?").bind(id).first();
        if (!existing) {
            const user = await db.prepare("SELECT image FROM users WHERE id = ?").bind(id).first() as { image: string | null };
            statements.push(db.prepare(
                "INSERT INTO artists (id, name, location, bio, image, owner_id, status, members, chapters) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)"
            ).bind(
                crypto.randomUUID(),
                name,
                location,
                bio,
                user?.image || null,
                id,
                JSON.stringify([id]),
                JSON.stringify(chapters)
            ));
        }
    } else if (role === 'Audience') {
        const cleanup = await getArtistCleanupStatements(db, id);
        statements.push(...cleanup);

        const staleRequestCleanup = await getPendingArtistRequestCleanupStatements(db, id);
        statements.push(...staleRequestCleanup);
    }

    await db.batch(statements);

    revalidatePath("/admin");
    revalidatePath("/directories");
    revalidatePath("/account");
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) throw new Error("Admin only");

    const db = await getDB();

    // 1. Get user for existence check
    const user = await db.prepare("SELECT name FROM users WHERE id = ?").bind(userId).first() as { name: string } | null;
    if (!user) throw new Error("User not found");

    // 2. Fetch all artists to determine deletions vs updates
    const allArtistsResult = await db.prepare("SELECT * FROM artists").all();
    const allArtists = allArtistsResult.results as unknown as Artist[];

    const artistsToDelete = allArtists.filter(a => a.owner_id === userId).map(a => a.id);
    const artistsToUpdate = allArtists.filter(a => a.owner_id !== userId && a.members?.includes(userId)).map(a => {
        let members: string[] = JSON.parse(a.members || "[]");
        members = members.filter(id => id !== userId);
        return { id: a.id, members: JSON.stringify(members) };
    });

    const staleRequestCleanup = await getPendingArtistRequestCleanupStatements(db, userId);

    // 3. Prepare batch statements
    const statements = [
        db.prepare("DELETE FROM users WHERE id = ?").bind(userId),
        db.prepare("DELETE FROM role_requests WHERE user_id = ?").bind(userId),
        db.prepare("DELETE FROM requests WHERE user_id = ? OR target_id = ?").bind(userId, userId),
        db.prepare("DELETE FROM bookings WHERE created_by = ?").bind(userId),
        // booking_artists cleanup is handled by CASCADE if configured, but let's be safe
        db.prepare("DELETE FROM booking_artists WHERE booking_id IN (SELECT id FROM bookings WHERE created_by = ?)").bind(userId),
        ...artistsToDelete.map(id => db.prepare("DELETE FROM artists WHERE id = ?").bind(id)),
        ...artistsToUpdate.map(a => db.prepare("UPDATE artists SET members = ? WHERE id = ?").bind(a.members, a.id)),
        ...staleRequestCleanup
    ];

    await db.batch(statements);

    revalidatePath("/admin");
    revalidatePath("/directories");
}

export async function completeUserSetup(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const chapters = formData.getAll("chapters") as string[];
    const role = (formData.get("role") as Role) || "Audience";
    const director_chapters = formData.getAll("director_chapters") as string[];

    const db = await getDB();

    // If role is Musician or Chapter Director, we handle it as a request instead of direct update?
    // User requested folding it into the modal.
    // If it's a NEW user completing setup, maybe they can't jump straight to Musician/Director without approval?
    // Requirements say "for approval by admin" for Chapter Director and Musician.

    // So if role is NOT Audience, we should probably:
    // 1. Update the profile basics (bio, location, chapters)
    // 2. Create a ROLE_CHANGE request.

    const statements = [
        db.prepare(
            "UPDATE users SET location = ?, bio = ?, chapters = ? WHERE id = ?"
        ).bind(location, bio, JSON.stringify(chapters), session.user.id)
    ];

    await db.batch(statements);

    if (role !== 'Audience') {
        await createUnifiedRequest("ROLE_CHANGE", session.user.id, {
            role,
            location,
            bio,
            chapters,
            director_chapters
        });
    }

    revalidatePath("/account");
    revalidatePath("/directories");
}

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const bio = formData.get("bio") as string;
    const chapters = formData.getAll("chapters") as string[];
    const role = formData.get("role") as Role;
    const director_chapters = formData.getAll("director_chapters") as string[];

    await createUnifiedRequest("USER_EDIT", session.user.id, {
        name,
        location,
        bio,
        chapters,
        role,
        director_chapters
    });

    revalidatePath("/account");
    revalidatePath("/directories");
    revalidatePath("/admin");
}

export async function updateBooking(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const questions = formData.get("questions") as string;
    const isAdminAction = formData.get("isAdminAction") === "true";

    const dates = formData.getAll("dates[]") as string[];
    const times = formData.getAll("times[]") as string[];
    const durations = formData.getAll("durations[]") as string[];
    const eventTypes = formData.getAll("eventTypes[]") as string[];
    const locations = formData.getAll("locations[]") as string[];
    const descriptions = formData.getAll("descriptions[]") as string[];
    const budgets = formData.getAll("budgets[]") as string[];

    const db = await getDB();

    // Check ownership or admin
    const existingResult = await db.prepare("SELECT created_by FROM bookings WHERE id = ?").bind(id).first();
    const existing = existingResult as { created_by: string } | null;
    if (!existing) throw new Error("Booking not found");
    if (!isAdmin(session?.user?.email) && existing.created_by !== session.user.id) throw new Error("Unauthorized");

    if (isAdmin(session?.user?.email) && isAdminAction) {
        const reviewRequestId = formData.get("reviewRequestId") as string | null;
        const statements = [
            db.prepare("UPDATE bookings SET name = ?, email = ?, phone = ?, questions = ?, status = 'APPROVED' WHERE id = ?").bind(
                name, email, phone, questions, id
            ),
            db.prepare("DELETE FROM booking_dates WHERE booking_id = ?").bind(id)
        ];

        for (let i = 0; i < dates.length; i++) {
            statements.push(
                db.prepare(`
                    INSERT INTO booking_dates (id, booking_id, date, time, duration, event_type, location, description, budget, is_public)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                `).bind(
                    crypto.randomUUID(),
                    id,
                    dates[i],
                    times[i],
                    durations[i] || null,
                    eventTypes[i] || null,
                    locations[i],
                    descriptions[i] || null,
                    budgets[i] || null
                )
            );
        }

        if (reviewRequestId) {
            statements.push(db.prepare("UPDATE requests SET status = 'APPROVED' WHERE id = ?").bind(reviewRequestId));
        }

        await db.batch(statements);
    } else {
        await createUnifiedRequest("BOOKING_EDIT", id, {
            name, email, phone, questions,
            dates, times, durations, eventTypes, locations, descriptions, budgets
        });
    }

    revalidatePath("/bookings");
    revalidatePath("/admin");
}
