import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { create } = await import(
        `@/integrations/stripe/${req.query.object}`
      );

      const object = await create(req.body);
      res.status(200).send(object);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;
