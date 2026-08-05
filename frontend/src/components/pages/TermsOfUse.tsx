import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function TermsOfUse() {
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
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Terms of Use</h1>
                    <p className="mt-2 text-sm text-zinc-400 font-medium">Last Updated: June 2026</p>
                </div>

                <div className="space-y-6 text-sm text-zinc-600 leading-relaxed font-medium">
                    <p>
                        Welcome to <strong>CloudNotes</strong>. By accessing or using our software interface service, you indicate that you have read, understood, and agreed to be bound completely by these Terms of Use.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">1. Account Terms</h2>
                    <p>
                        To utilize CloudNotes workspace parameters, you must register an account verified by a secure one-time passcode sequence. You assume total responsibility for maintaining the strict confidentiality of your authorization session codes, login tokens, and passwords.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">2. Data Content Ownership</h2>
                    <p>
                        You retain total raw legal ownership and complete copyright properties of all original text notes, outlines, files, and content structures you manually generate or import inside CloudNotes. We claim zero proprietary privileges or intellectual processing access over your materials.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">3. Acceptable Conduct Bounds</h2>
                    <p>You explicitly agree not to use the CloudNotes technical deployment layout environment to:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-500">
                        <li>Violate local, national, or international structural laws or active safe regulations.</li>
                        <li>Attempt to brute-force, reverse-engineer, exploit, or flood our server architecture API paths.</li>
                        <li>Store explicitly harmful software scripts, virus structures, or automated bot components.</li>
                    </ul>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">4. Disclaimers & Limitation of Liability</h2>
                    <p className="italic bg-zinc-50 border-l-2 border-zinc-300 p-3 rounded-r-xl text-zinc-500">
                        CloudNotes is built, deployed, and maintained by a solo individual developer. The services, software assets, database sync loops, and file systems are provided completely on an "AS IS" and "AS AVAILABLE" performance foundation framework.
                    </p>
                    <p>
                        In no event shall CloudNotes or its independent creator assume operational liability for any unintentional server data losses, service downtime, note file sync dropouts, or unexpected system storage failures. We strongly encourage you to keep independent backup variations of critical documents.
                    </p>

                    <h2 className="text-lg font-bold text-zinc-900 pt-2">5. Service Changes</h2>
                    <p>
                        We reserve the right to modify application layout parameters, adjust backend collection configurations, or update service access limits at any point to sustain server performance stability metrics.
                    </p>
                </div>

            </div>
        </div>
    );
}