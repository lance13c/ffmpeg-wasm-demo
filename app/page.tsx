import PerformanceTest from "@/components/PerformanceTest";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center flex-col p-12 ">
      <div className="max-w-5xl w-full flex flex-wrap gap-2 justify-center items-center">
        <p className="left-0 w-full flex flex-wrap justify-start whitespace-pre-wrap top-0 border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit static rounded-xl border lg:bg-gray-200 p-4 lg:dark:bg-zinc-800/30">
          <a className="link pr-1.5 link-primary" href="https://ffmpegwasm.netlify.app/">
            FFMPEG Wasm
          </a>
          <span>Performance Test</span>
        </p>

        <PerformanceTest />
      </div>
    </main>
  );
}
