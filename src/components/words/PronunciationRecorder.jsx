import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * PronunciationRecorder
 * Props:
 *   existingUrl  - current saved audio URL (if any)
 *   onRecorded   - called with { url, oldUrl } when a new recording is uploaded
 *   onDelete     - called when the existing recording is deleted
 *   onUploading  - called with true/false during upload
 */
export default function PronunciationRecorder({ existingUrl, onRecorded, onDelete, onUploading }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(null); // null | 'uploading' | 'done' | 'error'
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const getSupportedMimeType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedMimeType();
    const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    const usedMime = mediaRecorder.mimeType || mimeType || "audio/webm";
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: usedMime });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setPreviewUrl(url);
      stream.getTracks().forEach(t => t.stop());

      // Auto-upload
      onUploading?.(true);
      setUploading("uploading");
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const file = new File([blob], `pronunciation.${ext}`, { type: blob.type });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploading("done");
      onRecorded({ url: file_url, oldUrl: existingUrl });
      onUploading?.(false);
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
    setAudioBlob(null);
    setPreviewUrl(null);
    setUploading(null);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handlePreviewPlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      audioRef.current.onended = () => setPlaying(false);
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    setPreviewUrl(null);
    setUploading(null);
    onRecorded({ url: "", oldUrl: existingUrl });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Recording controls */}
        {!recording && !audioBlob && uploading !== "uploading" && (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={startRecording}>
            <Mic className="w-3.5 h-3.5" />
            {existingUrl ? "Re-record" : "Record Pronunciation"}
          </Button>
        )}
        {recording && (
          <Button type="button" variant="destructive" size="sm" className="gap-1.5 animate-pulse" onClick={stopRecording}>
            <Square className="w-3.5 h-3.5" />
            Stop Recording
          </Button>
        )}

        {/* Uploading indicator */}
        {uploading === "uploading" && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
          </span>
        )}

        {/* Preview + discard after upload done */}
        {audioBlob && uploading === "done" && (
          <>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handlePreviewPlay}>
              <Play className="w-3.5 h-3.5" />
              {playing ? "Stop" : "Preview"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleDiscard}>
              <Trash2 className="w-3.5 h-3.5" /> Discard
            </Button>
            <audio ref={audioRef} src={previewUrl} className="hidden" />
          </>
        )}

        {/* Existing audio indicator */}
        {existingUrl && !audioBlob && !recording && uploading !== "uploading" && (
          <>
            <span className="flex items-center gap-1 text-xs text-accent">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pronunciation saved
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete audio
            </Button>
          </>
        )}
      </div>

      {recording && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Recording in progress…
        </p>
      )}
    </div>
  );
}