# Sphere Board: A Read-Only Project Map of Stage Bands and Boundary Gates

**Author:** Kiyoshi Deguchi, Independent Researcher (ORCID: 0009-0000-5850-9262)  
**Copyright holder:** StateToolsLab  
**Date:** 2026-10-17 (first publication; this revision 2026-10-18)  
**Version:** 1.1 (revised 2026-10-18; first edition 1.0: 2026-10-17)  
**License: CC BY 4.0** (this paper and its original schematic; reference implementation: MIT)

## Abstract

Sphere Board is a read-only map of one project's ledger, `map.json`. Its automatic layout places ordered stages in concentric bands, work rows as beads inside their stage, and stage gates on the corresponding outer boundaries. In a sequentially gated plan, the innermost gate not yet crossed indicates the present gate-defined reach; the area beyond it represents stages that become accessible when the intervening gates are crossed. This is a reading convention, not an implemented visibility or authorization mechanism. Separate marks indicate recorded readiness and current locations. The v0.6.0 reference implementation separates geometry from state: state changes replace shapes and marks without relocating beads. This paper records the model, its implementation conditions, and a bounded comparison with thirteen related representation families. It reports neither an exhaustive novelty search nor evidence of improved user performance.

## 1 Introduction

A project plan may need to communicate stage order, the decision that permits further progression, and individual work that can be started now. These are distinct questions: a row's stage membership does not establish its readiness, and a favorable task result does not itself establish that a release gate has passed. Sphere Board makes these distinctions explicit in a spatial vocabulary.

The design places the project's stage sequence outward from the center. Work remains within its assigned stage, while gates occupy stage boundaries. Progress changes the interpretation of how far the project can proceed, rather than moving completed work into a different region. The board is a view of recorded planning facts; changes are made in the ledger and then loaded into the viewer. This document describes the Sphere Board v0.6.0 reference implementation [0], without asserting priority over unexamined work.

## 2 The Sphere Board model

A board represents one project. In the reference format, a stage is a `group` node. A `phase` is a separate grouping level: one phase occupies a full circle; multiple phases occupy equal angular sectors. Within each phase, stages appear from the center outward in their recorded order, with stages explicitly marked as planned placed after non-planned stages. Consequently, multi-phase boards express stage order within sectors, rather than a single chronological order across every sector.

The first stage's background extends to the center; subsequent stages are annular bands. Each stage has a fixed outer boundary. A gate assigned to that stage is placed on this boundary, with the following stage immediately outside it. A gate recorded as a derived item of a work bead is an exception: it appears on that bead's short branch rather than on the boundary. In the intended reading, gates are decision sites governing progression toward publication or release. The renderer places recorded gates; it does not create a missing gate or establish the organization's decision policy.

Work rows appear as beads inside the appropriate band. Angular placement distributes mainline work by recorded lanes and ordering; within-band radius also supports packing. Exact bead distance is therefore not an elapsed-time, effort, or completion measure. The meaningful radial distinction is stage membership and order. Project, phase, and stage nodes serve as structural anchors and headings rather than prominent work beads. In the model, a bead's state is expressed by shapes and marks, or by color, without changing its position; color is thus permitted by the model, but the reference implementation does not use it for state (§4). When state is shown by color alone, the list view and a legend should keep it readable.

Derived tasks attached to work beads are drawn as smaller beads on short outward branches. Issues and decisions may appear as smaller satellites. Dependency, origin, return, and blocking relations retain their distinct meanings; they are not interchangeable with parentage. Work without a stage ancestor is placed in an outer margin rather than assigned an invented stage.

![Three-stage schematic of Sphere Board](figure-1.svg)

**Figure 1.** An illustrative adaptation of the bundled fictional essay example: concept, first draft, and planned publication. Gates occupy each stage's outer boundary. A four-segment arc mark indicates a current location or a pending gate; four straight ticks indicate recorded readiness. The first gate is passed; the second and third are pending. Thus, in this sequential example, the present gate-defined reach is the region through the second boundary. All three stages remain visible. The schematic omits most ledger rows and is not an exact rendering or a complete status snapshot. Figure 1 is unchanged from version 1.0.

## 3 Reading the board

For a plan whose relevant stage gates govern sequential progression, read outward until the first boundary containing a relevant gate that has not passed. This reading concerns gates on stage boundaries; derived gates on branches are inspected together with their parent work. The region through that boundary is the project's **present gate-defined reach**. The region beyond it is the **conditional outer range**, opened in the planning sense by crossing the intervening gates. A passed gate with recorded defects counts as passed in the reference format, but its distinct result remains visible. A sent-back, frozen, cancelled, or unknown gate must not be read as a successful crossing.

This convention does not imply that every inner bead is actionable, or that every outer bead is forbidden. Readiness belongs to individual ledger rows. The viewer displays the ready mark only for a recorded `ready=true`; it does not recompute readiness from bead proximity or the frontier. Dependencies and blockers must be inspected separately. For directly managed maps, validation checks recorded readiness against explicit prerequisites and blockers [0]. The reach convention is a stage-level interpretation, not a computed graph-reachability result. Within that reach, one may read progress as prerequisites (`dependency`) being satisfied and blockers (`blocks`) being resolved one by one, allowing further beads to become actionable when their remaining conditions are met and `ready=true` is explicitly recorded in the ledger [0].

Current marks identify rows explicitly listed as current and also gates whose result is pending. They are not moving character tokens, and a pending gate's mark does not necessarily mean that a person is physically working there. Ownership is conveyed separately through text and lane indications. Multiple current locations and ready beads can coexist.

With several gates on a boundary, their recorded roles and outcomes require inspection; the viewer does not decide which combination authorizes progression. With several phases, the reading applies within each sector unless the ledger states a cross-phase relation. Where no relevant gate is recorded, the board alone cannot establish the frontier. In v0.6.0, outer bands are neither hidden nor darkened because a gate is pending. Passing a gate changes its state shape, not the extent of drawn territory.

## 4 Properties of the reference implementation

The following properties concern the default automatic layout in v0.6.0, as specified in `docs/auto-layout.md` and implemented in `app/layout.js` [0].

**State-independent positions.** Work state, readiness, current-location membership, ownership, labels, and source payloads do not determine bead coordinates. State is layered through fixed symbol geometry, while readiness, current location, planned status, and blocking use separate marks. Lane color has a separate meaning. Color-based state display, which the model allows (§2), is not used in v0.6.0; its relation to lane color is left to later viewers. The state definitions distinguish fifteen work-state shapes and six gate-result shapes, including different shapes for the shared words “frozen” and “cancelled.”

**Deterministic geometry.** Identical layout input processed by the same implementation produces identical geometry. Explicit order values take precedence, followed by ledger array order for rows without an order value. Placement uses neither randomness nor text measurement nor viewport size. This is a coordinate guarantee, not a promise of identical pixels across browsers, themes, or camera settings.

**Locality under row additions.** Fixed stage boundaries prevent a denser stage from expanding and pushing later stages outward. Adding an ordinary row, derived task, or satellite to an existing stage preserves bead coordinates in other stages and phases, provided the surrounding structure remains fixed. The affected stage may rearrange or shrink its own beads. This guarantee excludes changes to phases, stages, parentage, ordering, lanes, or planned-stage classification. Label visibility is not covered by the same cross-stage invariant.

**Local branches and planned territory.** Attached derived tasks use outward candidate positions near their parent; completed branches remain in place. For boundary parents, a small outer display margin is allowed. Explicitly planned stages are moved to the outside by stable partition and outlined with dashed boundaries. This uses the planned flag, not the stage's state symbol alone.

**Read-only interaction.** Selection, hover, pan, zoom, list inspection, and theme changes do not rewrite planning facts. The intended workflow assigns an AI participant responsibility for preparing ledger updates after each work activity, with validation and human review before application, without excluding human maintenance of the ledger (`docs/ai-workflow.md` and `prompts/` [0]). An AI participant asked to update a ledger should be given the map itself, the Starter format specification, the project's WORKFLOW file, and the update prompt in addition to this paper; this paper is not a complete specification for automated execution. Relationships are drawn from recorded edges, with selection and low-zoom display rules reducing visual clutter. Explicit manual mode uses supplied coordinates only when every node has finite coordinates; it does not enforce the automatic radial model. Dense bands may require zoom or list inspection. During preparation of the initial draft, the bundled layout and state-shape tests were run on v0.5.0: 57 tests passed. These checks support implementation behavior, not usability claims.

## 5 Related work

The representations compared here answer different questions about what one wants to see or express; this comparison records differences in what they show, rather than ranking their merits.

Table 1 compares the selected examples. “Not specified” means that the inspected source establishes no position contract of that kind; it does not assert that every implementation lacks the feature. Statements about absent stage-boundary gates are limited to the cited representation or example, not all possible extensions.

| Representation and source | Meaning of radius or ordering; object represented | Boundary or gate | Position under state or progress change |
|---|---|---|---|
| Sequential sugoroku [1] | Ordered squares on a game route | Route rules; no project-stage gate specified | Piece advances; squares form the route |
| Tree / WBS [2] | Hierarchical decomposition of project work | Parent–child grouping; no radial stage gate specified | State-based movement not specified |
| Gantt chart [3] | Start and finish dates; project tasks | Dependencies can be linked; no radial stage gate | Bars follow dates; progress alone does not move them in the cited view |
| State-column Kanban [4] | Workflow states; work items | Explicit flow policies, not concentric boundaries | In the column convention, an item changes column with state |
| FFX Sphere Grid [5,6] | Connected character-development nodes | Local locks opened with key spheres | Character position and node activation change |
| Knowledge graph [7] | Entities and semantic relations | No stage-boundary requirement in the cited definition | Layout and progress semantics not specified |
| Mind map [8] | Central idea, parent and child branches | Branch hierarchy; no stage gate specified | Branches are placed by drag and drop in the cited tool; no state-based position rule specified |
| Technology Radar [9] | Rings encode adoption recommendations; technologies and techniques | Category rings, not project authorization gates | Blips can change rings as recommendations change |
| Sunburst [10] | Radial levels encode hierarchy; files and directories | Hierarchical slices, not release gates | Focus navigation changes displayed geometry; work state not specified |
| Concentric roadmap [11] | Now / Next / Later horizons; product priorities | Horizon boundaries; no release gate specified | Priorities evolve; no fixed-coordinate contract specified |
| Deployment rings [12,13] | Increasing exposure of a release to user groups | Checks and approval gates control rollout | Exposure progresses; no task-coordinate contract specified |
| Spiral model [14] | Radius: cumulative cost; angle: progress within cycles | Review and commitment between cycles | Process advances along a spiral |
| Stage-Gate [15,16] | Stages of product development | Decisions between stages, preceding the next stage | No bead-coordinate contract specified |
| Sphere Board [0] | Stage order; rows of one project | Recorded gates on stage outer boundaries | Shapes and marks, or color, change; automatic coordinates remain fixed under state-only changes |

**Table 1.** Semantic and positional comparisons. The Kanban row describes the state-column display convention; the guide defines states and transition policies without requiring columns [4].

The sugoroku comparison is deliberately limited to a sequential route. The National Diet Library distinguishes sequential and jumping forms of illustrated sugoroku, so “sugoroku” cannot universally mean one path [1]. Sphere Board does not require all work beads to form a single traversal route. It can retain a hierarchy, but its main radial meaning is stage sequence rather than decomposition depth.

Mind maps provide a similar center-outward appearance, yet their parent and child branches elaborate a central topic [8]. Knowledge graphs encode entities and relations; the cited definition supplies neither a screen-radius meaning nor a required progress scale [7]. A specialized knowledge-graph visualization could add such meanings. The comparison therefore concerns the underlying representation, not an impossibility claim.

Technology Radar and Sunburst establish clear circular precedents. Radar rings communicate recommendations rather than a project's stage sequence [9]; Sunburst's radial hierarchy serves a different organizing variable [10]. Neuron's roadmap example explicitly assigns concentric circles to Now, Next, and Later [11]. These precedents show that concentric appearance alone cannot establish distinctiveness.

The Sphere Grid provides a comparison involving current position, node activation, and restricted routes. Its official manual explains movement and activation [5]; a separately identified secondary guide documents locks and matching key spheres [6]. Despite the proximity of the names Sphere Board and Sphere Grid, Sphere Board does not borrow the game's graphics, terminology, or visual design. Whereas the Sphere Grid manual describes movement within a character's sphere-level-dependent range and activation at its current or connected adjacent nodes [5], Sphere Board can display multiple ready beads and current marks simultaneously, with stage progression read through gates on stage outer boundaries rather than movement between adjacent beads (§3) [0].

**Deployment rings are the closest exposure analogy.** Microsoft's documentation describes exposing a release to a small group and then successively broader audiences [12]. Its continuous-delivery article explicitly discusses deployment rings and manual or automated approval gates [13]. These sources support the distinction: deployment rings organize the recipients and exposure of a release, whereas Sphere Board's bands organize the stage sequence of one project. Sphere Board places publication or release decisions and work rows together in a planning map; it neither distributes software nor monitors rollout health. The comparison does not claim that deployment-ring documentation mandates literal concentric geometry or universally numbers its first tier “ring 0.”

Boehm's spiral is risk-driven: its radius represents accumulated cost and its angle progress through a cycle [14]. Sphere Board uses fixed stage bands, not that cost scale. Stage-Gate is a closer process precedent: work stages and decisions governing continuation are already established concepts [15,16]. Sphere Board records a particular spatial rendering of those distinctions; it does not originate staged governance or prescribe Stage-Gate's management method.

## 6 Scope of this disclosure and limitations

This document, written by its author with StateToolsLab as copyright holder, records the stated structure. Version 1.0 was first published on 2026-10-17 together with reference implementation v0.5.1. This version 1.1 is a revision intended for release together with v0.6.0.

The comparison was prepared on **2026-10-07** using targeted web searches and direct source inspection across **thirteen representation families and sixteen external source items** listed as [1–16]. These comprised an institutional exhibition, official software and method documentation, a game manual, one secondary game guide, research-paper sections, a practitioner's roadmap example, and a bibliographic record for Cooper's 1990 paper. Not every long source was read in full; `check.md` (`docs/paper/check.md` in [0]) identifies access depth and the inspected passages. The search covered the requested families and terms for radial or concentric roadmaps, deployment rings, the spiral model, and staged gates. It was not a systematic literature, patent, or commercial-tool search.

Within that bounded source set, no inspected example was identified that explicitly combined radius as project-stage order, gates on those stages' outer boundaries, and project work rows inside the bands. This observation concerns the inspected descriptions only; it is not proof of novelty, first use, or superiority. The combined meaning of Figure 1 is an author-defined reading convention grounded in the implementation's geometry, not an externally validated theory of project progress.

No user evaluation has been conducted. Comprehension, speed, error reduction, accessibility in use, and comparisons with other tools remain unmeasured. Missing gates, conflicting readiness, dense content, and ambiguous cross-phase policies limit interpretation. A stable layout can still be difficult to read, and a faithful display can still contain inaccurate ledger facts.

## 7 Future work

A subsequent model is planned and will be described in a separate document.

## 8 Availability

The reference implementation is **Sphere Board v0.6.0**, copyright © 2026 StateToolsLab, under the **MIT License**. The repository is `https://github.com/StateToolsLab/sphere-board`. The `v0.6.0` release includes fictional examples, implementation documentation, and tests; this paper and its original schematic are located under `docs/paper/` [0].

## References

All external Web sources below were accessed on **2026-10-07**. Undated pages are marked n.d.; dates are not inferred from search-engine crawl metadata.

[0] StateToolsLab. *Sphere Board v0.6.0*. Software and bundled documentation, 2026. Release tag: `v0.6.0`. Especially `README.md`, `docs/auto-layout.md`, `docs/state-shapes.md`, `spec/starter-map.md`, `app/layout.js`, `app/main.js`, `app/states.js`, `docs/ai-workflow.md`, `prompts/plan-to-map.md`, `prompts/update-map.md`, and `templates/project/.sphere/WORKFLOW.md`. Repository: `https://github.com/StateToolsLab/sphere-board`.

[1] National Diet Library. “振り出し.” *本の万華鏡 第12回 紙の上の旅・人・風俗―江戸の双六―*, 2013. https://www.ndl.go.jp/kaleido/entry/12/

[2] NASA. “7.5 — Work Breakdown Structures That Include Software.” *NASA Software Engineering Handbook, Version B*, n.d. https://swehb.nasa.gov/pages/viewpage.action?pageId=129990996

[3] Microsoft. “Work with the Gantt Chart view.” *Microsoft Support*, n.d. https://support.microsoft.com/en-gb/project/work-with-the-gantt-chart-view

[4] Orderly Disruption Limited and Daniel S. Vacanti, Inc. *The Kanban Guide*. May 2025 edition. https://kanbanguides.org/the-kanban-guide/

[5] Square Enix. *Final Fantasy X / X-2 HD Remaster: PlayStation 3 Instruction Manual*. 2014, printed pp. 16–19, “The Sphere Grid.” https://cdn.sqexeu.com/sea/ffxii/manuals/FFX-FFX2_PS3_ManInt_English_013014.pdf

[6] Split_Infinity. *Final Fantasy X — Guide and Walkthrough*. GameFAQs, n.d. “Sphere Grid” questions and sphere-item list; secondary source. https://gamefaqs.gamespot.com/ps2/197344-final-fantasy-x/faqs/18197

[7] Hogan, Aidan, et al. *Knowledge Graphs*. Research tutorial, arXiv:2003.02320v6, 2021. Introduction and “Knowledge graph” definition. https://arxiv.org/html/2003.02320v6

[8] Ayoa. “An overview of Mind Maps in AYOA.” *Ayoa Help Centre*, 2026-05-08. https://support.ayoa.com/key-elements-of-mind-maps-in-ayoa

[9] Thoughtworks. “FAQ.” *Technology Radar*, n.d. https://www.thoughtworks.com/radar/faq

[10] Stasko, John, and Eugene Zhang. “Focus+Context Display and Navigation Techniques for Enhancing Radial, Space-Filling Hierarchy Visualizations.” *Proceedings of IEEE Information Visualization 2000*, 2000, pp. 57–65. https://web.engr.oregonstate.edu/~zhange/images/infovis00.pdf

[11] Neuron. “How to Create a Product Roadmap.” *Neuron Insights*, 2020-11-13, current Web text inspected. https://www.neuronux.com/post/how-to-create-a-product-roadmap

[12] Microsoft. “Safe deployment practices.” *Microsoft Learn, Azure DevOps*, n.d. https://learn.microsoft.com/en-us/devops/operate/safe-deployment-practices

[13] Microsoft. “VSTS — The Road to Continuous Delivery with Visual Studio Team Services.” *MSDN Magazine*, Connect issue, 2017. https://learn.microsoft.com/en-us/archive/msdn-magazine/2017/connect/vsts-the-road-to-continuous-delivery-with-visual-studio-team-services

[14] Boehm, Barry W. “A Spiral Model of Software Development and Enhancement.” *Computer* 21(5), 1988, pp. 61–72. https://www.cs.hmc.edu/~markk/SWE_copies/boehmspiral.pdf

[15] Cooper, Robert G. “Stage-gate systems: A new tool for managing new products.” *Business Horizons* 33(3), 1990, pp. 44–54. DOI: 10.1016/0007-6813(90)90040-I. Bibliographic record inspected; original full text not read. https://cir.nii.ac.jp/crid/1363670318303014400?lang=en

[16] Cooper, Robert G. “The Stage-Gate Model: An Overview.” *Stage-Gate International*, n.d. Current author-attributed explanation; not a substitute reading of the 1990 full text. https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/

## 日本語の要約

Sphere Board（スフィアボード）は、一つのプロジェクトの台帳 map.json を読み、工程と作業と判定の関係を描く、閲覧専用の地図である。中心から外へ工程順に同心の帯を配置し、作業の行を帯の中の珠として、公開・リリースに向けたゲートを各工程の外縁に置く。次の工程はその外側に続く。複数フェーズの場合は扇形に分かれ、工程順は各扇形の中で表される。

工程間の進行をゲートで管理する計画では、まだ通過していない最も内側の関連ゲートまでを、現在の到達範囲として読む。その外側は、間にあるゲートを越えると開ける範囲である。ただし、これは地図の読み方であり、v0.6.0 が外側を隠す、暗くする、作業を禁止する機能ではない。次に着手できる珠の印は台帳の Ready を表示するだけで、盤が着手可否を計算するものではない。その範囲では、前提（dependency）を満たし、妨げ（blocks）を一つずつ解消していき、残る条件も満たしたうえで ready=true を台帳に記録することで、新たに着手できる珠が生まれると読む。現在地の印は明示された現在地と未判定ゲートに付き、Ready の珠も現在地の印も複数あり得る。担い手は文字などで別に示される。

自動配置では、状態が変わっても珠の座標は変わらない。モデルでは形と補助印、または色で状態を表し、参照実装 v0.6.0 では形と補助印が変わる。同じ入力を同じ実装で処理すれば同じ配置になり、既存工程への作業追加は、構造を変えない限り他工程の珠を動かさない。派生作業は親の近くから外向きに枝を出し、予定工程は外側の点線の帯になる。編集は台帳側で行い、AIの担い手が作業ごとに更新案を作り、検証と人のレビューを経て反映する運用を想定するが、人による台帳の維持も排除しない。

双六、WBS、ガント、カンバン、Sphere Grid、知識グラフ、マインドマップ、Technology Radar、サンバースト、同心円ロードマップ、リング型デプロイ、スパイラルモデル、Stage-Gate と比較した。この比較は優劣ではなく、それぞれの表現が何を見せるかの違いを記録する。Sphere Grid の現在位置に基づく移動・近接ノードの活性化との対比では、Sphere Board の工程の進行は珠の隣接ではなく外縁ゲートで読む。特にデプロイの環は公開対象を広げる単位であり、Sphere Board（スフィアボード）の環はプロジェクトの工程順である。2026年10月7日に確認した13系統・16出典の範囲では、工程順の半径・外縁のゲート・帯内の作業を明示的に組み合わせた例を特定できなかった。網羅的な新規性調査ではなく、利用者評価も実施していない。本稿は構造の記録であり、有効性や優越性を主張しない。
