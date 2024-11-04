// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import path from "path";

type Data = {
  uploadUrl: string;
};

const bucketName = process.env.BUCKET_NAME || "";
const storage = new Storage({
  keyFilename: path.resolve(process.cwd(), "serviceAcc.json"),
});

async function updateCors() {
  await storage.bucket(bucketName).setCorsConfiguration([
    {
      method: ["PUT"],
      origin: ["*"],
      responseHeader: ["content-type"],
    },
  ]);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // await updateCors();

  const { filename } = req.body;
  const filepath = `demo/${filename}`;

  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  const [url] = await storage
    .bucket(bucketName)
    .file(filepath)
    .getSignedUrl(options);

  res.status(200).json({ uploadUrl: url });
}
