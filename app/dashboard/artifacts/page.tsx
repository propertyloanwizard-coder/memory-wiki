"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { Image, Upload, X, Trash2, Search } from "lucide-react";

interface Attachment {
  id: string;
  log_id: string | null;
  user_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  thumbnail_url: string | null;
  description: string | null;
  file_size: number | null;
  created_at: string;
}

export default function ArtifactsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadType, setUploadType] = useState<"image" | "document">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, []);

  async function loadAttachments() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading attachments:", error);
    } else {
      setAttachments(data || []);
    }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to upload.");
      setUploading(false);
      return;
    }

    // Create unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("artifacts")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("artifacts")
      .getPublicUrl(filePath);

    // Insert record into attachments table
    const { error: dbError } = await supabase
      .from("attachments")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type.startsWith("image/") ? "image" : "document",
        file_url: publicUrl,
        description: uploadDescription || null,
        file_size: file.size,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      alert(`Database error: ${dbError.message}`);
      setUploading(false);
      return;
    }

    // Reset and reload
    setUploadDescription("");
    setUploadType("image");
    if (fileInputRef.current) fileInputRef.current.value = "";
    await loadAttachments();
    setUploading(false);
  }

  async function handleDelete(id: string, fileUrl: string) {
    if (!confirm("Delete this attachment?")) return;

    const supabase = createClient();

    // Extract path from URL for storage deletion
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/");
    // URL format: /storage/v1/object/public/artifacts/{user_id}/{file_name}
    const artifactIndex = pathParts.indexOf("artifacts");
    const filePath = pathParts.slice(artifactIndex + 1).join("/");

    // Delete from storage
    await supabase.storage.from("artifacts").remove([filePath]);

    // Delete from database
    await supabase.from("attachments").delete().eq("id", id);

    if (selectedFile === id) setSelectedFile(null);
    await loadAttachments();
  }

  const filteredAttachments = searchQuery
    ? attachments.filter(
        (a) =>
          a.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : attachments;

  const imageAttachments = filteredAttachments.filter((a) => a.file_type === "image");
  const documentAttachments = filteredAttachments.filter((a) => a.file_type !== "image");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Artifacts</h1>
          <p className="text-sm text-gray-400 mt-1">
            Uploaded images, documents, and files from your conversations
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload File
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.csv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer file:transition-colors"
              disabled={uploading}
            />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as "image" | "document")}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="image">Image</option>
              <option value="document">Document</option>
            </select>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search attachments by name or description..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-400">
        <span>{filteredAttachments.length} total</span>
        <span>•</span>
        <span>{imageAttachments.length} images</span>
        <span>•</span>
        <span>{documentAttachments.length} documents</span>
      </div>

      {/* Images Grid */}
      {imageAttachments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="group relative aspect-square bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors"
              >
                <img
                  src={attachment.file_url}
                  alt={attachment.file_name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() =>
                    selectedFile === attachment.id
                      ? setSelectedFile(null)
                      : setSelectedFile(attachment.id)
                  }
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      selectedFile === attachment.id
                        ? setSelectedFile(null)
                        : setSelectedFile(attachment.id)
                    }
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="View"
                  >
                    <Image className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(attachment.id, attachment.file_url)}
                    className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white truncate">{attachment.file_name}</p>
                  {attachment.description && (
                    <p className="text-xs text-gray-300 truncate">{attachment.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      {documentAttachments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Documents
          </h3>
          <div className="space-y-2">
            {documentAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  {attachment.description && (
                    <p className="text-sm text-gray-400">{attachment.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {attachment.file_size
                      ? `${(attachment.file_size / 1024).toFixed(1)} KB`
                      : "Unknown size"}
                    {" • "}
                    {new Date(attachment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => handleDelete(attachment.id, attachment.file_url)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected image modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {(() => {
              const attachment = attachments.find((a) => a.id === selectedFile);
              if (!attachment) return null;
              return (
                <>
                  <img
                    src={attachment.file_url}
                    alt={attachment.file_name}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-white font-medium">{attachment.file_name}</p>
                    {attachment.description && (
                      <p className="text-gray-400 text-sm">{attachment.description}</p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredAttachments.length === 0 && (
        <div className="text-center py-16 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-700">
          <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? "No matching files" : "No artifacts yet"}
          </h3>
          <p className="text-sm">
            {searchQuery
              ? "Try different keywords."
              : "Upload images and documents from your conversations to see them here."}
          </p>
        </div>
      )}
    </div>
  );
}
