import { useState } from "react";
import { Play } from "lucide-react";

interface MiniVideoPlayerProps {
  src: string;
  accent: string;
}

const MiniVideoPlayer = ({ src, accent }: MiniVideoPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group/vid"
      role="button"
      aria-label="Reproduzir video do produto"
      onClick={() => {
        const vid = document.getElementById("mini-vid-" + src.slice(-8)) as HTMLVideoElement;
        if (vid) { if (vid.paused) { vid.play(); setPlaying(true); } else { vid.pause(); setPlaying(false); } }
      }}>
      <video id={"mini-vid-" + src.slice(-8)} src={src} className="w-full h-full object-cover" muted playsInline loop
        onEnded={() => setPlaying(false)} />
      {!playing && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ background: `${accent}40`, border: `2px solid ${accent}80` }}>
            <Play size={18} className="text-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniVideoPlayer;
