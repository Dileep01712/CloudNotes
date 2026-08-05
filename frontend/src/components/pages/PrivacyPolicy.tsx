import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function PrivacyPolicy() {
    return (
        <div className="mx-auto max-w-7xl py-16">
            <div className="mx-auto bg-white rounded-2xl border border-zinc-100 p-8 sm:p-12 shadow-xl shadow-zinc-200/20">
                <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition mb-8 select-none"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xxs" />
                    Back to registration
                </Link>

                <div className="border-b border-zinc-100 pb-6 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Privacy Policy</h1>
                    <p className="mt-2 text-sm text-zinc-400 font-medium">Last Updated: June 2026</p>
                </div>

                <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium">
                    <p>
                        At <strong>CloudNotes</strong>, accessible from our application platform, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by CloudNotes and how we use it.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">1. Information We Collect</h2>
                    <p>
                        If you register for an account, we store your profile authentication credentials securely:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-500">
                        <li>Your account profile name.</li>
                        <li>Your explicit email address (used for OTP logins and identity verifications).</li>
                        <li>A securely cryptographically encrypted hash of your chosen login password.</li>
                    </ul>
                    <p>
                        We collect and store the text contents, folder mappings, metadata, and visual system records you explicitly create inside your note-taking workspaces to render them across devices.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">2. How We Use Your Information</h2>
                    <p>We use the information we collect in various ways, including to:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-500">
                        <li>Provide, operate, maintain, and secure our note-taking services.</li>
                        <li>Improve, personalize, and expand CloudNotes functionalities.</li>
                        <li>Understand and analyze how you interact with our application dashboard.</li>
                        <li>Send you automated system security logs (like OTP verification tokens).</li>
                    </ul>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">3. Data Encryption and Storage</h2>
                    <p>
                        We take continuous preventative structural layout precautions to safeguard your database files. Your account login password is protected using modern hashing protocols (bcrypt) before ever entering storage. It can never be read by database maintainers or administrators.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">4. Third-Party Services</h2>
                    <p>
                        CloudNotes relies on basic, trusted industry third-party integrations to function (such as MongoDB cloud hosting instances and transactional SMTP engines to deliver verification emails). These providers only process information as strictly required to complete technical actions.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">5. Contact Information</h2>
                    <p>
                        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us directly via support communications.
                    </p>
                </div>

            </div>
        </div>
    );
}