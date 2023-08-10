import { updateClientById } from "@/app/utils/api";
import { UUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).end("Method Not Allowed");
  }
  const clientId = req.query.client_id;

  try {
    const { data: client, error } = await updateClientById(clientId as UUID, {
      access_revoked_at: new Date(),
    });
    return error ? res.status(500).json(error) : res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
