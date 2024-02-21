import PerformanceTest from "@/components/PerformanceTest";
import Image from "next/image";
import { FaApple } from "react-icons/fa";
import CloudCross from "../public/icons/cloud-cross-500.svg";
import FastIcon from "../public/icons/fast-500.svg";
import SimpleIcon from "../public/icons/simple-500.svg";

export default function Home() {
  return (
    <main className="relative flex items-center flex-col py-12 px-[8vw] gap-24 bg-transparent w-full">
      <section className="w-full flex flex-col md:flex-row gap-8 text-left justify-start mt-4">
        <div className="flex flex-col max-w-full sm:w-[50%] gap-20 h-full justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="white whitespace-pre-wrap text-3xl leading-[3rem] md:text-5xl md:leading-[4rem] font-bold text-left">
              Upload <span className="text-primary whitespace-nowrap rounded-md">400Mb videos</span> right in Github
            </h1>

            <p className="text-xl">Say 👋 Goodbye to the 100Mb limit.</p>
          </div>
          <button className="btn btn-primary max-w-60 text-white flex items-center">
            <span>Download For Mac</span>
            <FaApple size={20} className="mb-[2px]" />
          </button>
        </div>
        <div className="rounded-md overflow-hidden border-2 border-slate-800 h-fit w-fit mt-8">
          <iframe
            className="sm:hidden"
            style={{
              minWidth: "100%",
            }}
            width="280"
            height="160"
            src="https://www.youtube.com/embed/4KYvhKuFaHM?si=qw0XaAx_3IDi2StJ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <iframe
            className="hidden sm:block"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/4KYvhKuFaHM?si=qw0XaAx_3IDi2StJ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="flex flex-col w-full h-[400px]">
        <div className="flex flex-col items-center sm:flex-row gap-3 justify-center">
          <div className="card w-80 h-full bg-base-100 shadow-xl">
            <figure>
              <Image className="max-h-[200px]" objectFit="fill" src={FastIcon} alt="Fast" />
            </figure>
            <div className="card-body !pt-0">
              <h2 className="card-title">Fast</h2>
              <p>Compress 200MB videos in 10 seconds. Faster uploading with smaller files!</p>
            </div>
          </div>
          <div className="card w-80 h-full bg-base-100 shadow-xl">
            <figure>
              <Image className="max-h-[200px]" objectFit="fill" src={SimpleIcon} alt="Fast" />
            </figure>
            <div className="card-body !pt-0">
              <h2 className="card-title">Simple</h2>
              <p>Upload like your normally do. No extra steps required.</p>
            </div>
          </div>
          <div className="card w-80 h-full bg-base-100 shadow-xl">
            <figure>
              <Image className="max-h-[200px]" objectFit="fill" src={CloudCross} alt="Fast" />
            </figure>
            <div className="card-body !pt-0">
              <h2 className="card-title">Secure</h2>
              <p>Videos never leaves your computer while compressing.</p>
              <p>Protect your company files from untrusted online services.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <h2 className="font-bold text-4xl">Comparisons</h2>
        <section className="flex gap-1 flex-col py-8">
          <h3 className="text-2xl">FFMPEG Wasm</h3>
          <p className="text-lg bg-primary-content p-4 rounded-md text-black w-fit">
            An excellent use of web assembly. Unfortunately it is not as fast as the native version.
          </p>
          <div className="bg-gray border-2 border-gray-700 p-2 rounded-md bg-gray-50">
            <p>Native</p> 200MB in 10 seconds
            <p>WASM</p> 10MB in 10 seconds
          </div>

          <PerformanceTest />
        </section>
      </section>
    </main>
  );
}
