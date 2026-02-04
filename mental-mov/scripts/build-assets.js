const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const TRANSCRIBED_TEXT_PATH =
  process.env.TRANSCRIBED_TEXT_PATH ??
  "../voice-diary/kurama/voice-diary/2025-03/2025-03-19-03-f-最近の心境の変化-お母さん編1.txt";
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("環境変数 GOOGLE_API_KEY (もしくは GEMINI_API_KEY) を設定してください。");
}

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? "gemini-1.5-pro";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "imagen-3.1-generate-002";
const IMAGE_SIZE = process.env.GEMINI_IMAGE_SIZE ?? "1024x1024";
const CALL_INTERVAL_MS = Number(process.env.GEMINI_CALL_INTERVAL_MS ?? 2000);
const MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES ?? 4);
const DEFAULT_RETRY_DELAY_MS = Number(process.env.GEMINI_RETRY_DELAY_MS ?? 60000);

const args = process.argv.slice(2);
let sceneLimit;
for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token === "--test-first-scene") {
        sceneLimit = 1;
        continue;
    }
    if (token.startsWith("--max-scenes=")) {
        sceneLimit = Number(token.split("=")[1]);
        continue;
    }
    if (token === "--max-scenes" && args[i + 1]) {
        sceneLimit = Number(args[i + 1]);
        i++;
        continue;
    }
}
if (sceneLimit != null && (!Number.isFinite(sceneLimit) || sceneLimit <= 0)) {
    throw new Error("--max-scenes には 1 以上の数値を指定してください。");
}

let lastCallTimestamp = 0;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const throttle = async () => {
    if (!CALL_INTERVAL_MS) {
        return;
    }
    const elapsed = Date.now() - lastCallTimestamp;
    if (elapsed < CALL_INTERVAL_MS) {
        await wait(CALL_INTERVAL_MS - elapsed);
    }
    lastCallTimestamp = Date.now();
};

const parseRetryDelay = (error) => {
    if (!error?.errorDetails) {
        return null;
    }
    for (const detail of error.errorDetails) {
        if (detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo" && detail.retryDelay) {
            const match = /(?:(\d+)s)?(?:(\d+)ns)?/.exec(detail.retryDelay);
            if (match && (match[1] || match[2])) {
                const seconds = Number(match[1] ?? 0);
                const nanos = Number(match[2] ?? 0);
                return seconds * 1000 + Math.round(nanos / 1e6);
            }
        }
    }
    return null;
};

const callWithRetry = async (fn, description) => {
    let attempt = 0;
    while (true) {
        try {
            await throttle();
            return await fn();
        } catch (error) {
            const shouldRetry = error?.status === 429 || error?.status === 503;
            if (!shouldRetry || attempt >= MAX_RETRIES) {
                throw error;
            }
            const delay = parseRetryDelay(error) ?? DEFAULT_RETRY_DELAY_MS;
            attempt++;
            const seconds = Math.round(delay / 1000);
            console.warn(
                `[${description}] API 制限 (attempt ${attempt}/${MAX_RETRIES})。${seconds} 秒待って再試行します。`,
            );
            await wait(delay);
        }
    }
};

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const extractInlineImage = (result) => {
    const candidates = result.response?.candidates ?? [];
    for (const candidate of candidates) {
        const parts = candidate.content?.parts ?? [];
        for (const part of parts) {
            const inlineData = part.inlineData?.data;
            if (inlineData) {
                return inlineData;
            }
        }
    }
    return null;
};

async function main() {
    if (sceneLimit === 1) {
        console.log("テストモード: 最初の 1 シーンのみ生成します。");
    } else if (sceneLimit > 0) {
        console.log(`テストモード: 最初の ${sceneLimit} シーンのみ生成します。`);
    }

    console.log("1. 文字起こし済みテキストを読み込み中...");
    const transcriptionText = (await fs.readFile(TRANSCRIBED_TEXT_PATH, "utf8")).trim();
    if (!transcriptionText) {
        throw new Error(`文字起こしファイル ${TRANSCRIBED_TEXT_PATH} が空です。`);
    }

    console.log("2. 文脈から設計図を生成中...");
    const structureModel = genAI.getGenerativeModel({ model: TEXT_MODEL });
    const structureResponse = await callWithRetry(
        () =>
            structureModel.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `以下の日本語テキストを解析し、20秒ごとのシーンに分割したJSONを出力してください。各シーンには「start」「end」「text」「imagePrompt」を含め、imagePromptは自然な英語で詳細に描写してください。\nテキスト: ${transcriptionText}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.4,
                    responseMimeType: "application/json",
                },
            }),
        "テキスト解析",
    );

    const content = structureResponse.response.text();
    if (!content) {
        throw new Error("Geminiからの応答が空です");
    }

    let metadata = JSON.parse(content);
    let scenes = Array.isArray(metadata?.scenes)
        ? metadata.scenes
        : Array.isArray(metadata)
          ? metadata
          : [];
    if (!Array.isArray(scenes)) {
        scenes = [];
    }

    if (sceneLimit) {
        scenes = scenes.slice(0, sceneLimit);
        if (Array.isArray(metadata?.scenes)) {
            metadata = { ...metadata, scenes };
        } else if (Array.isArray(metadata)) {
            metadata = scenes;
        }
    }

    await fs.outputJson(path.join(__dirname, "../src/data/metadata.json"), metadata, { spaces: 2 });

    console.log("3. 画像を生成中...");
    if (!Array.isArray(scenes)) {
        throw new Error("metadata.json の形式が想定と異なります。");
    }

    const imageModel = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        if (!scene?.imagePrompt) {
            console.warn(`シーン ${i} に imagePrompt が無いためスキップします。`);
            continue;
        }

        const basePrompt = scene.imagePrompt.trim();
        const sizeHint = IMAGE_SIZE ? ` (Desired resolution: ${IMAGE_SIZE})` : "";
        const imageResult = await callWithRetry(
            () =>
                imageModel.generateContent({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: `${basePrompt}${sizeHint}` }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        responseMimeType: "image/png",
                    },
                }),
            `画像生成 scene_${i}`,
        );
        const imageBytes = extractInlineImage(imageResult);

        if (!imageBytes) {
            console.warn(`シーン ${i} の画像生成に失敗しました。`);
            continue;
        }

        const buffer = Buffer.from(imageBytes, "base64");
        const binary = Uint8Array.from(buffer);
        const imagePath = path.join(__dirname, `../public/gen_images/scene_${i}.png`);
        await fs.ensureDir(path.dirname(imagePath));
        await fs.writeFile(imagePath, binary);
        console.log(`シーン ${i} の画像を保存しました: ${scene.text?.substring(0, 10) ?? ""}...`);
    }

    console.log("すべての素材準備が完了しました！");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
