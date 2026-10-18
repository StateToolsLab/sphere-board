/* Display names and shape descriptions; geometry is shared in app/states.js. */
(function(root,factory){if(typeof module==="object"&&module.exports)module.exports=factory();else root.SphereStateText=factory();})(globalThis,()=>({
  "not_started": {
    "name": "Not started",
    "shape": "Hollow circle"
  },
  "in_progress": {
    "name": "In progress",
    "shape": "Circle with a right-pointing progress arrow"
  },
  "frozen": {
    "name": "Frozen",
    "shape": "Six-armed snowflake",
    "gateShape": "Diamond containing a stop cross"
  },
  "carried_over": {
    "name": "Carried over",
    "shape": "Bent arrow and carry-over line"
  },
  "spanning": {
    "name": "Spanning",
    "shape": "Two intersecting rings"
  },
  "returned": {
    "name": "Returned",
    "shape": "Return arrow descending into a tray"
  },
  "handed_over": {
    "name": "Handed over",
    "shape": "Right arrow crossing a boundary"
  },
  "record_only": {
    "name": "Record only",
    "shape": "Record sheet with a folded corner"
  },
  "off_mainline": {
    "name": "Off mainline",
    "shape": "Arrow branching away from the mainline"
  },
  "cancelled": {
    "name": "Cancelled",
    "shape": "Octagon with crossed lines",
    "gateShape": "Diamond containing an x"
  },
  "discarded": {
    "name": "Discarded",
    "shape": "Discard bin with a lid"
  },
  "out_of_scope": {
    "name": "Out of scope",
    "shape": "Circle with a diagonal slash"
  },
  "scheduled": {
    "name": "Scheduled",
    "shape": "Calendar with date marks"
  },
  "none": {
    "name": "No state",
    "shape": "Short horizontal line"
  },
  "unknown": {
    "name": "Unknown",
    "shape": "Question mark and dot"
  },
  "pending": {
    "name": "Pending",
    "shape": "Hourglass"
  },
  "passed": {
    "name": "Passed",
    "shape": "Large check mark"
  },
  "passed_with_defects": {
    "name": "Passed with defects",
    "shape": "Check mark and vertical warning mark"
  },
  "sent_back": {
    "name": "Sent back",
    "shape": "Left U-turn arrow"
  }
}));
