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
 */
export default function PronunciationRecorder({ existingUrl, onRecorded, onDelete }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(null); // null | 'uploading' | 'done' | 'error'
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setPreviewUrl(url);
      stream.getTracks().forEach(t => t.stop());
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

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploading("uploading");
    const file = new File([audioBlob], "pronunciation.webm", { type: "audio/webm" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading("done");
    onRecorded({ url: file_url, oldUrl: existingUrl });
    setAudioBlob(null);
    setPreviewUrl(null);
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    setPreviewUrl(null);
    setUploading(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Recording controls */}
        {!recording && !audioBlob && (
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

        {/* Preview + upload controls */}
        {audioBlob && !recording && (
          <>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handlePreviewPlay}>
              <Play className="w-3.5 h-3.5" />
              {playing ? "Stop" : "Preview"}
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={handleUpload}
              disabled={uploading === "uploading"}
            >
              {uploading === "uploading" ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
              ) : uploading === "done" ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
              ) : (
                "Save Recording"
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleDiscard}>
              <Trash2 className="w-3.5 h-3.5" /> Discard
            </Button>
            <audio ref={audioRef} src={previewUrl} className="hidden" />
          </>
        )}

        {/* Existing audio indicator */}
        {existingUrl && !audioBlob && !recording && (
          <span className="flex items-center gap-1 text-xs text-accent">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pronunciation saved
          </span>
        )}
        {existingUrl && !audioBlob && !recording && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete audio
          </Button>
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