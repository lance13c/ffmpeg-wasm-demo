export const initFFmpeg = async () => {
  let FFmpeg = null;
  try {
    if (!FFmpeg) {
      FFmpeg = (await import("@ffmpeg/ffmpeg")).FFmpeg;
    }

    return new FFmpeg();
  } catch (e) {
    console.error(e);
  }
};
