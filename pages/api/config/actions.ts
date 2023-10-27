import { NextApiRequest, NextApiResponse } from "next";
import config from "@/app/utils/config";

export default (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch actions" });
  }
};
