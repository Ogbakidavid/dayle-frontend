"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, File as FileIcon, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";

export default function SubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const { vaultId, milestoneId } = params;

  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission logic
    console.log("Submitting:", { files, comment });
    router.push(`/freelancer/vault/${vaultId}`);
  };

  return (
    <div className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <Link
            href={`/freelancer/vault/${vaultId}/milestones/${milestoneId}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Milestone
          </Link>
          <h1 className="text-3xl font-bold text-white">Submit Work</h1>
          <p className="text-gray-400 mt-2">
            Upload deliverables and provide comments for the client.
          </p>
        </header>

        <Card className="bg-[#0D0D0E] border-white/5">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-white">Upload Files</Label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/[0.02] transition-colors text-center cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-white">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: PDF, ZIP, PNG, JPG (Max 50MB)
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-white">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className="text-white">
                  Comments (Optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Add any notes about your submission..."
                  className="bg-black/30 border-white/10 text-white min-h-[120px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <Link href={`/freelancer/vault/${vaultId}`}>
                  <Button
                    variant="ghost"
                    type="button"
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold px-8"
                >
                  Submit for Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
