/**
 * Discord Message Components v2 Utilities
 * 
 * Components v2 is a new message format that replaces traditional embeds and content.
 * When using Components v2, you must set the IS_COMPONENTS_V2 flag (1 << 15) in the message payload.
 * 
 * Important: When using Components v2, the `content` and `embeds` fields are disabled.
 * All content must be sent as components instead.
 * 
 * Documentation: https://discord.com/developers/docs/change-log/2025-04-22-components-v2
 */

import type { APIInteractionResponseCallbackData, MessageFlags } from 'discord.js';

/**
 * The IS_COMPONENTS_V2 flag (bit 15)
 * This flag must be set in the message flags to enable Components v2
 */
export const IS_COMPONENTS_V2: MessageFlags = 1 << 15;

/**
 * Creates a Components v2 message payload
 * 
 * @param components - Array of component objects following Components v2 format
 * @param flags - Additional message flags (IS_COMPONENTS_V2 is automatically added)
 * @returns Message payload ready to send
 */
export function createComponentsV2Message(
	components: unknown[],
	flags: MessageFlags = 0 as MessageFlags
): APIInteractionResponseCallbackData {
	return {
		flags: (flags | IS_COMPONENTS_V2) as MessageFlags,
		components: components as never[]
	};
}

/**
 * Example Components v2 structure:
 * 
 * Layout Components:
 * - Organize and structure message content
 * - Examples: Row, Column, Stack
 * 
 * Content Components:
 * - Display information such as text and images
 * - Examples: Text, Image, Embed (new format)
 * 
 * Interactive Components:
 * - Enable user interactions through buttons, select menus, etc.
 * - Examples: Button, SelectMenu
 * 
 * Note: The exact structure and component types will depend on Discord's official
 * Components v2 documentation. This is a placeholder structure.
 */

/**
 * Helper to create a text component (Components v2 format)
 * This is a placeholder - actual implementation depends on Discord's Components v2 spec
 */
export function createTextComponent(text: string, style?: string): unknown {
	return {
		type: 'text', // Placeholder - actual type from Discord spec
		content: text,
		style
	};
}

/**
 * Helper to create a button component (Components v2 format)
 * This is a placeholder - actual implementation depends on Discord's Components v2 spec
 */
export function createButtonComponent(
	label: string,
	customId: string,
	style: 'primary' | 'secondary' | 'success' | 'danger' = 'primary'
): unknown {
	return {
		type: 'button', // Placeholder - actual type from Discord spec
		label,
		custom_id: customId,
		style
	};
}


