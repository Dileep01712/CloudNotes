import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud, faFileLines, faCircleCheck } from "@fortawesome/free-regular-svg-icons";

export default function About() {
  const features = [
    {
      key: "access",
      icon: faCloud,
      label: "Access Anywhere",
      description: "Your notes stay synced across devices, so you can continue your work whether you're on desktop, tablet, or mobile."
    },
    {
      key: "clean",
      icon: faFileLines,
      label: "Clean and Simple",
      description: "A distraction-free interface designed to help you focus on writing, organizing, and managing your ideas easily."
    },
    {
      key: "secure",
      icon: faCircleCheck,
      label: "Secure Storage",
      description: "Your notes are stored securely in the cloud so your important information stays safe and accessible."
    },
  ];

  return (
    <section className="mx-auto max-w-7xl py-16">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
          About CloudNotes
        </p>

        <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
          A simpler way to manage your notes.
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600 font-medium">
          CloudNotes helps you capture ideas, organize thoughts, and access your notes from anywhere without the mess of scattered notebooks and apps.
        </p>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {features.map((item) => (
          <div key={item.key} className="flex flex-col h-55 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-700 border border-zinc-100/50">
                <FontAwesomeIcon icon={item.icon} size="lg" />
              </div>

              <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                {item.label}
              </h2>
            </div>

            <p className="my-auto text-sm font-medium leading-relaxed text-zinc-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-28 max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          Built for everyday productivity.
        </h2>

        <p className="mt-6 text-lg leading-8 text-zinc-600 font-medium">
          Whether you're saving quick thoughts, planning projects, or organizing personal notes, CloudNotes gives you a fast and reliable workspace to keep everything in one place.
        </p>

        <p className="mt-8 text-zinc-500 font-medium">
          Thanks for using CloudNotes.
        </p>
      </div>

      <div className="mt-24 border-t border-zinc-200 pt-8 text-center">
        <p className="text-sm text-zinc-400 font-medium">
          &copy; 2025 - {new Date().getFullYear()} CloudNotes. All rights reserved.
        </p>
      </div>
    </section>
  );
}