# Add HTTPS certificate upload to the settings page

Fixes duplicati/duplicati#1843

## Summary
The server can already replace its HTTPS certificate through `POST /api/v1/uisettings` (`UpdateCertificate`), but the UI never calls it. As noted in the issue, this is supported on the server but not exposed in the UI.

This PR adds an **HTTPS certificate** section to Settings, after "Allow remote access":
- Pick a `.pfx`/`.p12` file and enter its password. The file is sent base64 encoded as `{ Certificate, Password }`.
- The upload button needs both a file and a non-blank password, because the server rejects a PFX without a password (`Utility.LoadPfxCertificate`).
- If the page is not loaded over HTTPS, a warning says the certificate and password are sent unencrypted and suggests uploading from the machine that runs Duplicati (suggested in the issue thread).
- On success the form is cleared and a message explains that a server still on HTTP switches to HTTPS the next time it starts. A server already on HTTPS uses the new certificate for new connections, since `ConfigureHttps` reads the certificate on every handshake.
- Errors (wrong password, invalid file) are shown by the existing HTTP interceptor, and the form keeps its values.

No server changes. Showing certificate details and generating a self-signed certificate from the UI are left out of scope.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/settings/ssl-certificate/ssl-certificate.component.spec.ts`: 9 passed. The component test renders the real template, selects a file, types the password, clicks Upload and asserts the request body passed to `postApiV1Uisettings`.
- Mutation check: sending the file name instead of the base64 content makes the request-body test fail.
- `ng build ngclient` succeeds.
- Not tested against a running server with a real certificate.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
