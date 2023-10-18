import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { domainPath },
  } = req;

  const filePath = path.join(
    process.cwd(),
    "domains",
    domainPath as string,
    "actions.yml"
  );
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, "utf8");
    res.status(200).send(fileContents);
  } else {
    res.status(404).send("File not found");
  }
};
