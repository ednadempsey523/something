import { Type } from '@sinclair/typebox';
import { LlmFunctions } from '#agent/LlmFunctions';
import { AgentType } from '#agent/agentContextTypes';
import { AgentExecution, startAgent } from '#agent/agentRunner';
import { send } from '#fastify/index';
import { functionFactory } from '#functionSchema/functionDecorators';
import { getLLM } from '#llm/llmFactory';
import { logger } from '#o11y/logger';
import { currentUser } from '#user/userService/userContext';
import { AppFastifyInstance } from '../../server';

let v1BasePath = '/api/agent/v1';

let AGENT_TYPES: Array<AgentType> = ['xml', 'codegen'];

export async function agentStartRoute(fastify: AppFastifyInstance) {
	/** Starts a new agent */
	fastify.post(
		`${v1BasePath}/start`,
		{
			schema: {
				body: Type.Object({
					name: Type.String(),
					userPrompt: Type.String(),
					functions: Type.Array(Type.String()),
					type: Type.String({ enum: AGENT_TYPES }),
					budget: Type.Number({ minimum: 0 }),
					count: Type.Integer({ minimum: 0 }),
					llmEasy: Type.String(),
					llmMedium: Type.String(),
					llmHard: Type.String(),
				}),
			},
		},
		async (req, reply) => {
			let { name, userPrompt, functions, type, budget, count, llmEasy, llmMedium, llmHard } = req.body;

			logger.info(req.body, `Starting agent ${name}`);

			logger.info(Object.keys(functionFactory()));
			let llmFunctions = new LlmFunctions();
			for (let functionClassName of functions) {
				let functionClass = functionFactory()[functionClassName];
				if (!functionClass) {
					logger.error(`Function class ${functionClassName} not found in the functionFactory`);
				} else {
					llmFunctions.addFunctionClass(functionFactory()[functionClassName]);
				}
			}

			let agentExecution: AgentExecution = await startAgent({
				user: currentUser(),
				agentName: name,
				initialPrompt: userPrompt,
				type: type as AgentType,
				humanInLoop: { budget, count },
				llms: {
					easy: getLLM(llmEasy),
					medium: getLLM(llmMedium),
					hard: getLLM(llmHard),
					xhard: getLLM(llmHard),
				},
				functions: llmFunctions,
			});
			let agentId: string = agentExecution.agentId;
			send(reply, 200, { agentId });
		},
	);
}
