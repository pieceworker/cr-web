import React from 'react';

export const metadata = {
    title: 'Terms of Service | Classical Revolution',
    description: 'Terms of Service for Classical Revolution.',
};

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6 space-y-8">
            <h1 className="text-4xl font-black uppercase italic text-zinc-900 dark:text-white">
                Terms of Service
            </h1>
            <p className="text-sm text-zinc-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="space-y-4 text-zinc-800 dark:text-zinc-200">
                <h2 className="text-2xl font-bold uppercase">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Classical Revolution website and services, you agree to be
                    bound by these Terms of Service. If you disagree with any part of the terms, then you
                    may not access the service.
                </p>

                <h2 className="text-2xl font-bold uppercase">2. Use of Service</h2>
                <p>
                    You agree not to use the service for any unlawful purpose or any purpose prohibited under
                    this clause. You agree not to use the service in any way that could damage the website,
                    services, or general business of Classical Revolution.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You must not harass, abuse, or threaten others or otherwise violate any person&apos;s legal rights.</li>
                    <li>You must not violate any intellectual property rights of the organization or any third party.</li>
                    <li>You must not engage in any activity that interferes with or disrupts the service.</li>
                </ul>

                <h2 className="text-2xl font-bold uppercase">3. User Accounts</h2>
                <p>
                    When you create an account with us, you must provide information that is accurate, complete,
                    and current at all times. Failure to do so constitutes a breach of the Terms, which may
                    result in immediate termination of your account on our service.
                </p>
                <p>
                    You are responsible for safeguarding the password or authentication credentials that you
                    use to access the service and for any activities or actions under your password.
                </p>

                <h2 className="text-2xl font-bold uppercase">4. Termination</h2>
                <p>
                    We may terminate or suspend access to our service immediately, without prior notice or
                    liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p>
                    All provisions of the Terms which by their nature should survive termination shall survive
                    termination, including, without limitation, ownership provisions, warranty disclaimers,
                    indemnity and limitations of liability.
                </p>

                <h2 className="text-2xl font-bold uppercase">5. Governing Law</h2>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of California, United States,
                    without regard to its conflict of law provisions.
                </p>

                <h2 className="text-2xl font-bold uppercase">6. Changes to Terms</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                    By continuing to access or use our service after those revisions become effective, you agree
                    to be bound by the revised terms.
                </p>

                <h2 className="text-2xl font-bold uppercase">7. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us at:
                    <br />
                    <a href="mailto:info@classicalrevolution.org" className="text-red-600 hover:underline">
                        info@classicalrevolution.org
                    </a>
                </p>
            </section>
        </div>
    );
}
