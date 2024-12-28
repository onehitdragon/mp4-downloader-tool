import fs from "fs";
import { fetchMixedFile, createTxt, ffmpegCommand1, ffmpegCommand2, createTsLines } from "./commands";

const data = [
    "https://vip.opstream11.com/20220313/1827_c4fe319a",
    "https://vip.opstream11.com/20220313/1830_c0036844",
    "https://vip.opstream11.com/20220313/1828_ae407b7d",
    "https://vip.opstream11.com/20220313/1829_5d22114c",
    "https://vip.opstream11.com/20220313/1832_ad51a0da",
    "https://vip.opstream11.com/20220313/1833_3fd2c0b8",
    "https://vip.opstream11.com/20220313/1834_43b88289",
    "https://vip.opstream11.com/20220313/1835_35c6852f",
    "https://vip.opstream11.com/20220313/1836_a90d0168",
    "https://vip.opstream11.com/20220313/1837_413d48a5",
    "https://vip.opstream11.com/20220313/1838_084de119",
    "https://vip.opstream11.com/20220313/1839_934769c6",
    "https://vip.opstream11.com/20220313/1840_1470d40a",
    "https://vip.opstream11.com/20220313/1841_011a7995",
    "https://vip.opstream11.com/20220313/1842_332b44cb",
    "https://vip.opstream11.com/20220313/1843_a312dd82",
    "https://vip.opstream11.com/20220313/1844_51d5a33d",
    "https://vip.opstream11.com/20220313/1845_12075285",
    "https://vip.opstream11.com/20220313/1846_2e29c638",
    "https://vip.opstream11.com/20220313/1847_881599bd",
    "https://vip.opstream11.com/20220313/1848_9ed2401f",
    "https://vip.opstream11.com/20220313/1849_2befa63a",
    "https://vip.opstream11.com/20220313/1850_eeef583c",
    "https://vip.opstream11.com/20220313/1851_aa04944d",
    "https://vip.opstream11.com/20220313/1852_2db662b3"
]

async function download(base: string, outPath: string){
    const tail = "/3000k/hls";
    const baseUrl = base + tail;

    const mixedPath = "./temp/mixed.m3u8";
    await fetchMixedFile(baseUrl + "/mixed.m3u8", mixedPath);

    const tsLines = await createTsLines(mixedPath);

    const txtPath = "./temp/list.txt";
    await createTxt(tsLines, txtPath);

    for(let i = 0; i < tsLines.length; i++){
        const tsLine = tsLines[i];
        const tsUrl = baseUrl + "/" + tsLine;
        const res = await fetch(tsUrl);
        const buffer = await res.arrayBuffer();
        const view = new DataView(buffer);
        fs.writeFileSync("./temp/ts/" + tsLine, view);
        process.stdout.write(`\rDownloading: ${i}/${tsLines.length}`);
    }
    process.stdout.write("\n");

    await ffmpegCommand1("./temp/list.txt", "./temp/all.ts");
    await ffmpegCommand2("./temp/all.ts", outPath);

    // clear
    fs.unlinkSync(mixedPath);
    fs.unlinkSync(txtPath);
    for(const tsLine of tsLines){
        fs.unlinkSync("./temp/ts/" + tsLine);
    }
    fs.unlinkSync("./temp/all.ts");
}

async function Main(){
    for(let i = 0; i < data.length; i++){
        console.log(data[i]);
        await download(data[i], `./output/toradora/tap${i + 1}.mp4`);
    }
}

Main();

