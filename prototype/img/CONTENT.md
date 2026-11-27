# Content images (not in Git)

Folders `team/`, `board/`, `directions/`, `news/` hold **mock content** for the static prototype.

- Versioned in Git: page chrome, CSS/JS, HTML structure (paths to these files).
- Not versioned: the image binaries themselves — kept locally and uploaded with `scripts/deploy-staging-ui.sh`.
- WordPress later: upload to Media Library / featured images / term meta; theme only prints URLs from the DB.
