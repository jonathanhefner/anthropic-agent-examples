import type Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import { dirname, join } from "path";

type TextEditorToolInput =
  | ViewCommand
  | StrReplaceCommand
  | CreateCommand
  | InsertCommand;

interface Command {
  command: string;
  path: string;
}

interface ViewCommand extends Command {
  command: "view";
  view_range?: [number, number];
}

interface StrReplaceCommand extends Command {
  command: "str_replace";
  old_str: string;
  new_str: string;
}

interface CreateCommand extends Command {
  command: "create";
  file_text: string;
}

interface InsertCommand extends Command {
  command: "insert";
  insert_line: number;
  new_str: string;
}


export const definition: Anthropic.ToolTextEditor20250728 = {
  "type": "text_editor_20250728",
  "name": "str_replace_based_edit_tool",
};

const ROOT_DIR = "./tmp";

export async function execute(input: TextEditorToolInput): Promise<string> {
  const path = join(ROOT_DIR, input.path);

  switch (input.command) {
    case "view":
      if (await getPathType(path) === "directory") {
        return await viewDirectory(path);
      } else {
        return viewLines(await readFile(path), input.view_range);
      }

    case "str_replace":
      await editFile(path, (text) => replace(text, input.old_str, input.new_str));
      return "";

    case "create":
      await createFile(path, input.file_text);
      return "";

    case "insert":
      await editFile(path, (text) => insert(text, input.insert_line, input.new_str));
      return "";
  }

  input satisfies never; // exhaustiveness check
}

async function getPathType(path: string): Promise<"directory" | "file" | undefined> {
  try {
    return (await fs.stat(path)).isDirectory() ? "directory" : "file";
  } catch {
    return;
  }
}

async function readFile(path: string): Promise<string> {
  return await fs.readFile(path, { encoding: "utf-8" });
}

async function writeFile(path: string, text: string): Promise<void> {
  await fs.writeFile(path, text);
}

async function createFile(path: string, text: string): Promise<void> {
  switch (await getPathType(path)) {
    case "directory":
      throw new Error("Path points to an existing directory, not a file.");

    case "file":
      throw new Error("File already exists.");

    default:
      await fs.mkdir(dirname(path), { recursive: true });
      await writeFile(path, text);
      return;
  }
}

async function editFile(path: string, editor: (text: string) => string): Promise<void> {
  await writeFile(path, editor(await readFile(path)));
}

export async function viewDirectory(path: string): Promise<string> {
  return (await fs.readdir(path)).join("\n");
}

export function viewLines(text: string, range?: [number, number]): string {
  const lines = text.split("\n");
  const start = range ? range[0] : 1;
  const end = (range && range[1] >= 0) ? range[1] : lines.length;

  return lines.
    slice(start - 1, end).
    map((line, i) => `${start + i}: ${line}`).
    join("\n");
}

export function replace(text: string, oldStr: string, newStr: string): string {
  const surrounding = text.split(oldStr);

  if (surrounding.length < 2) {
    throw new Error("No match found for replacement.  Please check your text and try again.");
  }
  if (surrounding.length > 2) {
    throw new Error(`Found ${surrounding.length - 1} matches for replacement text.  Please provide more context to make a unique match.`);
  }

  return surrounding.join(newStr);
}

export function insert(text: string, newlinePosition: number, newStr: string): string {
  let charPosition = -1;
  for (let i = 0; i < newlinePosition; i += 1) {
    charPosition = text.indexOf("\n", charPosition + 1);
    if (charPosition < 0) throw new Error("Invalid line number.  Please check the file text and try again.")
  }
  charPosition += 1;

  return `${text.slice(0, charPosition)}${newStr}${text.slice(charPosition)}`;
}
