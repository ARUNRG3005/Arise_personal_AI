import { ProviderFactory } from '../providers/ProviderFactory';
import { ChatMessage, ToolDefinition } from '../providers/AIProvider';
import { TaskAgent } from '../agents/TaskAgent';
import { CalendarAgent } from '../agents/CalendarAgent';
import { MemoryAgent } from '../agents/MemoryAgent';
import { BaseAgent } from '../agents/BaseAgent';
import { logger } from '../../config/logger';
import { prisma } from '../../config/database';
import { ARISE_PERSONALITY } from '../personality/systemPrompt';

export interface OrchestratorResult {
  content: string;
  toolCalls: any[];
}

export class AIOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.registerAgent(new TaskAgent());
    this.registerAgent(new CalendarAgent());
    this.registerAgent(new MemoryAgent());
  }

  registerAgent(agent: BaseAgent) {
    this.agents.set(agent.name, agent);
    logger.info(`🤖 Registered AI Agent: ${agent.name}`);
  }

  private getAllTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = [];
    for (const agent of this.agents.values()) {
      tools.push(...agent.getTools());
    }
    return tools;
  }

  private async executeTool(name: string, args: any, userId: string): Promise<any> {
    for (const agent of this.agents.values()) {
      const tools = agent.getTools();
      if (tools.some(t => t.name === name)) {
        return await agent.execute(name, args, userId);
      }
    }
    throw new Error(`Tool ${name} not found in any registered agent.`);
  }

  async *processMessage(
    userMessage: string,
    history: ChatMessage[],
    userId: string
  ): AsyncGenerator<OrchestratorResult, void, unknown> {
    const provider = ProviderFactory.getProvider();
    const allTools = this.getAllTools();

    const systemPromptContent = `${ARISE_PERSONALITY}\n\nToday's current local time is: ${new Date().toString()}. Please resolve all relative date references (e.g. "tomorrow", "next Friday", "3pm") using this local time anchor.`;
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPromptContent }
    ];

    for (const msg of history) {
      messages.push(msg);
    }

    const lastMsg = history[history.length - 1];
    if (!lastMsg || lastMsg.content !== userMessage || lastMsg.role !== 'user') {
      messages.push({ role: 'user', content: userMessage });
    }

    logger.info(`Orchestrator processing message: "${userMessage}"`);

    // Let the provider handle the initial response or tool calls
    let loopCount = 0;
    const maxLoops = 3; // Prevent infinite tool execution loops
    let activeToolCalls: any[] = [];

    while (loopCount < maxLoops) {
      loopCount++;
      let toolToCall: { name: string; args: any; id: string } | null = null;
      let streamedResponseText = '';

      // Stream the tokens
      const stream = provider.streamChat(messages, allTools, { temperature: 0.1 });

      for await (const chunk of stream) {
        const choice = chunk.choices?.[0];
        if (!choice) continue;

        // Check for tool calls (if supported by LLM Provider chunking)
        if (choice.delta?.tool_calls) {
          const tc = choice.delta.tool_calls[0];
          if (!toolToCall) {
            toolToCall = {
              id: tc.id || `tc-${Math.random().toString(36).substring(2, 9)}`,
              name: tc.function?.name || '',
              args: tc.function?.arguments || '',
            };
          } else {
            if (tc.function?.name) toolToCall.name += tc.function.name;
            if (tc.function?.arguments) toolToCall.args += tc.function.arguments;
          }
          
          // Emit running status of tool to frontend
          yield {
            content: streamedResponseText,
            toolCalls: [{ name: toolToCall.name, status: 'running' }],
          };
        }

        // Stream standard text content
        if (choice.delta?.content) {
          streamedResponseText += choice.delta.content;
          yield {
            content: streamedResponseText,
            toolCalls: activeToolCalls,
          };
        }
      }

      // If no tool call was initiated, we are done
      if (!toolToCall || !toolToCall.name) {
        break;
      }

      // Parse tool arguments safely
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolToCall.args);
      } catch (e) {
        logger.error(`Failed to parse tool arguments: ${toolToCall.args}`, e);
      }

      logger.info(`AI decided to invoke tool: ${toolToCall.name} with arguments: ${JSON.stringify(parsedArgs)}`);

      // Update tools state to frontend
      activeToolCalls = [{ name: toolToCall.name, status: 'running' }];
      yield {
        content: streamedResponseText,
        toolCalls: activeToolCalls,
      };

      // Execute tool
      let toolResult;
      try {
        toolResult = await this.executeTool(toolToCall.name, parsedArgs, userId);
        activeToolCalls = [{ name: toolToCall.name, status: 'done' }];
      } catch (err: any) {
        logger.error(`Error executing tool ${toolToCall.name}:`, err);
        toolResult = { success: false, error: err.message || 'Tool execution failed.' };
        activeToolCalls = [{ name: toolToCall.name, status: 'error' }];
      }

      yield {
        content: streamedResponseText,
        toolCalls: activeToolCalls,
      };

      // Push the tool invocation and response into the conversation history context
      messages.push({
        role: 'assistant',
        content: streamedResponseText || null,
        tool_calls: [
          {
            id: toolToCall.id,
            type: 'function',
            function: {
              name: toolToCall.name,
              arguments: JSON.stringify(parsedArgs),
            },
          },
        ],
      });

      messages.push({
        role: 'tool',
        tool_call_id: toolToCall.id,
        content: JSON.stringify(toolResult),
        name: toolToCall.name,
      });

      // Prepare for next loop to digest tool results
    }
  }
}

export const orchestrator = new AIOrchestrator();
