const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class Transcoder {
  constructor() {
    if (process.env.FFMPEG_PATH) {
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    }
    if (process.env.FFPROBE_PATH) {
      ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
    }

    this.qualities = {
      '1080p': { width: 1920, height: 1080, bitrate: '5000k', audioBitrate: '192k' },
      '720p': { width: 1280, height: 720, bitrate: '3000k', audioBitrate: '128k' },
      '480p': { width: 854, height: 480, bitrate: '1500k', audioBitrate: '128k' },
      '360p': { width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' }
    };
  }

  async getVideoMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          logger.error('FFprobe error:', err);
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          resolve({
            duration: metadata.format.duration,
            codec: videoStream?.codec_name,
            width: videoStream?.width,
            height: videoStream?.height,
            fps: eval(videoStream?.r_frame_rate),
            aspectRatio: videoStream?.display_aspect_ratio,
            size: metadata.format.size
          });
        }
      });
    });
  }

  async generateThumbnail(inputPath, outputPath, timestamp = '00:00:05') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1280x720'
        })
        .on('end', () => {
          logger.info('Thumbnail generated successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Thumbnail generation error:', err);
          reject(err);
        });
    });
  }

  async transcodeToHLS(inputPath, outputDir, qualities = ['1080p', '720p', '480p', '360p'], onProgress) {
    const results = [];
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Generate master playlist
    const masterPlaylist = path.join(outputDir, 'master.m3u8');
    let masterContent = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    // Transcode each quality
    for (const quality of qualities) {
      if (!this.qualities[quality]) continue;

      const qualityDir = path.join(outputDir, quality);
      await fs.mkdir(qualityDir, { recursive: true });

      const playlistPath = path.join(qualityDir, 'playlist.m3u8');
      const config = this.qualities[quality];

      await this.transcodeQuality(inputPath, qualityDir, config, onProgress);

      // Add to master playlist
      const bandwidth = parseInt(config.bitrate) * 1000;
      masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${config.width}x${config.height}\n`;
      masterContent += `${quality}/playlist.m3u8\n\n`;

      results.push({
        resolution: quality,
        bitrate: config.bitrate,
        path: playlistPath,
        size: (await fs.stat(qualityDir)).size
      });
    }

    // Write master playlist
    await fs.writeFile(masterPlaylist, masterContent);
    logger.info('Master playlist created:', masterPlaylist);

    return {
      masterPlaylist,
      qualities: results
    };
  }

  async transcodeQuality(inputPath, outputDir, config, onProgress) {
    return new Promise((resolve, reject) => {
      const outputPattern = path.join(outputDir, 'segment_%03d.ts');
      const playlistPath = path.join(outputDir, 'playlist.m3u8');

      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          `-b:v ${config.bitrate}`,
          `-b:a ${config.audioBitrate}`,
          '-preset fast',
          '-g 48',
          '-sc_threshold 0',
          '-f hls',
          '-hls_time 10',
          '-hls_list_size 0',
          `-hls_segment_filename ${outputPattern}`,
          `-vf scale=${config.width}:${config.height}`
        ])
        .output(playlistPath)
        .on('start', (cmd) => {
          logger.info('FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (onProgress) {
            onProgress({
              percent: progress.percent,
              currentFps: progress.currentFps,
              targetSize: progress.targetSize,
              timemark: progress.timemark
            });
          }
        })
        .on('end', () => {
          logger.info(`Transcoding completed for ${config.width}x${config.height}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Transcoding error:', err);
          reject(err);
        })
        .run();
    });
  }

  async cleanupFiles(directory) {
    try {
      await fs.rm(directory, { recursive: true, force: true });
      logger.info('Cleaned up directory:', directory);
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }
}

module.exports = new Transcoder();
