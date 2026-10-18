/* Static en presentation source, inserted into the shared controller at build time.
   No language selector or translation lookup. These functions format text only. */
function stateName(key) { return SphereStateText[key]?.name || key; }
function nodeDescription(label, kind, state, current, readiness, owner) { return `${label}. ${kind}. ${state}. ${current}${readiness}. Owner: ${owner}`; }
function currentPositionNumber(index, count) { return `Current position ${index}/${count}`; }
function currentPositionUnset(count) { return `Current position —/${count}`; }
function focusedCurrent(index, count, label) { return `Current position ${index}/${count}: ${label}`; }
function currentPositionsExplanation(count) { return `Current positions: ${count}. These shared work locations are independent of selection and readiness.`; }
function displayCoordinates(mode, x, y) { return `${mode} / (${x}, ${y}) · display only`; }
function problemCount(count, suffix) { return `Issues to review (${count})${suffix}`; }
function textParentChild() { return "Parent–child"; }
function textPrerequisiteSuccessor() { return "Prerequisite → successor"; }
function textOriginDerivedWork() { return "Origin → derived work"; }
function textReturnDestination() { return "Return destination"; }
function textBlocker() { return "Blocker"; }
function textExplicit() { return "Explicit"; }
function textRecheck() { return "Recheck"; }
function textEvent() { return "Event"; }
function textBuiltInDemoDisconnected() { return "Built-in demo · disconnected"; }
function textReadyNo() { return "Ready: no"; }
function textReadyUnknown() { return "Ready: unknown"; }
function textUnassigned() { return "Unassigned"; }
function textConcentricStageBands() { return "Concentric stage bands"; }
function textInactive() { return " · inactive"; }
function textProposed() { return " · proposed"; }
function textDerived() { return "Derived / "; }
function textAddAPlanToMapJsonToDisplayItHere() { return "Add a plan to map.json to display it here."; }
function textOverviewHelp() { return "Overview · concentric bands = stages / dashed bands = planned. Markers remain visible when zoomed out."; }
function textReadabilityNote() { return " (For readability, nearby ready work may be outside the view.)"; }
function textCurrentPosition() { return "Current position: "; }
function textNearbyReadyWork() { return "Nearby ready work: "; }
function textNoCurrentOrReady() { return "No current positions or ready work. Showing the overview."; }
function textBoardRenderingStopped() { return "Board rendering stopped"; }
function textFixSourceAndReload() { return "Fix the issues above in the source data, then reload. The previous board will not be presented as the new projection."; }
function textWorkInProgress() { return "Work in progress."; }
function textProjectionWorkflow() { return "This is a read-only projection of a ledger. Update the source ledger, then rebuild the projection."; }
function textPlanWorkflow() { return "Create a plan from a WBS or written outline, then apply authorized results through a separate candidate. Change skins in Settings."; }
function textReadOnlyReminder() { return "This viewer is read-only. Display controls do not change work states or human approval records."; }
function textCurrentChip() { return "◎ Current position"; }
function textOwner() { return "Owner"; }
function textLane() { return "Lane"; }
function textUnspecified() { return "Unspecified"; }
function textCoordinates() { return "Position"; }
function textDerivedChip() { return "Derived"; }
function textPlanned() { return "Planned"; }
function textReasonForCancellation() { return "Reason for cancellation"; }
function textSourceLedgerFields() { return "Source ledger fields"; }
function textSourceFieldsHelp() { return "The fields below show the original data as supplied. The board does not infer states or relations from them."; }
function textShowSource() { return "Show source (including notes, original states, and references)"; }
function textReasonForReadiness() { return "Reason for readiness"; }
function textAcceptanceCriteria() { return "Acceptance criteria"; }
function textRecordedEvidence() { return "Recorded evidence (verify its validity separately)"; }
function textHumanApprovalRecord() { return "Human approval record"; }
function textRelationsAndDirection() { return "Relations and direction"; }
function textParent() { return "Parent"; }
function textChild() { return "Child"; }
function textPrerequisite() { return "Prerequisite"; }
function textSuccessor() { return "Successor"; }
function textOrigin() { return "Origin"; }
function textDerivedWork() { return "Derived work"; }
function textReturnSource() { return "Return source"; }
function textInactiveSuffix() { return " (inactive)"; }
function textProposedSuffix() { return " (proposed)"; }
function textUnknown() { return "Unknown"; }
function textBlocks() { return "Blocks"; }
function textBlockedBy() { return "Blocked by"; }
function textSeparator() { return ", "; }
function textNone() { return "None"; }
function textListCurrentPrefix() { return "◎ Current position / "; }
function textNoMatchingNodes() { return "No matching nodes."; }
function textLayout() { return "Layout: "; }
function textWorkStates() { return "Work states"; }
function textGateResults() { return "Gate results"; }
function textEmptyLane() { return "Empty lane"; }
function textLoadingStopped() { return "Loading stopped"; }
function textDefaultDescription() { return "Your plan structure, in a skin of your choice."; }
function textProjectionReadOnly() { return "Projection · read-only"; }
function textRenderingStopped() { return "Rendering stopped"; }
function textProjectionRestrictions() { return "Projections are read-only. Snapshot, apply, and map export are unavailable. Update the source ledger and rebuild the projection."; }
function textProjectionExportDisabled() { return "Projection export is disabled. Update the source ledger."; }
function textAutomaticLayoutHelp() { return "Automatic layout by structure and order · drag or pinch to navigate"; }
function textManualCoordinatesReadOnly() { return "Manual coordinates · read-only"; }
function textCurrentPositions() { return "Current positions "; }
function textReadyWork() { return "Ready work "; }
function textCurrentPosition0() { return "Current position —/0"; }
function textPlannedSuffix() { return " · planned"; }
function textInputNeedsReview() { return "The input needs review. Board rendering stopped."; }
function textUnsupportedMap() { return "Unsupported format. Choose a sphere-starter/0.3 map.json."; }
function textCannotLoadTheMapBoardRenderingStopped() { return "Cannot load the map. Board rendering stopped.\n"; }
function textIssuesToReview() { return "Issues to review:\n"; }
function textDirectFileHelp() { return "You opened this file directly. Use Open map.json to load a map, or use the bundled serve command."; }
function textMapJsonResponseHttp() { return "map.json response: HTTP "; }
function textConnectedToALocalSameSiteMap() { return "Connected to a local / same-site map"; }
function textReloadFailedBoardRenderingStopped() { return "Reload failed. Board rendering stopped."; }
function textReloadFailedShowingTheLastValidMap() { return "Reload failed. Showing the last valid map."; }
function textCannotLoadTheTheme() { return "Cannot load the theme.\n"; }
function textReservedThemeId() { return "This ID belongs to a built-in theme. Use a different ID for your custom theme."; }
function textLoaded() { return "Loaded: "; }
function textThisSessionOnly() { return " (this session only)"; }
function textThemeLoaded() { return "Theme loaded. The semantic structure of the map is unchanged."; }
function textTheFileIsTooLarge() { return "The file is too large."; }
function textManuallyOpenedMapReadOnly() { return "Manually opened map · read-only"; }
function textUpdateProjectionSource() { return "Projections are read-only. Update the source ledger."; }
function textCouldNotStart() { return "Could not start.\n"; }
function currentPositionSentence() { return "Current position. "; }
function renderingStoppedSuffix() { return " · rendering stopped"; }
function themeName(theme) { return theme.name; }
