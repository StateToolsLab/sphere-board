# AI workflow for a Starter map

Use an AI assistant to propose changes, not to silently approve them. Read `.sphere/WORKFLOW.md` and the current `sphere-starter/0.3` map first. Preserve unknown facts as unknown, keep stable IDs, and do not infer meaning from an ID or address.

For a directly managed Starter map, use snapshot → candidate → validate → diff → human review → hash-checked apply. A map with a top-level `source` field is a read-only projection: update its source ledger instead of applying changes to the projection.

For creating a new map from prose or planning notes, use `prompts/plan-to-map.md`.
