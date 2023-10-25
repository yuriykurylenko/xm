import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const domainsDir = path.join(process.cwd(), "domains");

const getActionsFromDir = (dir: string, domainPath: string[] = []): any => {
  let actions = {};

  // Read all files and directories in the current directory
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const currentPath = path.join(dir, item);

    // Check if item is a directory
    if (fs.statSync(currentPath).isDirectory()) {
      // If it's a 'domains' directory, don't add it to the domain path
      const newDomainPath =
        item !== "domains" ? [...domainPath, item] : domainPath;
      actions = {
        ...actions,
        ...getActionsFromDir(currentPath, newDomainPath),
      };
    } else if (item === "actions.yml") {
      const fileContents = fs.readFileSync(currentPath, "utf8");
      const actionData = yaml.load(fileContents);

      for (const actionName in actionData as any) {
        const fullActionName = [...domainPath, actionName].join(".");
        // @ts-ignore
        actions[fullActionName] = actionData[actionName];
      }
    }
  });

  return actions;
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const actions = getActionsFromDir(domainsDir);
    res.status(200).json(actions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch actions" });
  }
};
