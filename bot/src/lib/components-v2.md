# Discord Message Components v2

## Overview

Discord introduced Components v2 to enhance message interactivity and layout flexibility. This new system replaces traditional embeds and content fields when enabled.

## Key Features

- **Layout Components**: Organize and structure message content
- **Content Components**: Display information such as text and images  
- **Interactive Components**: Enable user interactions through buttons, select menus, etc.

## Important Notes

1. **IS_COMPONENTS_V2 Flag**: Set the flag `1 << 15` (bit 15) in message flags to enable Components v2
2. **Content/Embeds Disabled**: When Components v2 is enabled, traditional `content` and `embeds` fields are disabled
3. **All Content as Components**: All content must be sent as components instead

## Documentation

- Main Documentation: https://discord.com/developers/docs/change-log/2025-04-22-components-v2
- Check linked documentation in the main page for detailed component specifications

## Implementation Status

⚠️ **Note**: The exact component structure and types are still being finalized by Discord. 
The utility functions in `components-v2.ts` are placeholders that will need to be updated
once Discord releases the full Components v2 specification.

## Migration from Embeds

When migrating from traditional embeds to Components v2:

1. Convert embed fields to appropriate component types
2. Set the IS_COMPONENTS_V2 flag in message flags
3. Remove `content` and `embeds` fields from the message payload
4. Structure all content using Components v2 layout components


