# Share the website using GitHub Pages

This repository contains the website in `nepal-print-studio/`. The workflow belongs at the repository root in `.github/workflows/deploy-pages.yml`.

The website folder was previously an embedded Git repository recorded as a gitlink in the outer repository. It has been converted to ordinary files so GitHub Actions receives the source. The previous inner Git metadata is preserved locally under `.git/nested-repository-backups/nepal-print-studio`. A staged deletion of the old `nepal-print-studio` gitlink plus additions of its files is expected; the website folder has not been deleted.

## Publish

1. Commit and push the new workflow and the updated `nepal-print-studio` files to your default GitHub branch.
2. In the repository on GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open **Actions → Publish website to GitHub Pages → Run workflow**. Select the default branch and run it. Later pushes to the default branch publish automatically.
5. Wait for the build and deploy jobs to finish. Open the URL in the deployment result or **Settings → Pages**, then share it.

For `Pratik167/3dPrinting`, the expected address is `https://pratik167.github.io/3dPrinting/`. It becomes available only after successful deployment; a custom domain or account settings can change the address.

GitHub Pages must be available for your repository's visibility and plan. If GitHub reports Pages is unavailable, check those settings. The workflow does not change repository visibility or enable Pages automatically.

## Enable email enquiries

GitHub Pages serves static files. It cannot execute the Node/Worker API, store uploaded files, or run the owner dashboard.

The Pages version keeps the catalogue, filters, product details, mobile layout and terms. It hides tracking and owner access. Without contact configuration, the enquiry form clearly says enquiries are not open and cannot be submitted.

To accept enquiries by email:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Add a repository variable called `CONTACT_EMAIL` with your business email address. It is public contact information and will appear in the published website. Do not use an admin token or secret here.
3. Run the workflow again.

The form then opens a prepared email draft. Customers must send it from their email app and attach any STL/3MF/images there. There is no automatic request submission or tracking. Local and existing hosted API behavior is unchanged.

For online uploads, tracking, payments or the dashboard on a public site, deploy the full application to a backend-capable host. The existing private hosted site is not a public backend for GitHub Pages.

## Local build

From `nepal-print-studio/`, run `npm run build:pages`. The output is `_site/index.html`; only `_site/` is uploaded by the workflow. Optional PowerShell example: `$env:CONTACT_EMAIL='your-business-email@example.com'; npm run build:pages`.

Never upload `.local/`, admin tokens, `.env` files or the entire repository as the Pages artifact. The workflow exports only the public interface.
