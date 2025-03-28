import { currentUser } from '#user/userService/userContext';

export function envVarHumanInLoopSettings() {
	// Human in the loop settings
	// How often do we require human input to avoid misguided actions and wasting money
	const hilBudgetRaw = process.env.HIL_BUDGET;
	const hilCountRaw = process.env.HIL_COUNT;
	const hilBudget = hilBudgetRaw ? parseFloat(hilBudgetRaw) : 0;
	const hilCount = hilCountRaw ? parseInt(hilCountRaw) : 0;
	return {
		budget: hilBudget,
		count: hilCount,
	};
}
