import fs from "fs";
import path from "path";
import { Config } from "../types.js";
import { HumioConfigProvider } from "./provider.js";

export class JsonConfigProvider implements HumioConfigProvider<Config> {
    private configs: Config[];

    constructor(configFileName: string) {
        const fileName = path.dirname(new URL(import.meta.url).pathname)
        const jsonPath = path.join(fileName, "..", "..", "..", configFileName)

        try {
            if (fs.existsSync(jsonPath)) {
                this.configs = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
            } else {
                console.warn(`Configuration file not found at ${jsonPath}, using default configuration`);
                this.configs = this.getDefaultConfigs();
            }
        } catch (error) {
            console.warn(`Failed to load configuration from ${jsonPath}, using default configuration: ${error}`);
            this.configs = this.getDefaultConfigs();
        }
    }

    private getDefaultConfigs(): Config[] {
        return [
            {
                name: "criticalErrors",
                description: "Finds critical errors grouped by message and stack trace",
                query: "severity = crit | groupBy([message, stack_trace])",
                fields: ["message", "stack_trace", "_count"],
                variables: [],
                outputTemplate: "Error \"{{message}}\" occurred in total: {{_count}} times. The Stack trace is \n---{{stack_trace}}\n---\n\n",
                joinString: "\n"
            }
        ];
    }

    getAllConfigs() {
        return this.configs;
    }
    getConfigByName(name: string) {
        return this.configs.find(cfg => cfg.name === name);
    }
}