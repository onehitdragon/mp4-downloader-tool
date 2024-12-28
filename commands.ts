import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import readline from "readline";

async function fetchMixedFile(mixedUrl: string, mixedPath: string){
    const res = await fetch(mixedUrl);
    const buffer = await res.arrayBuffer();
    const view = new DataView(buffer);
    fs.writeFileSync(mixedPath, view);
}

function createTsLines(mixedPath: string){
    const pro = new Promise<string[]>((resolve, reject) => {
        const tsLines: string[] = [];

        const mixedStream = fs.createReadStream(mixedPath);
        const rl = readline.createInterface(mixedStream);
        rl.on("line", (s) => {
            if(!s.includes(".ts")) return;
            tsLines.push(s);
        });
        rl.on("close", () => {
            resolve(tsLines);
        });
    });

    return pro;
}

function createTxt(tsLines: string[], outPath: string){
    const pro = new Promise<void>((resolve, reject) => {
        const listStream = fs.createWriteStream(outPath);
        for(const tsLine of tsLines){
            listStream.write(`file './ts/${tsLine}'\r\n`);
        }
        listStream.close();
        listStream.on("finish", () => {
            resolve();
        });
    });

    return pro;
}

function ffmpegCommand1(txtPath: string, outPath: string){
    const pro = new Promise<void>((resolve, reject) => {
        ffmpeg()
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .input(txtPath)
        .inputOptions(
            "-f", "concat",
            "-safe", "0"
        )
        .output(outPath)
        .outputOptions(
            "-c", "copy"
        )
        .on("error", (err) => {{
            reject(err);
        }})
        .on("end", () => {
            resolve();
        })
        .run();
    });

    return pro;
}

function ffmpegCommand2(inputPath: string, outPath: string){
    const pro = new Promise<void>((resolve, reject) => {
        ffmpeg()
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .input(inputPath)
        .output(outPath)
        .outputOptions(
            "-c", "copy"
        )
        .on("error", (err) => {{
            reject(err);
        }})
        .on("end", () => {
            resolve();
        })
        .run();
    });

    return pro;
}

export { createTsLines, fetchMixedFile, createTxt, ffmpegCommand1, ffmpegCommand2 }