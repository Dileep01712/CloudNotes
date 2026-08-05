export default function NotesGrid({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section>
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    Your Notes
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Everything you create lives here.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </section>
    );
}