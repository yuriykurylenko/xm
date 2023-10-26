import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const domainsDir = path.join(process.cwd(), "domains");

const getConfigFromDir = (dir: string, domainPath: string[] = []): any => {
  let config = {};

  // Read all files and directories in the current directory
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const currentPath = path.join(dir, item);

    // Check if item is a directory
    if (fs.statSync(currentPath).isDirectory()) {
      // If it's a 'domains' directory, don't add it to the domain path
      const newDomainPath =
        item !== "domains" ? [...domainPath, item] : domainPath;

      const dirConfig = getConfigFromDir(currentPath, newDomainPath);

      config = {
        // @ts-ignore
        actions: { ...config.actions, ...dirConfig.actions },
        // @ts-ignore
        events: { ...config.events, ...dirConfig.events },
      };
    } else if (["actions.yml", "events.yml"].includes(item)) {
      const fileContents = fs.readFileSync(currentPath, "utf8");
      const actionEventData = yaml.load(fileContents);

      for (const actionEventName in actionEventData as any) {
        const fullActionName = [...domainPath, actionEventName].join(".");
        // @ts-ignore
        config[item.split(".")[0]][fullActionName] =
          actionEventData[actionEventName];
      }
    }
  });

  return config;
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const config = getConfigFromDir(domainsDir);
    res.status(200).json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch actions" });
  }
};
