import { transliterateText } from "polydictyl-lib";
import { program } from "commander";
import dictate from "./dictate";

console.log("argv:", process.argv);

program.command("dictate <input>").action(dictate);

program.parse(process.argv);
