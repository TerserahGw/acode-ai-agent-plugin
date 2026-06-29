import OpenAI from 'openai'
import { aiSettings } from '../settings'
import { ToolsFunction } from '../tools/functions/types'
import { tools as ollamaTools } from '../tools/ollama_tools'
import { Usage, StreamChunk, ChatMessage } from '../types'

export default async function* (
	model: string,
	messages: ChatMessage[],
	signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
	const config: any = {
		apiKey: aiSettings.apiKeys.openai,
		dangerouslyAllowBrowser: true
	}

	if (String(aiSettings.openaiHost).length > 0) {
		config.baseURL = aiSettings.openaiHost
	}

	const client = new OpenAI(config)

	const chatMessages: any[] = []

	if (aiSettings.systemInstruction) {
		chatMessages.push({
			role: 'system',
			content: aiSettings.systemInstruction
		})
	}

	for (const m of messages) {
		if (m.role === 'tool') continue

		chatMessages.push({
			role: m.role,
			content: m.content || ''
		})
	}

	const tools: any[] = ollamaTools.map(tool => ({
		type: 'function',
		function: {
			name: tool.function.name,
			description: tool.function.description,
			parameters: tool.function.parameters
		}
	}))

	let fullText = ''
	let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
	let resolvedModel = model

	while (true) {
		if (signal?.aborted) break

		const response: any = await client.chat.completions.create(
			{
				model,
				messages: chatMessages,
				temperature: aiSettings.temperature,
				max_tokens: aiSettings.maxTokens,
				tools,
				tool_choice: 'auto'
			},
			{ signal }
		)

		resolvedModel = response?.model ?? resolvedModel

		if (response?.usage) {
			usage = {
				inputTokens: response.usage.prompt_tokens ?? 0,
				outputTokens: response.usage.completion_tokens ?? 0,
				totalTokens: response.usage.total_tokens ?? 0
			}
		}

		const choice = response?.choices?.[0]
		const message = choice?.message
		const text = getMessageText(message)

		if (text) {
			fullText += text
			yield { type: 'text', model: resolvedModel, delta: text }
		}

		const toolCalls = Array.isArray(message?.tool_calls)
			? message.tool_calls
			: []

		if (!toolCalls.length) break

		chatMessages.push({
			role: 'assistant',
			content: message?.content || '',
			tool_calls: toolCalls
		})

		for (const call of toolCalls) {
			const toolName = call?.function?.name
			if (!toolName) continue

			try {
				const toolFunction: ToolsFunction = (
					await require(`../tools/functions/${toolName}`)
				).default

				const rawArgs = call?.function?.arguments ?? '{}'
				const args = safeJsonParse(rawArgs)
				const chunkedResult = toolFunction(args as any)

				let resultContent = ''

				for await (const toolChunk of chunkedResult) {
					if (toolChunk.toSave) {
						yield {
							type: 'tool',
							delta: toolChunk.toSave,
							model: resolvedModel
						}
					}

					if (toolChunk.result) {
						resultContent = toolChunk.result
						break
					}
				}

				chatMessages.push({
					role: 'tool',
					tool_call_id: call.id,
					content: resultContent || '[NO RESULT]'
				})
			} catch (e: any) {
				const errorMessage =
					e instanceof Error ? e.message : String(e || 'Unknown error')

				chatMessages.push({
					role: 'tool',
					tool_call_id: call.id,
					content: `[ERROR] ${errorMessage}`
				})
			}
		}
	}

	yield {
		type: 'done',
		text: fullText,
		provider: 'openai',
		model: resolvedModel,
		usage
	}
}

function safeJsonParse(raw: string): Record<string, any> {
	try {
		return JSON.parse(raw)
	} catch {
		return {}
	}
}

function getMessageText(message: any): string {
	const content = message?.content

	if (!content) return ''
	if (typeof content === 'string') return content

	if (Array.isArray(content)) {
		return content
			.map(part => {
				if (typeof part === 'string') return part
				if (part?.text) return part.text
				if (part?.content) return part.content
				return ''
			})
			.join('')
	}

	return ''
}
