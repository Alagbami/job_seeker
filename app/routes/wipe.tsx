import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDelete = async () => {
        setDeleting(true);
        setSuccess(false);
        for (const file of files) {
            await fs.delete(file.path);
        }
        await kv.flush();
        await loadFiles();
        setDeleting(false);
        setSuccess(true);
    };

    // Delete a single file by id
    const handleDeleteById = async (fileId: string, filePath: string) => {
        setDeletingId(fileId);
        setSuccess(false);
        await fs.delete(filePath);
        await loadFiles();
        setDeletingId(null);
        setSuccess(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="text-lg text-blue-700 animate-pulse font-semibold">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-red-200">
                <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow-lg font-semibold">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-xl border border-blue-100">
                <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-700 tracking-tight">
                    Wipe App Data
                </h2>
                <p className="text-gray-600 mb-6 text-center text-lg">
                    Authenticated as: <span className="font-semibold text-blue-800">{auth.user?.username}</span>
                </p>
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2 text-blue-700">Your Files</h3>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {files.length > 0 ? (
                            files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex flex-row gap-2 items-center bg-blue-50 border border-blue-100 rounded px-3 py-2"
                                >
                                    <span className="text-blue-900 font-medium flex-1">{file.name}</span>
                                    <button
                                        className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition ${
                                            deletingId === file.id ? "opacity-60 cursor-not-allowed" : ""
                                        }`}
                                        disabled={!!deletingId}
                                        onClick={() => handleDeleteById(file.id, file.path)}
                                    >
                                        {deletingId === file.id ? (
                                            <svg className="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        ) : (
                                            "Delete"
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 italic text-center">No files found.</div>
                        )}
                    </div>
                </div>
                <button
                    className={`w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow transition-all duration-200 ${
                        deleting || files.length === 0 ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    onClick={handleDelete}
                    disabled={deleting || files.length === 0}
                >
                    {deleting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            Wiping...
                        </span>
                    ) : (
                        "Wipe App Data"
                    )}
                </button>
                {success && (
                    <div className="mt-4 text-green-600 text-center font-semibold animate-fadeIn">
                        {deletingId
                            ? "File deleted successfully!"
                            : "All files and app data wiped successfully!"}
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-6 text-center">
                    <span className="font-semibold text-red-500">Warning:</span> This action is{" "}
                    <span className="font-bold">irreversible</span> and will permanently delete all your files and app data.
                </p>
            </div>
        </div>
    );
};

export default WipeApp;