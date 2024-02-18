"use client";

import { median } from "@/components/utils/math";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useSignal } from "@preact/signals-react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type LogEvent = {
  type: string;
  message: string;
};

const regexPatterns = {
  frame: /frame=\s*(\d+)/,
  fps: /fps=\s*([0-9.]+)/,
  q: /q=\s*([0-9.]+)/,
  size: /size=\s*([0-9]+kB)/,
  time: /time=([0-9:.]+)/,
  bitrate: /bitrate=\s*([0-9.]+kbits\/s)/,
  speed: /speed=\s*([0-9.]+x)/,
} as const;

const extractData = (message: string) => {
  // @ts-expect-error - temp disable
  const data: Record<keyof typeof regexPatterns, string | number> = {};
  // Iterate over each pattern, extract, and add to the data object
  for (const [key, pattern] of Object.entries(regexPatterns)) {
    const match = message.match(pattern);
    if (match) {
      data[key as keyof typeof regexPatterns] = match[1];
    }
  }

  return data;
};

const PerformanceTest = () => {
  const ffmpegRef = useRef(new FFmpeg());
  const inputFile = useSignal<File | null>(null);
  const outputVideoUrl = useSignal<File | null>(null);
  const isLoading = useSignal<boolean>(false);
  const videoSrc = useSignal<string | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [fpsLogs, setFpsLogs] = useState<number[]>([]);
  const currentProgress = useSignal<number | null>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const medianFPS = useMemo(() => median(fpsLogs), [fpsLogs]);
  console.log("Median", medianFPS);

  const appendLog = useCallback((log: LogEvent) => {
    const data = extractData(log.message);
    console.log(data);
    if (data?.fps) {
      console.log("fps", data.fps);
      setFpsLogs((prev) => [...prev, Number(data.fps)]);
    }

    if (logsRef.current) {
      const p = document.createElement("p");
      p.textContent = log.message;
      p.className = log.type === "error" ? "text-red-500" : "text-gray-900";
      logsRef.current.appendChild(p);
      logsRef.current.scrollBy({
        top: logsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleInputFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tempFile = e.target?.files?.item(0);
    if (!tempFile) {
      appendLog({ type: "error", message: "No file selected" });
      return;
    }
    inputFile.value = tempFile;
  };

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", (log) => {
      appendLog(log);
      console.log(log);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    isLoading.value = false;
  };

  useEffect(() => {
    load();
  }, []);

  const stopExecution = () => {
    ffmpegRef.current.terminate();
    setIsRunning(false);
  };

  const transcode = async () => {
    if (!inputFile.value) {
      appendLog({ type: "error", message: "No file selected" });
      return;
    }

    setIsRunning(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(inputFileName, new Uint8Array(await inputFile.value.arrayBuffer()));

    await ffmpeg.exec([
      "-i",
      inputFileName,
      "-vcodec",
      "libx264",
      "-crf",
      "28",
      "-preset",
      "ultrafast",
      outputFileName,
    ]);
    const data = await ffmpeg.readFile(outputFileName);

    // @ts-expect-error - temp disable
    if (!data?.buffer) {
      appendLog({ type: "error", message: "Error transcoding video" });
      return;
    }

    // @ts-expect-error - temp disable
    videoSrc.value = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4 col-span-1 text-gray-900">
        <div className="flex flex-col gap-4">
          <dl className="text-gray-900 flex gap-2">
            <dt className="text-gray-900">Select Video:</dt>
            <dd className="text-gray-900">{inputFile.value?.name}</dd>
          </dl>
          <label className="text-gray-900" title="Upload Video">
            <input
              onChange={handleInputFileChange}
              type="file"
              className="btn-primary text-gray-900"
              title="Select Video"
            />
          </label>
        </div>
        {!isRunning ? (
          <button className="btn-primary btn" onClick={transcode}>
            Compress Video
          </button>
        ) : (
          <button className="btn-secondary btn" onClick={stopExecution}>
            Stop
          </button>
        )}
      </div>
      <div className="col-span-1 p-4">
        <div className="w-full">
          <dl className="text-gray-900 flex gap-2">
            <dt>Median frames per second:</dt>
            <dd>{medianFPS}</dd>
          </dl>
          <div
            ref={logsRef}
            className="w-full min-h-32 max-h-[500px] h-full overflow-auto rounded-md bg-primary-content bg-border border border-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceTest;
