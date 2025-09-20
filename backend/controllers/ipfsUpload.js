import { create } from 'ipfs-http-client';

const client = create({ url: 'http://127.0.0.1:5001' });

export const uploadToIPFS = async (fileBuffer, fileName = "file") => {
  try {
    // Step 1: Add file to IPFS
    const { cid } = await client.add(fileBuffer);

    // Step 2: Remove old file if exists
    try {
      await client.files.rm(`/uploads/${fileName}`, { recursive: true });
    } catch (err) {
      if (!err.message.includes("does not exist")) {
        console.error("Error while removing old file:", err.message);
      }
    }

    // Step 3: Copy to MFS
    await client.files.cp(`/ipfs/${cid.toString()}`, `/uploads/${fileName}`);

    console.log("✅ Uploaded to IPFS:", cid.toString());
    return cid.toString();
  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error);
    throw error;
  }
};
