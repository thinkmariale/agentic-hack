import { SqliteDatabaseAdapter } from "@ai16z/adapter-sqlite";
import { AgentRuntime, ModelClass, ModelProviderName, generateMessageResponse, elizaLogger, Character, defaultCharacter, CacheManager, MemoryCacheAdapter } from "@ai16z/eliza";
import { bootstrapPlugin } from "@ai16z/plugin-bootstrap";
import Database from "better-sqlite3";
import { existsSync, readFileSync } from "fs";
import path, { resolve } from "path";
import { collablandPlugin } from "src/plugins/collabland.plugin.js";
import gateDataPlugin from "src/plugins/gated-storage-plugin/index.js";

elizaLogger.closeByNewLine = false;
elizaLogger.verbose = true;

export class BaseElizaService {
  private static instance: BaseElizaService;
  private runtime: AgentRuntime;

  private constructor() {
    // Load character from json file
    let character: Character;

    if (!process.env.ELIZA_CHARACTER_PATH) {
      elizaLogger.info(
        "No ELIZA_CHARACTER_PATH defined, using default character"
      );
      character = defaultCharacter;
    } else {
      try {
        // Use absolute path from project root
        const fullPath = resolve(
          __dirname,
          "../../..",
          process.env.ELIZA_CHARACTER_PATH
        );
        elizaLogger.info(`Loading character from: ${fullPath}`);

        if (!existsSync(fullPath)) {
          throw new Error(`Character file not found at ${fullPath}`);
        }

        const fileContent = readFileSync(fullPath, "utf-8");
        character = JSON.parse(fileContent);
        elizaLogger.info(
          "Successfully loaded custom character:",
          character.name
        );
      } catch (error) {
        console.error(
          `Failed to load character from ${process.env.ELIZA_CHARACTER_PATH}:`,
          error
        );
        elizaLogger.info("Falling back to default character");
        character = defaultCharacter;
      }
    }
    
    const sqlitePath = path.join(__dirname, "..", "..", "..", "eliza.sqlite");
    elizaLogger.info("Using SQLite database at:", sqlitePath);
    // Initialize SQLite adapter
    const db = new SqliteDatabaseAdapter(new Database(sqlitePath));

    db.init()
      .then(() => {
        elizaLogger.info("Database initialized.");
      })
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        throw error;
      });


    this.runtime = new AgentRuntime({
        databaseAdapter: db,
        token: process.env.OPENAI_API_KEY || "",
        modelProvider: ModelProviderName.OPENAI,
        character,
        conversationLength: 2,
        plugins: [bootstrapPlugin, collablandPlugin, gateDataPlugin],
        cacheManager: new CacheManager(new MemoryCacheAdapter()),
        logging: true,
      });
  }

  public static getInstance(): BaseElizaService {
    if (!BaseElizaService.instance) {
      BaseElizaService.instance = new BaseElizaService();
    }
    return BaseElizaService.instance;
  }

  public async processMessage(message: string): Promise<string | null> {
    try {
      const response = await generateMessageResponse({
        runtime: this.runtime,
        context: message,
        modelClass: ModelClass.MEDIUM,
      });

      return response.text;
    } catch (error) {
      console.error("Error processing message:", error);
      return null;
    }
  }
}
