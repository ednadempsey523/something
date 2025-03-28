import readline from 'readline';
import { AgentContext } from '#agent/agentContextTypes';
import { Slack } from '#modules/slack/slack';
import { logger } from '#o11y/logger';
/**
 * Adding a human in the loop, so it doesn't consume all of your budget
 */
import { startSpan, withSpan } from '#o11y/trace';
import { sleep } from '#utils/async-utils';
import { beep } from '#utils/beep';

export async function waitForConsoleInput(humanInLoopReason: string) {
	await withSpan('consoleHumanInLoop', async () => {
		const span = startSpan('consoleHumanInLoop');

		// await appContext().agentStateService.updateState(agentContextStorage.getStore(), 'humanInLoop_agent');

		// Beep beep!
		await beep();

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		const question = (prompt) =>
			new Promise((resolve) => {
				rl.question(prompt, resolve);
			});

		await (async () => {
			logger.flush();
			await question(`Human-in-the-loop check: ${humanInLoopReason} \nPress enter to continue...`);
			rl.close();
		})();
	});
}

export async function notifySupervisor(agent: AgentContext, message: string) {
	const slackConfig = agent.user.functionConfig[Slack.name];
	// TODO check for env vars
	if (slackConfig?.webhookUrl || slackConfig?.token) {
		try {
			await new Slack().sendMessage(message);
		} catch (e) {
			logger.error(e, 'Failed to send supervisor notification message');
		}
	}
}

export async function humanInTheLoop(reason: string) {
	await waitForConsoleInput(reason);
}
