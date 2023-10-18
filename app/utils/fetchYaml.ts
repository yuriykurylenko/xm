import yaml from "js-yaml";

export const fetchYaml = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Could not fetch YAML from ${url}: ${res.statusText}`);
  }

  const text = await res.text();
  return yaml.load(text);
};
