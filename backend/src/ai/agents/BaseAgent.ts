import { ToolDefinition } from '../providers/AIProvider';

export interface ToolResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract description: string;
  
  // Return the JSON definitions of the tools this agent supports
  abstract getTools(): ToolDefinition[];

  // Execute a tool by name with the given arguments
  abstract execute(toolName: string, args: any, userId: string): Promise<ToolResult>;
}
