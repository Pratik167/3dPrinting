# Layer Studio

Initial business website based on the Nepal 3D printing handoff. Layer Studio is a proposed brand; catalogue illustrations and starting prices are samples.

## Run locally in VS Code

Requires Node.js 22 or newer. No npm installation step or external services are needed.

1. Open `P:\3DPriniting\Layer Studio.code-workspace` in Visual Studio Code, or use File > Open Folder and choose `P:\3DPriniting\nepal-print-studio`.
2. Press F5 and choose **Run Layer Studio in browser**. This starts the Node debugger and opens your default browser.
3. Alternatively, open Terminal > New Terminal and run `npm run dev`, then visit `http://127.0.0.1:4173`.
4. Edit `worker/ui.html` for page design, catalogue and browser interactions; edit `worker/server.js` for API behavior. Save and refresh the browser. No build is needed for local development.
5. Stop the terminal server with Ctrl+C, or stop the F5 debug session using the debugger Stop button.

Outside VS Code, double-click `Start Website.cmd` to start the server and open your browser. Leave its terminal open while using the site. Start only one server on port 4173 at a time.

For local owner access, run `npm run admin:token` in a second terminal. Copy that token into **Studio access** in the website footer. This local token is separate from the hosted website token. It is generated once and stored in the Git-ignored `.local/admin-token` file.

Local enquiries and files persist in `.local/storage`, including across server restarts. Local data is separate from hosted data and is excluded from Git. Back up `.local` if you need to keep your local records. The server listens on your computer's loopback interface only. To choose another port in PowerShell: `$env:PORT=4174; npm run dev`.

Build: `npm run build`. Validate: `npm run validate` and `node scripts/check.mjs`.

Source: worker/ui.html (responsive interface and catalogue), worker/server.js (Cloudflare Worker API). Build combines these into dist/server/index.js. No framework dependencies required.

Runtime bindings: private R2 BUCKET for request JSON and attachments; secret ADMIN_TOKEN for the owner dashboard. Token is never embedded in browser source. Open Studio access in the footer and supply your token. Token stays in memory and is cleared when the dialog closes.

Features: category filtering, product details, quotation requests, one attachment up to 10 MB, private UUID tracking, admin enquiries, file download, production status and status history. Uploaded files are stored without parsing and downloaded as attachments; human printability review is required. `npm run dev` runs the full interface and API using local file storage. The older `scripts/preview.mjs` is an interface-only preview; use the development command above instead. Tests in `scripts/check.mjs` use an in-memory storage adapter and do not verify Cloudflare provisioning.

Before commercial launch: replace the proposed brand, sample prices and illustrations; add real contact/WhatsApp details, legal identity and final policies. Add payment gateways and AI only after merchant/API configuration. There is no checkout or AI generation in this release. The admin does not yet edit catalogue products or issue priced quotations; contact customers directly using enquiry details.

Privacy operations: use the R2 console to export/back up or delete request JSON and matching files. Set a retention policy before launch. Rate limits are best effort per hashed IP. For public traffic add edge request/body limits, malware scanning and admin login throttling. Treat STL/3MF as untrusted and inspect in an isolated workflow.
