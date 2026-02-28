"use client";

import { useState, useMemo } from "react";
import { createBooking, updateBooking } from "@/lib/actions";
import { Booking, BookingDate, UnifiedRequest } from "@/lib/db";
import Image from "next/image";

interface BookingFormProps {
    disabled?: boolean;
    booking?: Booking & { dates: BookingDate[] };
    pendingEdit?: UnifiedRequest;
    isAdmin?: boolean;
    onClose?: () => void;
    initialUserData?: { name?: string | null; email?: string | null };
    reviewRequestId?: string; // Add this
}

interface BookingDateItem {
    id: number;
    date: string;
    time: string;
    duration: string | null;
    eventType: string | null;
    location: string;
    description: string | null;
    budget: string | null;
}

export default function BookingForm({
    disabled = false,
    booking,
    pendingEdit,
    isAdmin = false,
    onClose,
    initialUserData,
    reviewRequestId // Add this
}: BookingFormProps) {
    const isEdit = !!booking;
    const isPending = !!pendingEdit;
    const pendingData = pendingEdit?.data ? JSON.parse(pendingEdit.data) : null;

    // Initialize dates from pending data, existing booking, or default
    const [dates, setDates] = useState<BookingDateItem[]>(() => {
        if (pendingData?.dates) {
            return pendingData.dates.map((_date: string, i: number) => ({
                id: i,
                date: pendingData.dates[i],
                time: pendingData.times[i],
                duration: pendingData.durations[i],
                eventType: pendingData.eventTypes[i],
                location: pendingData.locations[i],
                description: pendingData.descriptions[i],
                budget: pendingData.budgets[i]
            }));
        }
        if (booking?.dates) {
            return booking.dates.map((d, i) => ({
                id: i,
                date: d.date,
                time: d.time,
                duration: d.duration,
                eventType: d.event_type,
                location: d.location,
                description: d.description,
                budget: d.budget
            }));
        }
        return [{ id: 1, date: '', time: '', duration: '', eventType: '', location: '', description: '', budget: '' }];
    });

    const [name, setName] = useState(pendingData?.name ?? booking?.name ?? initialUserData?.name ?? '');
    const [email, setEmail] = useState(pendingData?.email ?? booking?.email ?? initialUserData?.email ?? '');
    const [phone, setPhone] = useState(pendingData?.phone ?? booking?.phone ?? '');
    const [questions, setQuestions] = useState(pendingData?.questions ?? booking?.questions ?? '');
    const [imagePreference, setImagePreference] = useState<'custom' | 'google'>(pendingData?.image_preference ?? booking?.image_preference ?? 'custom');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const initialDates = useMemo(() => {
        if (pendingData?.dates) {
            return pendingData.dates.map((_: string, i: number) => ({
                id: i,
                date: pendingData.dates[i],
                time: pendingData.times[i],
                duration: pendingData.durations[i],
                eventType: pendingData.eventTypes[i],
                location: pendingData.locations[i],
                description: pendingData.descriptions[i],
                budget: pendingData.budgets[i]
            }));
        }
        if (booking?.dates) {
            return booking.dates.map((d, i) => ({
                id: i,
                date: d.date,
                time: d.time,
                duration: d.duration,
                eventType: d.event_type,
                location: d.location,
                description: d.description,
                budget: d.budget
            }));
        }
        return [{ id: 1, date: '', time: '', duration: '', eventType: '', location: '', description: '', budget: '' }];
    }, [pendingData, booking]);

    const isDirty = useMemo(() => {
        const datesChanged = JSON.stringify(dates.map((d: BookingDateItem) => ({ ...d, id: undefined }))) !== JSON.stringify(initialDates.map((d: BookingDateItem) => ({ ...d, id: undefined })));

        return name !== (pendingData?.name ?? booking?.name ?? initialUserData?.name ?? '') ||
            email !== (pendingData?.email ?? booking?.email ?? initialUserData?.email ?? '') ||
            phone !== (pendingData?.phone ?? booking?.phone ?? '') ||
            questions !== (pendingData?.questions ?? booking?.questions ?? '') ||
            datesChanged ||
            imagePreference !== (pendingData?.image_preference ?? booking?.image_preference ?? 'custom') ||
            file !== null;
    }, [name, email, phone, questions, dates, initialDates, imagePreference, file, pendingData, booking, initialUserData]);

    const addDate = () => {
        if (dates.length < 100 && !disabled) {
            setDates([...dates, { id: Date.now(), date: '', time: '', duration: '', eventType: '', location: '', description: '', budget: '' }]);
        }
    };

    const removeDate = (id: number) => {
        if (dates.length > 1 && !disabled) {
            setDates(dates.filter((d: BookingDateItem) => d.id !== id));
        }
    };

    const updateDateField = (id: number, field: keyof BookingDateItem, value: string) => {
        setDates(dates.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    return (
        <form
            action={async (formData) => {
                let finalImageUrl = pendingData?.image ?? booking?.image ?? "";

                formData.set("image_preference", imagePreference);

                if (file) {
                    setIsUploading(true);
                    const uploadData = new FormData();
                    uploadData.append("file", file);

                    try {
                        const res = await fetch("/api/upload", {
                            method: "POST",
                            body: uploadData,
                        });

                        if (res.ok) {
                            const data = await res.json() as { url: string };
                            finalImageUrl = data.url;
                        } else {
                            alert("Image upload failed");
                            setIsUploading(false);
                            return;
                        }
                    } catch (e) {
                        console.error("Upload failed", e);
                        alert("Image upload failed");
                        setIsUploading(false);
                        return;
                    } finally {
                        setIsUploading(false);
                    }
                }

                if (finalImageUrl) {
                    formData.set("image", finalImageUrl);
                }

                if (isEdit) {
                    await updateBooking(formData);
                } else {
                    await createBooking(formData);
                }
                if (onClose) onClose();
            }}
            className="space-y-8"
        >
            {isEdit && <input type="hidden" name="id" value={booking.id} />}
            {reviewRequestId && <input type="hidden" name="reviewRequestId" value={reviewRequestId} />}
            {isAdmin && <input type="hidden" name="isAdminAction" value="true" />}

            <fieldset disabled={(disabled || (isPending && !isAdmin)) && !reviewRequestId} className="space-y-8">
                {isPending && !isAdmin && !reviewRequestId && (
                    <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 px-2 py-4 sm:p-4 mb-6">
                        <p className="text-sm font-medium italic text-zinc-800 dark:text-zinc-200">
                            An edit for this booking is currently pending approval.
                            The form shows the proposed changes.
                        </p>
                    </div>
                )}

                <div className="bg-zinc-50 dark:bg-zinc-900 px-2 py-8 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
                    <h3 className="text-xl font-bold uppercase tracking-tight border-b-2 border-red-600 inline-block">Contact Info</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Name</label>
                            <input
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Phone</label>
                            <input
                                name="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold uppercase tracking-tight border-b-2 border-red-600 inline-block">Requested Dates</h3>
                        <button
                            type="button"
                            onClick={addDate}
                            className={`text-xs font-bold uppercase tracking-widest py-2 px-2 sm:px-4 transition-colors ${disabled || (isPending && !isAdmin)
                                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                : "bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white"
                                }`}
                        >
                            + Add Another Date
                        </button>
                    </div>

                    {dates.map((d: BookingDateItem, index: number) => (
                        <div key={d.id} className="bg-zinc-50 dark:bg-zinc-900 px-2 py-8 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 relative group">
                            {dates.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeDate(d.id)}
                                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            )}
                            <span className="absolute top-4 left-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date #{index + 1}</span>

                            <div className="grid md:grid-cols-3 gap-6 pt-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Date</label>
                                    <input name="dates[]" type="date" value={d.date} onChange={(e) => updateDateField(d.id, 'date', e.target.value)} required className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Time</label>
                                    <input name="times[]" type="time" value={d.time} onChange={(e) => updateDateField(d.id, 'time', e.target.value)} required className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Duration</label>
                                    <input name="durations[]" value={d.duration ?? ''} onChange={(e) => updateDateField(d.id, 'duration', e.target.value)} placeholder="e.g. 2 hours" className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Type of Event</label>
                                    <input name="eventTypes[]" value={d.eventType ?? ''} onChange={(e) => updateDateField(d.id, 'eventType', e.target.value)} placeholder="Concert, Wedding, etc" required className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Location</label>
                                    <input name="locations[]" value={d.location} onChange={(e) => updateDateField(d.id, 'location', e.target.value)} placeholder="Venue / Address" required className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                                    <textarea name="descriptions[]" value={d.description ?? ''} onChange={(e) => updateDateField(d.id, 'description', e.target.value)} placeholder="Details about the performance..." className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors h-24 disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Approximate Budget</label>
                                    <input name="budgets[]" value={d.budget ?? ''} onChange={(e) => updateDateField(d.id, 'budget', e.target.value)} placeholder="$" className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors disabled:opacity-50" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 px-2 py-8 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Any other questions?</label>
                        <textarea
                            name="questions"
                            value={questions}
                            onChange={(e) => setQuestions(e.target.value)}
                            className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors h-32 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Display Image</label>
                        <div className="space-y-4 bg-white dark:bg-black px-2 py-6 sm:p-6 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="image_preference_ui"
                                        value="custom"
                                        checked={imagePreference === 'custom'}
                                        onChange={() => setImagePreference('custom')}
                                        className="accent-red-600"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">Custom Upload</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="image_preference_ui"
                                        value="google"
                                        checked={imagePreference === 'google'}
                                        onChange={() => setImagePreference('google')}
                                        className="accent-red-600"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">Google Photo</span>
                                </label>
                            </div>

                            {imagePreference === 'custom' && (
                                <div className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        {(booking?.image || pendingData?.image) && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Current Custom Image</p>
                                                <div className="aspect-square w-24 relative border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden grayscale-[0.5]">
                                                    <Image src={(pendingData?.image ?? booking?.image)!} alt="Current" fill className="object-cover" unoptimized />
                                                </div>
                                            </div>
                                        )}
                                        {previewUrl && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest text-green-600">New Preview</p>
                                                <div className="aspect-square w-24 relative border-2 border-green-500 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const selected = e.target.files?.[0] || null;
                                            setFile(selected);
                                            if (selected) {
                                                setPreviewUrl(URL.createObjectURL(selected));
                                            }
                                        }}
                                        className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 outline-none focus:border-red-600 transition-colors text-sm"
                                    />
                                </div>
                            )}

                            {imagePreference === 'google' && (
                                <div className="pt-2 space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Google Profile Photo</p>
                                    <div className="w-24 h-24 rounded-full border-2 border-red-600 overflow-hidden relative">
                                        {/* Since we don't always have initialUserData here, we might need to show a placeholder or fetch it */}
                                        {(booking as Booking & { user_image?: string; user?: { image?: string } })?.user_image || (booking as Booking & { user_image?: string; user?: { image?: string } })?.user?.image ? (
                                            <Image
                                                src={(booking as Booking & { user_image?: string; user?: { image?: string } })?.user_image || (booking as Booking & { user_image?: string; user?: { image?: string } })?.user?.image || ""}
                                                alt="Google Photo"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase">No Photo</div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 italic">Using your default photo from Google Login.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            className={`flex-1 font-bold uppercase py-4 transition-all tracking-widest shadow-lg ${(disabled || (isPending && !isAdmin)) && !reviewRequestId
                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                                : (!isDirty && !reviewRequestId) || isUploading
                                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                                    : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 active:scale-[0.99]"
                                }`}
                            disabled={(!isDirty && !reviewRequestId) || ((disabled || (isPending && !isAdmin)) && !reviewRequestId) || isUploading}
                        >
                            {isUploading ? "Uploading..." : (reviewRequestId && isAdmin ? "Approve & Save Changes" : (isAdmin ? "Save Booking" : (isPending ? "Request Pending" : (isEdit ? "Request Booking Update" : "Submit Booking Inquiry"))))}
                        </button>
                        {reviewRequestId && isAdmin && (
                            <button
                                type="button"
                                onClick={() => {
                                    import("@/lib/actions").then(m => m.rejectUnifiedRequest(reviewRequestId));
                                }}
                                className="bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase py-4 px-2 sm:px-8 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all text-sm tracking-widest active:scale-[0.98] shadow-lg"
                            >
                                Reject Request
                            </button>
                        )}
                    </div>
                </div>
            </fieldset>
        </form>
    );
}
