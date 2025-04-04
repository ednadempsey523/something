import { expect } from 'chai';
import { InMemoryUserService } from '#modules/memory/inMemoryUserService';
import { User } from '../user';

describe('InMemoryUserService', () => {
	let inMemoryUserService = new InMemoryUserService();

	function createUserWithDefaults(overrides: Partial<User>): User {
		let defaultUser: User = {
			id: '',
			email: '',
			enabled: true,
			hilBudget: 0,
			hilCount: 0,
			llmConfig: {
				anthropicKey: '',
				openaiKey: '',
				groqKey: '',
				togetheraiKey: '',
			},
			chat: {
				enabledLLMs: {},
				defaultLLM: '',
				temperature: 1,
			},
			functionConfig: {},
			createdAt: new Date(),
			// gitlabConfig: {
			// 	host: '',
			// 	token: '',
			// 	topLevelGroups: [],
			// },
			// githubConfig: {
			// 	token: '',
			// },
			// jiraConfig: {
			// 	baseUrl: '',
			// 	email: '',
			// 	token: '',
			// },
			// perplexityKey: '',
		};
		return { ...defaultUser, ...overrides };
	}

	beforeEach(() => {
		// Reset the state before each test
		inMemoryUserService.users = [];
	});

	describe('getUser', () => {
		it('should retrieve a user by ID', async () => {
			let user = createUserWithDefaults({
				id: '1',
				email: 'test@example.com',
				hilBudget: 100,
			});
			await inMemoryUserService.createUser(user);
			let retrievedUser = await inMemoryUserService.getUser('1');
			expect(retrievedUser).to.deep.equal(user);
		});

		it('should throw an error if user is not found', (done) => {
			inMemoryUserService.getUser('nonexistent').catch((err) => {
				expect(err).to.be.an('error');
				done();
			});
		});
	});

	describe('updateUser', () => {
		it('should update user details', async () => {
			let user: User = {
				id: '2',
				email: 'original@example.com',
				enabled: true,
				hilBudget: 100,
				hilCount: 0,
				llmConfig: {
					anthropicKey: '',
					openaiKey: '',
					groqKey: '',
					togetheraiKey: '',
				},
				chat: {
					enabledLLMs: {},
					defaultLLM: '',
					temperature: 1,
				},
				functionConfig: {},
				createdAt: new Date(),
			};
			await inMemoryUserService.createUser(user);
			await inMemoryUserService.updateUser({ email: 'updated@example.com' }, '2');
			let updatedUser = await inMemoryUserService.getUser('2');
			expect(updatedUser.email).to.equal('updated@example.com');
		});
	});

	describe('disableUser', () => {
		it('should disable a user', async () => {
			let user: User = {
				id: '3',
				email: 'disable@example.com',
				enabled: true,
				hilBudget: 100,
				hilCount: 0,
				llmConfig: {
					anthropicKey: '',
					openaiKey: '',
					groqKey: '',
					togetheraiKey: '',
				},
				chat: {
					enabledLLMs: {},
					defaultLLM: '',
					temperature: 1,
				},
				functionConfig: {},
				createdAt: new Date(),
			};
			await inMemoryUserService.createUser(user);
			await inMemoryUserService.disableUser('3');
			let disabledUser = await inMemoryUserService.getUser('3');
			expect(disabledUser.enabled).to.be.false;
		});
	});

	describe('listUsers', () => {
		it('should list all users', async () => {
			let user1: User = {
				id: '4',
				email: 'list1@example.com',
				enabled: true,
				hilBudget: 100,
				hilCount: 0,
				llmConfig: {
					anthropicKey: '',
					openaiKey: '',
					groqKey: '',
					togetheraiKey: '',
				},
				chat: {
					enabledLLMs: {},
					defaultLLM: '',
					temperature: 1,
				},
				functionConfig: {},
				createdAt: new Date(),
			};
			let user2: User = {
				id: '5',
				email: 'list2@example.com',
				enabled: true,
				hilBudget: 100,
				hilCount: 0,
				llmConfig: {
					anthropicKey: '',
					openaiKey: '',
					groqKey: '',
					togetheraiKey: '',
				},
				chat: {
					enabledLLMs: {},
					defaultLLM: '',
					temperature: 1,
				},
				functionConfig: {},
				createdAt: new Date(),
			};
			await inMemoryUserService.createUser(user1);
			await inMemoryUserService.createUser(user2);
			let users = await inMemoryUserService.listUsers();
			expect(users).to.have.lengthOf(2);
			expect(users).to.deep.include.members([user1, user2]);
		});
	});

	describe('updateUser error cases', () => {
		it('should throw an error if user does not exist', (done) => {
			inMemoryUserService.updateUser({ email: 'noone@example.com' }, 'nonexistent').catch((err) => {
				expect(err).to.be.an('error');
				done();
			});
		});
	});

	describe('disableUser error cases', () => {
		it('should throw an error if user does not exist', (done) => {
			inMemoryUserService.disableUser('nonexistent').catch((err) => {
				expect(err).to.be.an('error');
				done();
			});
		});
	});

	describe('createUser', () => {
		it('should create a new user', async () => {
			let values = {
				id: '6',
				email: 'create@example.com',
			};
			let newUser = createUserWithDefaults(values);
			let createdUser = await inMemoryUserService.createUser(newUser);
			expect(createdUser.id).to.equal(values.id);
			expect(createdUser.email).to.equal(values.email);
			let retrievedUser = await inMemoryUserService.getUser('6');
			expect(retrievedUser.email).to.equal(values.email);
			expect(retrievedUser.id).to.equal(values.id);
		});
	});
});
