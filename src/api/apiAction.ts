import { parse } from 'valibot'
import { ok, err, Result } from 'neverthrow'
import type { ApiError } from '@/services/errors'

export async function apiAction<TInput, TOutput>(
  input: TInput,
  inputSchema: any,
  outputSchema: any,
  executor: (validated: TInput) => Promise<TOutput>
): Promise<Result<TOutput, ApiError>> {
  try {
    const validatedInput = parse(inputSchema, input)
    const result = await executor(validatedInput)
    const validatedOutput = parse(outputSchema, result)

    return ok(validatedOutput)
  } catch (e: any) {
    if (e?.type) {
      return err(e) 
    }
    return err({ type: 'UNKNOWN_ERROR', cause: e })
  }
}