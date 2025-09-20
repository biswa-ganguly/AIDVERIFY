import Tesseract from "tesseract.js";
import sharp from "sharp";
import wordsToNumbers from "words-to-numbers";
import { uploadToIPFS } from "./ipfsUpload.js";

export const processOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.log(`🔍 Preprocessing + OCR for: ${req.file.originalname}`);

    // --- Preprocess with sharp directly on buffer ---
    const preprocessedBuffer = await sharp(req.file.buffer)
      .grayscale()
      .normalize()
      .resize({ width: 1200 })
      .toBuffer();

    // --- Run OCR on buffer ---
    const {
      data: { text },
    } = await Tesseract.recognize(preprocessedBuffer, "eng+hin", {
      tessedit_char_whitelist:
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹रRsINR:./- ",
    });

    // --- Normalize text ---
    let cleanText = text.replace(/\s+/g, " ").trim();
    console.log("📝 OCR Output:", cleanText);

    // --- Fix digits before month names ---
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    cleanText = cleanText.replace(
      new RegExp(`\\d{1,2}(${months.join("|")})`, "gi"),
      (_, month) => month
    );

    let amount = null;
    let transactionId = null;
    let date = null;

    // --- Amount Extraction ---
    let amountMatch =
      cleanText.match(/[₹रR]\s?(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)/i) ||
      cleanText.match(/\bRs\.?\s?(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)/i) ||
      cleanText.match(/\bINR\s?(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)/i) ||
      cleanText.match(/Amount[: ]?(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)/i);

    if (!amountMatch) {
      amountMatch = cleanText.match(/(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)\s+Only/i);
    }

    if (!amountMatch) {
      const wordMatch = cleanText.match(/Rupees\s+([A-Za-z\s]+)\s+Only/i);
      if (wordMatch) {
        try {
          const num = wordsToNumbers(wordMatch[1], { fuzzy: true });
          if (num && typeof num === "number") {
            amount = "₹" + num;
          }
        } catch (err) {
          console.warn("⚠️ wordsToNumbers failed:", err.message);
        }
      }
    }

    if (!amount && amountMatch) {
      amount = "₹" + amountMatch[1].replace(/,/g, "");
    }

    // --- Transaction ID Extraction ---
    const txnKeywords = ["UPI Ref. No:", "Ref:", "Reference:", "Txn ID:", "Transaction ID:"];
    for (const keyword of txnKeywords) {
      const idx = cleanText.indexOf(keyword);
      if (idx !== -1) {
        let substring = cleanText.substring(idx + keyword.length).trim();
        const parts = substring.split(" ");
        let trxIdParts = [];
        for (const part of parts) {
          if (months.some(month => part.includes(month))) break;
          const cleaned = part.replace(/[^0-9]/g, "");
          if (cleaned.length >= 3) trxIdParts.push(cleaned);
        }
        transactionId = trxIdParts.join("");
        break;
      }
    }

    // --- Date Extraction ---
    let match =
      cleanText.match(/\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4},?\s+\d{1,2}:\d{2}\s*[APMapm]{2}/) ||
      cleanText.match(/\d{1,2}[-\/][A-Za-z]{3,9}[-\/]\d{2,4},?\s+\d{1,2}:\d{2}\s*[APMapm]{2}/) ||
      cleanText.match(/\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}/) ||
      cleanText.match(/\d{1,2}[-\/][A-Za-z]{3,9}[-\/]\d{2,4}/);

    if (match) {
      date = match[0].trim();
    }

    // --- Receiver Name Extraction ---
    let receiverName = null;
    const toRegex = /\b[Tt][Oo]:?\b/;
    const match1 = cleanText.match(toRegex);
    if (match1) {
      const toIdx = match1.index + match1[0].length;
      let substring = cleanText.substring(toIdx).trim();
      const stopKeywords = ["From:", "UPI Ref. No:", "Ref:", "Reference:", "Txn ID:", "Transaction ID:"];
      let stopIdx = substring.length;
      for (const key of stopKeywords) {
        const idx = substring.indexOf(key);
        if (idx !== -1 && idx < stopIdx) stopIdx = idx;
      }
      substring = substring.substring(0, stopIdx).trim();
      const parts = substring.split(" ");
      let nameParts = [];
      for (const part of parts) {
        if (/^\d+$/.test(part)) break;
        nameParts.push(part);
      }
      receiverName = nameParts.join(" ").trim();
    }

    const ipfsResult = await uploadToIPFS(req.file.buffer, req.file.originalname);

    // --- Response ---
    res.json({
      success: true,
      extractedText: cleanText,
      parsed: { amount, transactionId, date, receiverName },
      ipfsHash: ipfsResult,  // return CID from IPFS
      ipfsUrl: `https://ipfs.io/ipfs/${ipfsResult}`
    });
  } catch (error) {
    console.error("❌ OCR Error:", error);
    res.status(500).json({ success: false, error: "OCR failed" });
  }
};
