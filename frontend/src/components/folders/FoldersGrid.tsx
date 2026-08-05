import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

export default function FoldersGrid({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="flex flex-col items-center justify-center h-50 rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center select-none">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200/50 mb-3 text-zinc-400">
                    <FontAwesomeIcon icon={faFolder} size="2x" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-600">No folders yet</h3>
                <p className="text-xs text-zinc-400 mt-1">Create a new folder to organize your notes.</p>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {children}
            </div>
        </section>
    );
}