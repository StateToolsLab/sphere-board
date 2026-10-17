## Sphere Board workflow

このプロジェクトは `.sphere/map.json` を進行状態の共有台帳として使います。
作業前に `.sphere/WORKFLOW.md` と `.sphere/map.json` を読み、対象範囲と権限を確認してください。
作業後は証拠に基づく更新候補を作り、WORKFLOWに従って検証・競合確認後に反映してください。
人間の承認を代行せず、他者のcurrentを削除せず、座標・テーマと進捗状態を混同しないでください。
ファイル更新権限がない場合は候補と差分を返し、「更新済み」とは報告しないでください。

先にsourceの有無を確認する。source がある map には snapshot・apply を使わず、元の台帳側で更新する。直接管理する形式は sphere-starter/0.3。returnは派生→回収先で、差し戻しではない。
