# Summary

*Provide a brief summary of what the PR addresses and why it's necessary.*

## Changes Made

*Outline the main changes made in the PR, such as:*

*- Features added*
*- Bugs fixed*
*- Refactoring performed*

## Testing

*Detail any tests added or steps to reproduce and validate the changes.*

## Screenshots/Demos

*Include screenshots or video demos for UI changes or visual updates.*

## Known Limitations or Future Work

*Mention any known limitations of the current implementation or areas that may need further work in the future.*

## Checklist

- [ ] Self-reviewed code
- [ ] Tests added or updated for the change (co-located with the code)
- [ ] `pnpm test` and `pnpm test:e2e` pass locally
- [ ] `pnpm format` and `pnpm lint` are clean
- [ ] No new warnings generated
- [ ] UI changes checked in both themes, at mobile and desktop widths, and with keyboard navigation
- [ ] No direct upstream calls from the client (data goes through the BFF, validated with Zod)
