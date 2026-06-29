import { ProviderModelMeta } from './types'

export default [
	{
		id: 'gpt-5',
		label: 'GPT-5',
		contextWindow: 'Depends on Conduit routing',
		maxOutputTokens: 'Depends on model',
		bestFor: ['Coding agent', 'Reasoning', 'General tasks'],
		notes: 'Officially shown in Conduit docs examples.'
	},
	{
		id: 'claude-opus-4-8',
		label: 'Claude Opus 4.8',
		contextWindow: 'Depends on Conduit routing',
		maxOutputTokens: 'Depends on model',
		bestFor: ['Hard coding', 'Architecture', 'Agentic tasks'],
		notes: 'Officially shown in Conduit docs examples.'
	},
	{
		id: 'claude-sonnet-4-6',
		label: 'Claude Sonnet 4.6',
		contextWindow: 'Depends on Conduit routing',
		maxOutputTokens: 'Depends on model',
		bestFor: ['Coding', 'Refactor', 'Fast agent work'],
		notes: 'Officially shown in Conduit docs streaming example.'
	},
	{
		id: 'gemini-3-pro',
		label: 'Gemini 3 Pro',
		contextWindow: 'Depends on Conduit routing',
		maxOutputTokens: 'Depends on model',
		bestFor: ['Long context', 'Analysis', 'General coding'],
		notes: 'Officially shown in Conduit docs examples.'
	},
	{
		id: 'grok-4',
		label: 'Grok 4',
		contextWindow: 'Depends on Conduit routing',
		maxOutputTokens: 'Depends on model',
		bestFor: ['General reasoning', 'Creative tasks', 'Coding help'],
		notes: 'Officially shown in Conduit docs parameter examples.'
	}
] as const satisfies ProviderModelMeta[]
