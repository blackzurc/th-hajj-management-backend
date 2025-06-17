// src/Admin/UserDocumentsModal.js
import React from 'react';

const UserDocumentsModal = ({ userId, documents, closeModal }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md max-w-2xl max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">User Documents - User ID: {userId}</h3>
                {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map(doc => (
                            <div key={doc.document_id} className="border rounded-lg p-4">
                                <h4 className="font-semibold">{doc.document_type}</h4>
                                {doc.file_path ? (
                                    <>
                                        {doc.file_path.toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center">
                                                <a
                                                    href={`http://localhost:5000/${doc.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline mb-2"
                                                >
                                                    View PDF Document
                                                </a>
                                                <embed
                                                    src={`http://localhost:5000/${doc.file_path}#toolbar=0&navpanes=0`}
                                                    type="application/pdf"
                                                    width="100%"
                                                    height="300px"
                                                    className="border"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={`http://localhost:5000/${doc.file_path}`}
                                                    alt={doc.document_type}
                                                    className="max-w-full h-64 object-contain"
                                                    onError={(e) => {
                                                        const container = e.target.parentElement;
                                                        if (container) {
                                                            container.innerHTML =
                                                                `<p class="text-red-500">Failed to load image. <a href="http://localhost:5000/${doc.file_path}" target="_blank" class="text-blue-600 hover:underline">Try opening directly</a></p>`;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2 text-center">{doc.file_name}</p>
                                    </>
                                ) : (
                                    <p className="text-red-500">No file available</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No documents found for this user.</p>
                )}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDocumentsModal;