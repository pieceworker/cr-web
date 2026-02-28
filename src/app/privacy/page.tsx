import React from 'react';

export const metadata = {
    title: 'Privacy Policy | Classical Revolution',
    description: 'Privacy Policy for Classical Revolution.',
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-2 sm:px-6 space-y-8">
            <h1 className="text-4xl font-black uppercase italic text-zinc-900 dark:text-white">
                Privacy Policy
            </h1>
            <p className="text-sm text-zinc-500">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="space-y-4 text-zinc-800 dark:text-zinc-200">
                <h2 className="text-2xl font-bold uppercase">1. Introduction</h2>
                <p>
                    Welcome to Classical Revolution. This Privacy Policy explains how we collect, use,
                    disclose, and safeguard your information when you visit our website and use our application.
                </p>

                <h2 className="text-2xl font-bold uppercase">2. Information We Collect</h2>
                <p>
                    We may collect information about you in a variety of ways. When you register for an account
                    using third-party providers (like Google), we receive certain profile information.
                </p>

                <h3 className="text-xl font-bold">Google User Data</h3>
                <p>
                    If you choose to log in or register using your Google account, our application will
                    access, use, and store certain Google user data:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Email Address:</strong> We use your email address as your primary account
                        identifier and to communicate with you regarding your account, events, and important updates.
                    </li>
                    <li>
                        <strong>Basic Profile Information:</strong> We may access your name and profile picture
                        to personalize your experience and display your identity within the application.
                    </li>
                </ul>
                <p>
                    <strong>How we use this data:</strong> We strictly use your Google user data for authentication,
                    account creation, and identifying you as a user within Classical Revolution.
                </p>
                <p>
                    <strong>How we share this data:</strong> We <strong>do not</strong> share your Google user data
                    with any third parties, except as required by law or to protect our rights.
                </p>

                <h2 className="text-2xl font-bold uppercase">3. How We Store Your Information</h2>
                <p>
                    We use administrative, technical, and physical security measures to help protect your
                    personal information. While we have taken reasonable steps to secure the personal
                    information you provide to us, please be aware that despite our efforts, no security
                    measures are perfect or impenetrable.
                </p>

                <h2 className="text-2xl font-bold uppercase">4. Changes to This Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes
                    by updating the &quot;Last Updated&quot; date of this Privacy Policy and, if the changes are
                    significant regarding how we use your Google user data or other personal information,
                    we will notify you more prominently.
                </p>

                <h2 className="text-2xl font-bold uppercase">5. Contact Us</h2>
                <p>
                    If you have questions or comments about this Privacy Policy, please contact us at:
                    <br />
                    <a href="mailto:info@classicalrevolution.org" className="text-red-600 hover:underline">
                        info@classicalrevolution.org
                    </a>
                </p>
            </section>
        </div>
    );
}
