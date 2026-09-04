# UNBIG banner parts

These assets are deterministic crops of the original 2171×724 banner supplied
for the mobile visual refresh. They contain no UNBIG wordmark, subtitle, or
milestone labels.

| Asset | Size | Intended use | Suggested rendering |
| --- | ---: | --- | --- |
| `today-mountain.jpg` | 700×724 | Today header atmosphere | Place at the left edge with `resizeMode="contain"`; fade its right and lower edges into `colors.paper` so the greeting and headline stay on clear paper. |
| `journey-progress-steps.jpg` | 941×364 | Journey header illustration | The approved person-on-steps composition, including the four illustrated milestones and their labels but excluding the banner wordmark and feature-copy row. Use full-width with `resizeMode="cover"`. |
| `journey-crumble-horizon.jpg` | 900×280 | Alternate quiet Journey treatment | Mountain-and-stones horizon without typography or milestones. It is retained as an unused alternate. |
| `capture-hero-composite.jpg` | 1429×1101 | Capture header | Cleaned composite from the approved mockup. It includes the mountain and Capture heading copy but no simulator chrome. Render full-width above the live photo controls. |
| `capture-mountain-detail.jpg` | 560×620 | Alternate Capture treatment | Mountain-only crop retained as an unused alternate. |
| `project-text-fallback.jpg` | 640×640 | Thumbnail for projects created from words | Use only when the project has no user photo. User photos always take precedence. |

The original source remains `../unbig-banner.jpg`. Keep the source intact and
derive any future crops into this directory rather than overwriting it.
