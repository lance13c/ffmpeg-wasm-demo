"use client";

import LabelValue from "@/components/LabelValue";
import { initFFmpeg } from "@/components/utils/ffmpeg.util";
import { median } from "@/components/utils/math";
import { type FFmpeg } from "@ffmpeg/ffmpeg";
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
  const ffmpegRef = useRef<InstanceType<typeof FFmpeg> | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const outputVideoUrl = useSignal<File | null>(null);
  const isLoading = useSignal<boolean>(false);
  const videoSrc = useSignal<string | null>(null);
  // 0 - 100 as a percentage
  const currentProgress = useSignal<number | null>(0);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [fpsLogs, setFpsLogs] = useState<number[]>([]);
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
    setLogs((prev) => [...prev, log]);

    setTimeout(() => {
      if (logsRef.current) {
        logsRef.current.scrollBy({
          top: logsRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  const handleInputFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tempFile = e.target?.files?.item(0);
    if (!tempFile) {
      appendLog({ type: "error", message: "No file selected" });
      return;
    }
    setInputFile(tempFile);
  };

  const load = async () => {
    if (ffmpegRef.current) {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      try {
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on("log", (log) => {
          appendLog(log);
          console.log(log);
        });
        ffmpeg.on("progress", ({ progress }) => {
          currentProgress.value = Math.floor(progress * 100);
        });

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        isLoading.value = false;
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Init FFmpeg
  useEffect(() => {
    // Init only if ffmpegRef = null and not already running
    if (!ffmpegRef.current && !isRunning) {
      initFFmpeg().then((ffmpeg) => {
        if (!ffmpeg) {
          appendLog({
            type: "error",
            message: "Error loading FFmpeg",
          });

          return;
        }
        if (ffmpegRef.current) {
          ffmpegRef.current.terminate();
        }

        ffmpegRef.current = ffmpeg;
        load();
      });
    }
  }, [isRunning]);

  const stopExecution = () => {
    if (ffmpegRef.current) {
      try {
        ffmpegRef.current.terminate();
        ffmpegRef.current = null;
        setIsRunning(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const transcode = async () => {
    if (!inputFile) {
      appendLog({ type: "error", message: "No file selected" });
      return;
    }
    if (!ffmpegRef.current) {
      appendLog({ type: "error", message: "FFmpeg not loaded" });
      return;
    }

    // Reset Logs
    setLogs([]);
    setIsRunning(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(inputFileName, new Uint8Array(await inputFile.arrayBuffer()));

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 w-full">
      <div className="flex flex-col gap-6">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex flex-col gap-4">
            <LabelValue label="Selected Video" value={inputFile?.name || "No file selected"} />
          </div>
          <div className="flex flex-col gap-3 pt-4 w-full">
            <div className="flex flex-col gap-1">
              <p className="font-normal text-xs text-gray-700">Step One</p>
              {!inputFile ? (
                <label className={`btn-outline btn flex justify-center items-center cursor-pointer font-medium`}>
                  <input onChange={handleInputFileChange} type="file" className="hidden" title="Select Video" />
                  Upload Video
                </label>
              ) : (
                <button
                  className="btn-outline btn flex justify-center items-center cursor-pointer font-medium"
                  onClick={() => setInputFile(null)}
                >
                  Clear Video
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-normal text-xs text-gray-700">Step Two</p>
              {!isRunning ? (
                <button
                  disabled={!inputFile}
                  className={`btn ${
                    !inputFile ? "btn-disabled" : "btn-primary"
                  } px-4 py-2" text-white font-bold rounded-lg transition-colors duration-200`}
                  onClick={transcode}
                >
                  Compress Video
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200"
                  onClick={stopExecution}
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden w-full col-start-1 md:col-start-2 md:col-span-2">
        <div className="w-full">
          <div className="flex gap-8 pb-4 flex-wrap">
            <LabelValue label="Median frames per second" value={`${medianFPS} fps`} />
            <LabelValue label="Progress" value={`${currentProgress}%`} />
          </div>
          <div
            ref={logsRef}
            className="relative max-h-[400px] min-h-64 w-full h-full overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2"
          >
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="select-none text-gray-500 bg-gray-50">{index + 1}.</span>
                <p className={`flex-1 ${log.type === "error" ? "text-red-500" : "text-gray-800"}`}>{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTest;
