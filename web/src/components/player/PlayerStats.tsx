import { cn } from "@/lib/utils";
import { PlayerStatsType } from "@/types/live";
import { useTranslation } from "react-i18next";

type PlayerStatsProps = {
  stats: PlayerStatsType;
  minimal: boolean;
};

export function PlayerStats({ stats, minimal }: PlayerStatsProps) {
  const { t } = useTranslation(["components/player"]);
  const fullStatsContent = (
    <>
      <p>
        <span className="text-white/70">{t("stats.streamType.title")}</span>{" "}
        <span className="text-white">{stats.streamType}</span>
      </p>
      <p>
        <span className="text-white/70">{t("stats.bandwidth.title")}</span>{" "}
        <span className="text-white">{stats.bandwidth.toFixed(2)} kBps</span>
      </p>
      {stats.latency != undefined && (
        <p>
          <span className="text-white/70">{t("stats.latency.title")}</span>{" "}
          <span
            className={`text-white ${stats.latency > 2 ? "text-danger" : ""}`}
          >
            {t("stats.latency.value", { seconds: stats.latency.toFixed(2) })}
          </span>
        </p>
      )}
      <p>
        <span className="text-white/70">{t("stats.totalFrames")}</span>{" "}
        <span className="text-white">{stats.totalFrames}</span>
      </p>
      {stats.droppedFrames != undefined && (
        <p>
          <span className="text-white/70">
            {t("stats.droppedFrames.title")}
          </span>{" "}
          <span className="text-white">{stats.droppedFrames}</span>
        </p>
      )}
      {stats.decodedFrames != undefined && (
        <p>
          <span className="text-white/70">{t("stats.decodedFrames")}</span>{" "}
          <span className="text-white">{stats.decodedFrames}</span>
        </p>
      )}
      {stats.droppedFrameRate != undefined && (
        <p>
          <span className="text-white/70">{t("stats.droppedFrameRate")}</span>{" "}
          <span className="text-white">
            {stats.droppedFrameRate.toFixed(2)}%
          </span>
        </p>
      )}
    </>
  );

  const minimalStatsContent = (
    <div className="flex flex-row flex-wrap items-center justify-center gap-x-[1.5cqw] gap-y-[0.3cqw]">
      <div className="flex flex-col items-center justify-start">
        <span className="text-white/70">{t("stats.streamType.short")}</span>
        <span className="text-white">{stats.streamType}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-white/70">{t("stats.bandwidth.short")}</span>{" "}
        <span className="text-white">{stats.bandwidth.toFixed(2)} kBps</span>
      </div>
      {stats.latency != undefined && (
        <div className="hidden flex-col items-center md:flex">
          <span className="text-white/70">
            {t("stats.latency.short.title")}
          </span>
          <span
            className={`text-white ${stats.latency >= 2 ? "text-danger" : ""}`}
          >
            {t("stats.latency.short.value", {
              seconds: stats.latency.toFixed(2),
            })}
          </span>
        </div>
      )}
      {stats.droppedFrames != undefined && (
        <div className="flex flex-col items-center justify-end">
          <span className="text-white/70">
            {t("stats.droppedFrames.short.title")}
          </span>
          <span className="text-white">
            {t("stats.droppedFrames.short.value", {
              droppedFrames: stats.droppedFrames,
            })}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={cn(
          minimal
            ? "absolute bottom-0 left-0 w-full overflow-hidden rounded-b-lg p-[0.5cqw] text-[clamp(7px,2.5cqw,12px)]"
            : "absolute bottom-2 right-2 min-w-52 rounded-2xl p-4 text-[9px] md:text-xs",
          "z-50 flex flex-col gap-0.5 bg-black/70 duration-300 animate-in fade-in",
        )}
      >
        {minimal ? minimalStatsContent : fullStatsContent}
      </div>
    </>
  );
}
