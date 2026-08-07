import { Dispatch, SetStateAction, useState } from "react";
import { Folder } from "@/context/types";
import { FOLDER_COLORS } from "@/lib/helper";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInfo,
    faPencil,
    faThumbTack,
    faThumbTackSlash,
    faPalette,
    faTrash,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

interface FolderDropdownMenuProps {
    folder: Folder;
    showMenu: boolean;
    isPinned: boolean;
    setShowMenu: Dispatch<SetStateAction<boolean>>;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    setShowDetails: Dispatch<SetStateAction<boolean>>;
    onFolderPinToggle: (folder: Folder) => void;
    onFolderColorChange: (folder: Folder, color: string | null) => void;
    onFolderMoveToTrash: (folder: Folder) => void;
}

export default function FolderDropdownMenu({
    folder,
    showMenu,
    isPinned,
    setShowMenu,
    setIsEditing,
    setShowDetails,
    onFolderPinToggle,
    onFolderColorChange,
    onFolderMoveToTrash,
}: FolderDropdownMenuProps) {
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    if (!showMenu) {
        if (showColorPicker) {
            setShowColorPicker(false);
        }
        return null;
    }

    const menuItems = [
        {
            key: "rename",
            icon: faPencil,
            label: "Rename",
            onClick: () => {
                setShowMenu(false);
                setIsEditing(true);
            },
            className: 'text-zinc-600 hover:bg-zinc-50 hover:text-black',
            iconClassName: 'text-zinc-400',
        },
        {
            key: "pin",
            icon: isPinned ? faThumbTackSlash : faThumbTack,
            label: isPinned ? "Unpin" : "Pin",
            onClick: () => {
                setShowMenu(false);
                onFolderPinToggle?.(folder);
            },
            className: 'text-zinc-600 hover:bg-zinc-50 hover:text-black',
            iconClassName: 'text-zinc-400',
        },
        {
            key: "colors",
            icon: faPalette,
            label: "Color",
            onClick: () => {
                setShowColorPicker(true);
            },
            className: 'text-zinc-600 hover:bg-zinc-50 hover:text-black',
            iconClassName: 'text-zinc-400',
        },
        {
            key: "details",
            icon: faInfo,
            label: "Details",
            onClick: () => {
                setShowDetails(true);
            },
            className: 'text-zinc-600 hover:bg-zinc-50 hover:text-black',
            iconClassName: 'text-zinc-400',
        },
    ];

    const deleteItem = {
        key: "delete",
        icon: faTrash,
        label: "Trash",
        onClick: () => {
            setShowMenu(false);
            onFolderMoveToTrash(folder);
        },
        className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
        iconClassName: 'text-red-600',
    };

    return (
        <div className="absolute right-0 top-0 z-0 flex w-full origin-top-right flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 animate-in fade-in">
            {showColorPicker ? (
                <div className="flex flex-col animate-in fade-in p-5">
                    <div className="flex items-center justify-between mb-3 select-none">
                        <h3 className="text-sm font-bold text-black">Select Color</h3>
                        <Button
                            variant="ghost"
                            className="group/btn h-7 px-2 text-xs font-medium text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowColorPicker(false);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="transition-transform transform group-hover/btn:-translate-x-1 leading-none"
                            />
                            <span className="font-sans leading-none">Back</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-5 gap-y-3.75 gap-x-5 justify-items-center max-h-36.75">
                        {FOLDER_COLORS.map((color) => {
                            const isActive = folder.color === color.id || (!folder.color && color.id === 'none');

                            return (
                                <Button
                                    key={color.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFolderColorChange?.(folder, color.id === 'none' ? null : color.id);
                                        setShowColorPicker(false);
                                        setShowMenu(false);
                                    }}
                                    className="flex flex-col items-center group/col cursor-pointer bg-white hover:bg-white border-none p-0 focus:outline-none w-full h-auto"
                                >
                                    <div className={`w-8 h-8 rounded-full transition-all duration-200 group-hover/col:scale-110
                                        ${color.bgClass}
                                        ${isActive
                                            ? 'ring-2 ring-offset-2 ring-zinc-300 scale-110'
                                            : 'ring-0'
                                        }
                                    `}/>

                                    <p className="text-xs font-semibold text-zinc-400 capitalize mt-2 group-hover/col:text-black transition-colors select-none">
                                        {color.id}
                                    </p>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1 p-2.25">
                    {menuItems.map((item) => (
                        <Button
                            key={item.key}
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                item.onClick();
                            }}
                            className={`flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer ${item.className}`}
                        >
                            <FontAwesomeIcon icon={item.icon} className={`w-4 ${item.iconClassName}`} />
                            {item.label}
                        </Button>
                    ))}

                    <p className="border-t" />

                    <Button
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteItem.onClick();
                        }}
                        className={`flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer ${deleteItem.className}`}
                    >
                        <FontAwesomeIcon icon={deleteItem.icon} className={`w-4 ${deleteItem.iconClassName}`} />
                        {deleteItem.label}
                    </Button>
                </div>
            )}
        </div >
    );
}